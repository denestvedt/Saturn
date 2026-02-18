# Saturn Structure — Build Plan

Mobile-first PWA for ADHD users providing external structure through time-blocking, task management, habit tracking, timers, weekly planning, and accountability partners.

**Tech Stack:** Next.js 14+ (App Router) · TypeScript · Tailwind CSS · Supabase · PWA

---

## How to Use This File

- Check off `[x]` items as they are completed.
- New sessions should read this file first to understand current state before starting work.
- Update the **Current State** section when significant progress is made.

---

## Current State

**Last updated:** 2026-02-18

### Completed
- [x] Database: All 9 migrations run into Supabase (user confirmed 2026-02-18)
- [x] Supabase project configured (`vpextfeecrpwsdnpqvdh`)
- [x] MCP server connected (`.mcp.json`)

### Created (per prior session — confirm committed to repo)
- [ ] `package.json` (deps installed), `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.env.example`
- [ ] `middleware.ts` (Supabase auth session refresh + route protection)
- [ ] `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/manifest.ts`
- [ ] `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts`
- [ ] `src/types/database.ts`, `src/types/models.ts`
- [ ] `src/lib/utils/cn.ts`, `src/lib/constants.ts`
- [ ] `src/providers/supabase-provider.tsx`
- [ ] `src/components/ui/button.tsx` (partial)
- [ ] All `src/` subdirectories created, `public/icons/`, `supabase/migrations/`

---

## Database Schema (9 Tables + RLS)

- [x] `profiles` — extends auth.users; display_name, timezone, notification_preferences, onboarding_completed. Auto-created via trigger.
- [x] `lists` — user_id, name, color, icon, sort_order, is_inbox
- [x] `tasks` — user_id, list_id, title, description, is_completed, is_top_three, priority, due_date, scheduled_date, time_block_id, recurrence fields
- [x] `habits` — user_id, name, color, frequency JSONB, target_per_day, reminder_time, is_active
- [x] `habit_completions` — habit_id, user_id, completed_date, count (unique on habit_id+date)
- [x] `time_blocks` — user_id, title, start_time, end_time, color, category, task_ids[], recurrence fields
- [x] `weekly_plans` — user_id, week_start (Monday), goals JSONB, reflection, energy_rating, focus_areas
- [x] `partner_invites` — inviter_id, invitee_email, invite_token, status, expires_at
- [x] `partner_links` — user_a_id, user_b_id, sharing preferences JSONB + `get_partner_summary()` RPC
- [x] `timer_sessions` — user_id, duration_seconds, actual_seconds, type, task_id, time_block_id, reflection, started_at/ended_at
- [x] `push_subscriptions` — user_id, endpoint, keys JSONB
- [x] `routine_templates` — user_id (nullable for system), name, category, is_system, blocks JSONB
- [x] RLS policies on all tables
- [x] `get_partner_summary()` SECURITY DEFINER function

---

## Implementation Phases

### PASS 1 — Core

#### Phase 1: Foundation
- [ ] Scaffold Next.js with `create-next-app` (TypeScript, Tailwind, App Router, src dir)
- [ ] Install all dependencies (supabase, zustand, date-fns, lucide-react, dnd-kit, framer-motion, etc.)
- [ ] Configure Tailwind with ADHD-friendly design tokens (saturn color palette, 44px tap targets, card radius)
- [ ] Supabase clients: browser (`createBrowserClient`), server (`createServerClient` with cookies)
- [ ] Auth middleware (`middleware.ts`) for session refresh + route protection
- [ ] **Auth pages:** login, signup, forgot-password, auth callback route
- [ ] **App shell:** responsive layout — bottom nav (mobile <768px) + sidebar (desktop ≥768px)
- [ ] **UI primitives:** button, input, textarea, checkbox, badge, card, modal, drawer, skeleton, empty-state, progress-ring, toggle, dropdown, confirm-dialog

#### Phase 2: Tasks & Lists
- [ ] Tasks/lists CRUD hooks with optimistic updates
- [ ] Inbox capture (quick-add input, auto-focus)
- [ ] Task list with checkbox, title, due date badge
- [ ] Task editor drawer (mobile) / modal (desktop) — title, description, list, priority, due date, recurrence
- [ ] Recurring task config (daily/weekly/monthly, day-of-week selector)
- [ ] Auto-create Inbox list for new users on signup
- [ ] Tasks page with list tabs

#### Phase 3: Today View (Home)
- [ ] Server Component fetches today's blocks, top-3 tasks, remaining tasks, habit completions
- [ ] Next block card (current/upcoming block + supportive message)
- [ ] "Start next 10 minutes" focus button (large tap target, links to timer)
- [ ] Daily Top 3 checklist (3 slots, prompt to add if fewer)
- [ ] Remaining tasks (collapsed by default, count badge)
- [ ] Habit mini-grid (compact circles, tap to toggle)

#### Phase 4: Calendar & Time Blocks
- [ ] Time block CRUD hooks
- [ ] Day view: time column (6AM–11PM, 30-min slots), absolutely-positioned blocks
- [ ] Drag-and-drop via `@dnd-kit`: droppable slots, draggable blocks, vertical axis constraint
- [ ] Touch handling: 200ms delay activation (distinguish scroll from drag)
- [ ] "Now" line (red indicator, updates every 60s)
- [ ] Week view: 7 columns, compact blocks, tap day to switch to day view
- [ ] Quick-add popover on empty slot tap (title + duration presets + category)
- [ ] Block editor (full form in drawer/modal)

