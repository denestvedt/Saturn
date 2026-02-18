-- ============================================
-- Saturn Structure PWA — Combined Migrations
-- Run this in the Supabase SQL Editor in one go
-- ============================================

-- ===========================================
-- 1. PROFILES
-- ===========================================

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  notification_preferences JSONB DEFAULT '{"push": true, "email": false, "reminder_minutes": 5}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- 2. LISTS & TASKS
-- ===========================================

CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT 'list',
  sort_order INTEGER DEFAULT 0,
  is_inbox BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user_id ON public.lists(user_id);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own lists" ON public.lists
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER lists_updated_at
  BEFORE UPDATE ON public.lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  list_id UUID REFERENCES public.lists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  is_top_three BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  due_date DATE,
  scheduled_date DATE,
  time_block_id UUID,
  sort_order INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB,
  recurrence_parent_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX idx_tasks_user_scheduled ON public.tasks(user_id, scheduled_date);
CREATE INDEX idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_user_top_three ON public.tasks(user_id, is_top_three) WHERE is_top_three = TRUE;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- 3. HABITS
-- ===========================================

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#10B981',
  icon TEXT DEFAULT 'check-circle',
  frequency JSONB NOT NULL DEFAULT '{"type": "daily", "days_of_week": [1,2,3,4,5,6,0]}'::jsonb,
  target_per_day INTEGER DEFAULT 1,
  reminder_time TIME,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON public.habits(user_id);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_habit_completions_unique ON public.habit_completions(habit_id, completed_date);
CREATE INDEX idx_habit_completions_user_date ON public.habit_completions(user_id, completed_date);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own habit completions" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 4. TIME BLOCKS
-- ===========================================

CREATE TABLE public.time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  color TEXT DEFAULT '#6366F1',
  category TEXT DEFAULT 'focus',
  is_completed BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB,
  recurrence_parent_id UUID REFERENCES public.time_blocks(id) ON DELETE SET NULL,
  task_ids UUID[] DEFAULT '{}',
  routine_template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_blocks_user_range ON public.time_blocks(user_id, start_time, end_time);
CREATE INDEX idx_time_blocks_user_date ON public.time_blocks(user_id, (start_time::date));

ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own time blocks" ON public.time_blocks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER time_blocks_updated_at
  BEFORE UPDATE ON public.time_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- 5. WEEKLY PLANS
-- ===========================================

CREATE TABLE public.weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  goals JSONB DEFAULT '[]'::jsonb,
  reflection TEXT,
  energy_rating INTEGER,
  focus_areas TEXT[],
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_weekly_plans_user_week ON public.weekly_plans(user_id, week_start);

ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own weekly plans" ON public.weekly_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER weekly_plans_updated_at
  BEFORE UPDATE ON public.weekly_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===========================================
-- 6. PARTNER SYSTEM
-- ===========================================

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

CREATE UNIQUE INDEX idx_partner_links_unique_pair
  ON public.partner_links(LEAST(user_a_id, user_b_id), GREATEST(user_a_id, user_b_id))
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

-- ===========================================
-- 7. TIMER SESSIONS
-- ===========================================

CREATE TABLE public.timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  actual_seconds INTEGER,
  type TEXT DEFAULT 'focus',
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  time_block_id UUID REFERENCES public.time_blocks(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  reflection TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timer_sessions_user_started ON public.timer_sessions(user_id, started_at);

ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own timer sessions" ON public.timer_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 8. PUSH SUBSCRIPTIONS
-- ===========================================

CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 9. ROUTINE TEMPLATES
-- ===========================================

CREATE TABLE public.routine_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'routine',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routine_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system and own templates" ON public.routine_templates
  FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.routine_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update their own templates" ON public.routine_templates
  FOR UPDATE USING (auth.uid() = user_id AND is_system = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete their own templates" ON public.routine_templates
  FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

CREATE TRIGGER routine_templates_updated_at
  BEFORE UPDATE ON public.routine_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
