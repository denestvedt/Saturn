-- Habits table
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

-- Habit completions table
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
