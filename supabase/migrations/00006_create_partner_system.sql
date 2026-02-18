-- Partner invites table
CREATE TABLE public.partner_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own invites" ON public.partner_invites
  FOR ALL USING (auth.uid() = inviter_id) WITH CHECK (auth.uid() = inviter_id);

-- Partner links table
CREATE TABLE public.partner_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_id UUID REFERENCES public.partner_invites(id),
  is_active BOOLEAN DEFAULT TRUE,
  user_a_shares JSONB DEFAULT '{"tasks_completed": true, "habits": true, "streaks": true}'::jsonb,
  user_b_shares JSONB DEFAULT '{"tasks_completed": true, "habits": true, "streaks": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to enforce canonical ordering: always store the smaller UUID in user_a_id.
-- This lets us use a plain unique index instead of LEAST/GREATEST (which are not IMMUTABLE).
CREATE OR REPLACE FUNCTION public.normalize_partner_link_order()
RETURNS TRIGGER AS $$
DECLARE
  temp UUID;
BEGIN
  IF NEW.user_a_id > NEW.user_b_id THEN
    temp          := NEW.user_a_id;
    NEW.user_a_id := NEW.user_b_id;
    NEW.user_b_id := temp;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_partner_link_order
  BEFORE INSERT ON public.partner_links
  FOR EACH ROW EXECUTE FUNCTION public.normalize_partner_link_order();

CREATE UNIQUE INDEX idx_partner_links_unique_pair
  ON public.partner_links(user_a_id, user_b_id)
  WHERE is_active = TRUE;

ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view their links" ON public.partner_links
  FOR SELECT USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Partners can update their links" ON public.partner_links
  FOR UPDATE USING (auth.uid() = user_a_id OR auth.uid() = user_b_id)
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Function to get partner summary
CREATE OR REPLACE FUNCTION public.get_partner_summary(partner_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  current_user_id UUID;
  partnership_exists BOOLEAN;
BEGIN
  current_user_id := auth.uid();

  -- Verify active partnership exists
  SELECT EXISTS(
    SELECT 1 FROM public.partner_links
    WHERE is_active = TRUE
      AND (
        (user_a_id = current_user_id AND user_b_id = partner_user_id)
        OR (user_a_id = partner_user_id AND user_b_id = current_user_id)
      )
  ) INTO partnership_exists;

  IF NOT partnership_exists THEN
    RAISE EXCEPTION 'No active partnership found with this user';
  END IF;

  SELECT jsonb_build_object(
    'display_name', p.display_name,
    'tasks_completed_today', (
      SELECT COUNT(*) FROM public.tasks
      WHERE user_id = partner_user_id
        AND is_completed = TRUE
        AND completed_at::date = CURRENT_DATE
    ),
    'habits_completed_today', (
      SELECT COUNT(*) FROM public.habit_completions
      WHERE user_id = partner_user_id
        AND completed_date = CURRENT_DATE
    ),
    'current_streaks', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'habit_name', h.name,
        'streak', streak_count.streak
      )), '[]'::jsonb)
      FROM public.habits h
      INNER JOIN LATERAL (
        SELECT COUNT(*) AS streak
        FROM generate_series(0, 30) AS d(day_offset)
        WHERE EXISTS (
          SELECT 1 FROM public.habit_completions hc
          WHERE hc.habit_id = h.id
            AND hc.completed_date = CURRENT_DATE - d.day_offset
        )
        AND (d.day_offset = 0 OR EXISTS (
          SELECT 1 FROM public.habit_completions hc
          WHERE hc.habit_id = h.id
            AND hc.completed_date = CURRENT_DATE - d.day_offset + 1
        ))
      ) streak_count ON TRUE
      WHERE h.user_id = partner_user_id
        AND h.is_active = TRUE
        AND streak_count.streak > 0
    )
  ) INTO result
  FROM public.profiles p
  WHERE p.id = partner_user_id;

  RETURN result;
END;
$$;
