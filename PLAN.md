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

**PASS 1 (Core) is complete.** Phases 1–7 are fully implemented and committed.

**What's left:**
- Phase 8: API routes for partner invites + push notification sending (partial — partner page UI exists)
- Phase 9: PWA install prompt, push subscription management, API routes for notifications, cron reminders, push event handler in service worker
- Phase 10: PWA icons, README polish, responsive verification

---

## Database Schema (9 Tables + RLS) ✅ ALL DONE

- [x] All 9 migrations run into Supabase (confirmed 2026-02-18)
- [x] `profiles` — auto-created via signup trigger
- [x] `lists`, `tasks` (with recurrence fields)
- [x] `habits`, `habit_completions`
- [x] `time_blocks` (with recurrence fields)
- [x] `weekly_plans`
- [x] `partner_invites`, `partner_links` + `get_partner_summary()` RPC
- [x] `timer_sessions`
- [x] `push_subscriptions`
- [x] `routine_templates` (system + user)
- [x] RLS policies on all tables
- [x] `supabase/seed.sql` — "ADHD Starter Week", "Morning Routine", "Shutdown Routine"

---

## Implementation Phases

### PASS 1 — Core ✅ COMPLETE

#### Phase 1: Foundation ✅
- [x] `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.env.example`
- [x] Tailwind `globals.css` with ADHD-friendly design tokens (saturn palette, 44px tap targets)
- [x] Supabase clients: `src/lib/supabase/client.ts`, `server.ts`, `admin.ts`, `middleware.ts`
- [x] Auth middleware: `middleware.ts` (session refresh + route protection)
- [x] Auth pages: `login`, `signup`, `forgot-password`, auth `callback` route
- [x] App shell: `app-shell.tsx`, `bottom-nav.tsx` (mobile), `sidebar.tsx` (desktop), `header.tsx`
- [x] UI primitives: `button`, `input`, `textarea`, `checkbox`, `badge`, `card`, `modal`, `drawer`, `skeleton`, `empty-state`, `progress-ring`, `toggle`, `dropdown`, `confirm-dialog`
- [x] `src/app/layout.tsx`, `src/app/page.tsx` (redirects to /today or /login)
- [x] `src/app/manifest.ts` (PWA manifest), `src/app/offline/page.tsx`
- [x] Providers: `supabase-provider.tsx`
- [x] Types: `database.ts`, `models.ts`
- [x] Utils: `cn.ts`, `dates.ts`, `time-blocks.ts`, `recurrence.ts`, `streaks.ts`
- [x] Constants: `src/lib/constants.ts`
- [x] Stores: `timer-store.ts`, `ui-store.ts`

#### Phase 2: Tasks & Lists ✅
- [x] `use-tasks.ts`, `use-lists.ts` (CRUD hooks with optimistic updates)
- [x] `inbox-capture.tsx` (quick-add, auto-focus)
- [x] `task-item.tsx`, `task-list.tsx` (checkbox, title, due date badge)
- [x] `task-editor.tsx` (drawer/modal — title, description, list, priority, due date, recurrence)
- [x] `recurring-config.tsx` (daily/weekly/monthly, day-of-week selector)
- [x] `list-selector.tsx`
- [x] `src/app/(app)/tasks/page.tsx` (with list tabs)

#### Phase 3: Today View ✅
- [x] `next-block-card.tsx` (current/upcoming block + supportive message)
- [x] `focus-button.tsx` (large tap target, links to timer)
- [x] `daily-top-three.tsx` (3 slots, prompt if fewer)
- [x] `remaining-tasks.tsx` (collapsed, count badge)
- [x] `habit-mini-grid.tsx` (compact circles, tap to toggle)
- [x] `src/app/(app)/today/page.tsx`

#### Phase 4: Calendar & Time Blocks ✅
- [x] `use-time-blocks.ts` (CRUD hooks)
- [x] Day view with time column (6AM–11PM, 30-min slots)
- [x] Drag-and-drop via `@dnd-kit` (vertical axis, 200ms touch delay)
- [x] `now-line.tsx` (red indicator, updates every 60s)
- [x] Week view (7 columns, compact blocks)
- [x] `quick-add-block.tsx` (popover on empty slot tap)
- [x] `block-editor.tsx` (full form in drawer/modal)
- [x] `time-block.tsx`, `time-slot.tsx`
- [x] `src/app/(app)/calendar/page.tsx`

#### Phase 5: Habits ✅
- [x] `use-habits.ts` (CRUD hooks)
- [x] `habit-card.tsx` (today status + streak)
- [x] `weekly-grid.tsx` (7 columns, filled/empty circles)
- [x] `monthly-heatmap.tsx` (30-day grid, color intensity)
- [x] `streak-badge.tsx`
- [x] `src/lib/utils/streaks.ts` (streak calculation)
- [x] `src/app/(app)/habits/page.tsx` (with habit editor)

#### Phase 6: Focus Timer ✅
- [x] `src/workers/timer-worker.ts` (Web Worker, `Date.now()` absolute, 250ms tick)
- [x] `src/stores/timer-store.ts` (Zustand, persists across navigations)
- [x] `use-timer.ts` (wraps worker + store)
- [x] `preset-picker.tsx` (10/15/25/45/60 min, "Add 5 min")
- [x] `timer-display.tsx` (large circular progress ring)
- [x] `timer-controls.tsx` (Start/Pause/Reset, large tap targets)
- [x] `end-prompt.tsx` ("What did you accomplish?" quick-select)
- [x] `src/app/(app)/timer/page.tsx`

