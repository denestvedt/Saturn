-- Time blocks table
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