#### Phase 5: Habits
- [ ] Habits CRUD hooks
- [ ] Habit cards with today's status + current streak
- [ ] Weekly grid (7 columns, filled/empty circles per habit)
- [ ] Monthly heatmap (30-day grid, color intensity by completion count)
- [ ] Streak calculation utility (walks backwards from today, respects frequency schedule)
- [ ] Habit editor (name, color, frequency, reminder time)

#### Phase 6: Focus Timer
- [ ] Web Worker (`timer-worker.ts`) using `Date.now()` absolute reference (accurate when tab backgrounded)
- [ ] Worker ticks every 250ms, posts remaining seconds
- [ ] Zustand timer store (persists across page navigations)
- [ ] `useTimer` hook wrapping worker + store
- [ ] Preset picker (10/15/25/45/60 min), "Add 5 minutes" button
- [ ] Large circular progress ring display
- [ ] Start/Pause/Reset controls (large, tactile)
- [ ] End-of-timer prompt: "What did you accomplish?" with quick-select options
- [ ] Save `timer_sessions` to Supabase
- [ ] Completion sound + push notification

---

### PASS 2 — Expand

#### Phase 7: Weekly Planning
- [ ] Multi-step wizard: review → goals → blocks → summary
- [ ] Review step: last week stats, energy rating, reflection text
- [ ] Goals step: 3–5 weekly goals, focus areas
- [ ] Blocks step: apply routine template, adjust manually
- [ ] Summary step: overview + confirm + save `weekly_plans` record

#### Phase 8: Accountability Partner
- [ ] API routes: invite (create token, send email/link) + accept (validate token, create link)
- [ ] Partner page: invite form + connection status
- [ ] Partner view: limited dashboard via `get_partner_summary()` RPC
- [ ] Nudge button: send preset encouragement push notification

#### Phase 9: PWA & Notifications
- [ ] Web App Manifest (`manifest.ts`) — standalone display, Saturn branding, icons
- [ ] Service worker (`public/sw.js`): cache-first static, stale-while-revalidate pages, network-first API
- [ ] Offline fallback page
- [ ] PWA install prompt component
- [ ] Push subscription management
- [ ] API routes: subscribe + send notifications
- [ ] Cron route: scheduled reminders (upcoming blocks, daily start, weekly planning)

#### Phase 10: Seed Data, Polish & README
- [ ] `supabase/seed.sql`: "ADHD Starter Week", "Morning Routine", "Shutdown Routine" templates
- [ ] Responsive testing at 375px, 390px, 768px, 1280px
- [ ] PWA icons (SVG-based PNGs for all required sizes)
- [ ] README: setup, local dev, deploy, architecture docs
- [ ] `.env.example` with all required variables documented
- [ ] Final verification checklist (see below)

---

## Verification Checklist

- [ ] **Auth:** Sign up, log in, log out, session persistence across refresh
- [ ] **Tasks:** Create in inbox, move between lists, set recurrence, complete
- [ ] **Today:** Shows next block, top 3, habit grid; all interactive
- [ ] **Calendar:** Create blocks, drag to reschedule, now line visible
- [ ] **Habits:** Create, toggle daily, verify streaks, view heatmap
- [ ] **Timer:** Start 1-min timer, background tab 30s, verify accurate completion
- [ ] **Planning:** Complete full wizard, verify blocks generated on calendar
- [ ] **Partner:** Invite, accept, view limited data, send nudge
- [ ] **PWA:** Installable on Chrome/Safari, cached pages load offline
- [ ] **Responsive:** All pages tested at 375px, 768px, 1280px

---

## Project Structure (target)

```
src/
├── app/
│   ├── (auth)/          # login, signup, forgot-password, callback
│   ├── (app)/           # authenticated routes with app shell
│   │   ├── today/
│   │   ├── calendar/
│   │   ├── tasks/
│   │   ├── habits/
│   │   ├── plan/
│   │   ├── partner/
│   │   ├── timer/
│   │   └── settings/
│   └── api/             # notifications, partner, cron routes
├── components/
│   ├── ui/              # button, input, card, modal, drawer, etc.
│   ├── layout/          # app shell, bottom nav, sidebar, header
│   ├── today/
│   ├── calendar/
│   ├── tasks/
│   ├── habits/
│   ├── plan/
│   ├── partner/
│   └── timer/
├── lib/
│   ├── supabase/        # client.ts, server.ts, middleware.ts, admin.ts
│   ├── utils/           # cn.ts, dates.ts, time-blocks.ts, recurrence.ts, streaks.ts
│   ├── constants.ts
│   └── seed.ts
├── hooks/
├── stores/              # timer-store, ui-store, offline-queue (Zustand)
├── providers/
├── types/               # database.ts, models.ts, api.ts
└── workers/
    └── timer-worker.ts
```

---

## Key Architecture Decisions

- **Server Components by default** — `'use client'` only for interactivity (timers, drag-drop, checkboxes, forms)
- **Data pattern:** Server Component fetches → passes to Client Component as props → Client manages mutations via hooks
- **Navigation:** Mobile bottom nav (Today, Calendar, Tasks, Habits, More) / Desktop sidebar
- **Offline:** Service worker caches app shell; Zustand offline-queue replays mutations on reconnect

## ADHD Design Principles

- All tap targets minimum 44px, primary actions 56px+
- Maximum 3–5 items visible at once (progressive disclosure)
- Supportive copy ("3 tasks done — nice!" not "7 remaining")
- High contrast text (4.5:1 minimum), generous whitespace
- Presets everywhere to reduce decision fatigue
- Subtle framer-motion transitions only — nothing jarring
- Today view is always home — show what's happening NOW
