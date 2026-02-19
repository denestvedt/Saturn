-- Seed system routine templates
INSERT INTO public.routine_templates (id, user_id, name, description, is_system, category, blocks) VALUES

-- ADHD Starter Week
(
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'ADHD Starter Week',
  'A structured daily schedule designed for ADHD brains. Alternates between focus blocks and breaks to maintain energy and attention throughout the day.',
  TRUE,
  'routine',
  '[
    {"title": "Morning Routine", "start_offset_minutes": 0, "duration_minutes": 45, "category": "routine", "color": "#F59E0B", "description": "Wake up, hydrate, light movement, and get ready for the day"},
    {"title": "Deep Focus Block", "start_offset_minutes": 60, "duration_minutes": 90, "category": "focus", "color": "#6366F1", "description": "Tackle your most important task while energy is highest"},
    {"title": "Break & Movement", "start_offset_minutes": 150, "duration_minutes": 15, "category": "break", "color": "#10B981", "description": "Step away from your desk, stretch, grab water"},
    {"title": "Admin & Communications", "start_offset_minutes": 165, "duration_minutes": 45, "category": "admin", "color": "#8B5CF6", "description": "Handle emails, messages, and quick tasks"},
    {"title": "Lunch & Recharge", "start_offset_minutes": 240, "duration_minutes": 60, "category": "break", "color": "#10B981", "description": "Eat mindfully and take a proper break from screens"},
    {"title": "Afternoon Focus Block", "start_offset_minutes": 300, "duration_minutes": 60, "category": "focus", "color": "#6366F1", "description": "Second focus session for project work or creative tasks"},
    {"title": "Shutdown Routine", "start_offset_minutes": 420, "duration_minutes": 30, "category": "routine", "color": "#F59E0B", "description": "Review accomplishments, plan tomorrow, tidy workspace"}
  ]'::jsonb
),

-- Morning Routine
(
  'a0000000-0000-0000-0000-000000000002',
  NULL,
  'Morning Routine',
  'A calm, structured morning routine to start the day with intention. Builds momentum through small wins before diving into work.',
  TRUE,
  'routine',
  '[
    {"title": "Wake Up & Make Bed", "start_offset_minutes": 0, "duration_minutes": 5, "category": "routine", "color": "#F59E0B", "description": "First win of the day - make your bed immediately"},
    {"title": "Hydrate", "start_offset_minutes": 5, "duration_minutes": 5, "category": "routine", "color": "#06B6D4", "description": "Drink a full glass of water before anything else"},
    {"title": "Light Movement", "start_offset_minutes": 10, "duration_minutes": 15, "category": "routine", "color": "#10B981", "description": "Stretching, yoga, or a short walk to wake up your body"},
    {"title": "Journal", "start_offset_minutes": 25, "duration_minutes": 10, "category": "routine", "color": "#8B5CF6", "description": "Brain dump thoughts, gratitude, or morning pages"},
    {"title": "Review Today''s Plan", "start_offset_minutes": 35, "duration_minutes": 10, "category": "routine", "color": "#6366F1", "description": "Check your Top 3 tasks, calendar, and time blocks for today"},
    {"title": "Get Ready", "start_offset_minutes": 45, "duration_minutes": 30, "category": "routine", "color": "#F59E0B", "description": "Shower, get dressed, and prepare for the day ahead"}
  ]'::jsonb
),

-- Shutdown Routine
(
  'a0000000-0000-0000-0000-000000000003',
  NULL,
  'Shutdown Routine',
  'An end-of-day routine to close open loops, celebrate wins, and set yourself up for a productive tomorrow. Helps your brain transition out of work mode.',
  TRUE,
  'routine',
  '[
    {"title": "Review Accomplishments", "start_offset_minutes": 0, "duration_minutes": 10, "category": "routine", "color": "#10B981", "description": "Look at what you completed today. Celebrate wins, note what moved forward"},
    {"title": "Set Tomorrow''s Top 3", "start_offset_minutes": 10, "duration_minutes": 10, "category": "routine", "color": "#6366F1", "description": "Choose your three most important tasks for tomorrow"},
    {"title": "Tidy Workspace", "start_offset_minutes": 20, "duration_minutes": 10, "category": "routine", "color": "#F59E0B", "description": "Clear your desk, close browser tabs, organize files"},
    {"title": "Shutdown Ritual", "start_offset_minutes": 30, "duration_minutes": 5, "category": "routine", "color": "#8B5CF6", "description": "Say \"shutdown complete\" - a verbal cue that work is done for the day"}
  ]'::jsonb
);
