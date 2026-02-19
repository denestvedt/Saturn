-- Lists table
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

-- Tasks table
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
