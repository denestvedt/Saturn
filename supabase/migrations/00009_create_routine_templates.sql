-- Routine templates table
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

-- Users can view system templates and their own templates
CREATE POLICY "Users can view system and own templates" ON public.routine_templates
  FOR SELECT USING (is_system = TRUE OR auth.uid() = user_id);

-- Users can insert their own non-system templates
CREATE POLICY "Users can insert their own templates" ON public.routine_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Users can update their own non-system templates
CREATE POLICY "Users can update their own templates" ON public.routine_templates
  FOR UPDATE USING (auth.uid() = user_id AND is_system = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Users can delete their own non-system templates
CREATE POLICY "Users can delete their own templates" ON public.routine_templates
  FOR DELETE USING (auth.uid() = user_id AND is_system = FALSE);

CREATE TRIGGER routine_templates_updated_at
  BEFORE UPDATE ON public.routine_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
