-- Weekly plans table
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
