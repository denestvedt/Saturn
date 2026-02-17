-- Timer sessions table
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