#### Phase 7: Weekly Planning ✅
- [x] Multi-step planning flow (review → goals → blocks → summary)
- [x] Goals management (add/remove weekly goals)
- [x] Energy rating (1–5)
- [x] Reflection textarea
- [x] Focus areas (add/remove)
- [x] Week navigation (prev/next)
- [x] Saves `weekly_plans` record to Supabase
- [x] `src/app/(app)/plan/page.tsx` (all implemented inline)

---

### PASS 2 — Expand

#### Phase 8: Accountability Partner ⚠️ PARTIAL
- [x] `src/app/(app)/partner/page.tsx` — invite form, connection status, partner summary view, nudge button (all inline, 297 lines)
- [x] Invite link creation + copy-to-clipboard (client-side token, no email sending yet)
- [x] Partner unlink with confirm dialog
- [ ] **`src/app/api/partner/invite/route.ts`** — server-side: create token in DB, send invite email
- [ ] **`src/app/api/partner/accept/route.ts`** — validate token, create `partner_links` record
- [ ] Verify `get_partner_summary()` RPC is wired into partner page

#### Phase 9: PWA & Notifications ⚠️ PARTIAL
- [x] `public/sw.js` — cache-first static, network-first navigation, offline fallback
- [x] `src/app/manifest.ts` — standalone display, Saturn branding
- [x] `src/app/offline/page.tsx`
- [ ] Push event handler in `sw.js` (handle incoming push messages, show notification)
- [ ] PWA install prompt component (`src/components/ui/pwa-install-prompt.tsx`)
- [ ] Push subscription management (`src/hooks/use-push-notifications.ts`)
- [ ] **`src/app/api/notifications/subscribe/route.ts`** — save push subscription to DB
- [ ] **`src/app/api/notifications/send/route.ts`** — send push notification via Web Push
- [ ] **`src/app/api/cron/reminders/route.ts`** — scheduled: upcoming blocks, daily start, weekly planning prompt
- [ ] `src/stores/offline-queue.ts` (Zustand offline mutation queue for replay on reconnect)

#### Phase 10: Seed Data, Polish & README ⚠️ PARTIAL
- [x] `supabase/seed.sql` — routine templates seeded
- [ ] PWA icons — generate all required sizes and place in `public/icons/` (update manifest)
- [ ] `README.md` — setup, local dev, deploy, architecture
- [ ] Responsive verification at 375px, 390px, 768px, 1280px

---

## Verification Checklist

- [ ] **Auth:** Sign up, log in, log out, session persistence across refresh
- [ ] **Tasks:** Create in inbox, move between lists, set recurrence, complete
- [ ] **Today:** Shows next block, top 3, habit grid; all interactive
- [ ] **Calendar:** Create blocks, drag to reschedule, now line visible
- [ ] **Habits:** Create, toggle daily, verify streaks, view heatmap
- [ ] **Timer:** Start 1-min timer, background tab 30s, verify accurate completion
- [ ] **Planning:** Set goals, energy rating, reflection; saves week plan
- [ ] **Partner:** Invite, accept, view limited data, send nudge
- [ ] **PWA:** Installable on Chrome/Safari, cached pages load offline
- [ ] **Responsive:** All pages tested at 375px, 768px, 1280px

---

## Project Structure (as built)

```
src/
├── app/
│   ├── (auth)/          # login, signup, forgot-password, callback ✅
│   ├── (app)/           # authenticated routes ✅
│   │   ├── today/       ✅
│   │   ├── calendar/    ✅
│   │   ├── tasks/       ✅
│   │   ├── habits/      ✅
│   │   ├── plan/        ✅
│   │   ├── partner/     ✅ (UI only — API routes missing)
│   │   ├── timer/       ✅
│   │   └── settings/    ✅
│   ├── api/             ❌ MISSING — partner invite, notifications, cron
│   └── offline/         ✅
├── components/
│   ├── ui/              ✅ all primitives
│   ├── layout/          ✅ app-shell, bottom-nav, sidebar, header
│   ├── today/           ✅
│   ├── calendar/        ✅
│   ├── tasks/           ✅
│   ├── habits/          ✅
│   ├── timer/           ✅
│   ├── plan/            — (wizard inline in page, no separate components needed)
│   └── partner/         — (UI inline in page)
├── lib/
│   ├── supabase/        ✅ client, server, admin, middleware
│   └── utils/           ✅ cn, dates, time-blocks, recurrence, streaks
├── hooks/               ✅ use-tasks, use-lists, use-time-blocks, use-habits, use-timer, use-media-query
├── stores/              ✅ timer-store, ui-store | ❌ offline-queue missing
├── providers/           ✅ supabase-provider | ❌ notification-provider missing
├── types/               ✅ database.ts, models.ts
└── workers/             ✅ timer-worker.ts
public/
├── sw.js                ✅ (missing push handler)
└── icons/               ❌ MISSING — PWA icons
supabase/
├── migrations/          ✅ all 9
└── seed.sql             ✅
```

---

## Key Architecture Decisions

- **Server Components by default** — `'use client'` only for interactivity (timers, drag-drop, checkboxes, forms)
- **Data pattern:** Server Component fetches → passes to Client Component as props → Client manages mutations via hooks
- **Navigation:** Mobile bottom nav (Today, Calendar, Tasks, Habits, More) / Desktop sidebar
- **Offline:** Service worker caches app shell; Zustand offline-queue stores mutations for replay on reconnect

## ADHD Design Principles

- All tap targets minimum 44px, primary actions 56px+
- Maximum 3–5 items visible at once (progressive disclosure)
- Supportive copy ("3 tasks done — nice!" not "7 remaining")
- High contrast text (4.5:1 minimum), generous whitespace
- Presets everywhere to reduce decision fatigue
- Subtle framer-motion transitions only — nothing jarring
- Today view is always home — show what's happening NOW
