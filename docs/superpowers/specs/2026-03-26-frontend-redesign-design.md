# Frontend Redesign — DANB CDA Practice Exam Platform

## Overview

Complete frontend redesign of the DANB CDA practice exam platform. Rewrite all UI components, layout system, and page designs while preserving the existing data layer (Zustand stores, data loaders, API routes). Add progress tracking and weak-area recommendations as new features.

**Approach:** Component-level rewrite (Approach B). Keep existing routes, stores, and data layer. Rewrite layout shell and all page/component UI. Add new progress store and recommendation engine.

**Target audience:** Dental assistant students studying for their CDA exam — younger, tech-comfortable, spending long sessions studying.

## Design System

### Color Palette — Sky Blue

| Token | Light | Dark |
|-------|-------|------|
| Primary | Sky 500 `#0ea5e9` | Sky 400 `#38bdf8` |
| Primary hover | Sky 600 `#0284c7` | Sky 300 `#7dd3fc` |
| Primary light bg | Sky 50 `#f0f9ff` | Sky 950 `#082f49` |
| Primary muted | Sky 100 `#e0f2fe` | Sky 900 `#0c4a6e` |
| Correct/Pass | Green 500 `#22c55e` | Green 400 `#4ade80` |
| Incorrect/Fail | Red 500 `#ef4444` | Red 400 `#f87171` |
| Flagged/Warning | Amber 500 `#f59e0b` | Amber 400 `#fbbf24` |
| Page bg | White `#ffffff` | Slate 950 `#020617` |
| Card/surface | White `#ffffff` | Slate 900 `#0f172a` |
| Elevated surface | Slate 50 `#f8fafc` | Slate 800 `#1e293b` |
| Border | Slate 200 `#e2e8f0` | Slate 700 `#334155` |
| Primary text | Slate 900 `#0f172a` | Slate 100 `#f1f5f9` |
| Secondary text | Slate 500 `#64748b` | Slate 400 `#94a3b8` |

No gradients. Solid colors throughout.

### Typography

- **Primary font:** Open Sans (replaces Geist Sans)
- **Monospace:** Geist Mono (timer displays, code-like content)
- Larger headings on dashboard/home, tighter body text in dense views (exam session, learn phases)

### Shape & Elevation

- Border radius: 8px buttons, 12px cards
- Shadows: Minimal — subtle card elevation on hover only, no heavy drop shadows
- Clean and flat aesthetic

### Dark Mode

- CSS custom properties with light/dark values (OKLCH approach)
- `next-themes` class strategy with toggle in navbar
- No separate component variants — purely a token swap
- Dark backgrounds: Slate 950 (page), Slate 900 (cards), Slate 800 (elevated)
- Primary shifts to Sky 400 for contrast
- Semantic colors use lighter variants (green-400, red-400, amber-400)

### Domain Color Coding

Each exam domain gets a consistent accent color used across the entire app:
- **GC (General Chairside):** Sky/Blue
- **RHS (Radiation Health & Safety):** Green
- **ICE (Infection Control):** Amber

## Layout Shell

### Top Navbar (always visible)
- Left: Logo / app name
- Center: Main nav links — Dashboard, Practice, Learn
- Right: Theme toggle (light/dark)
- Sticky, full-width

### Contextual Sidebar (exam & learn sessions only)
- Left side, collapsible
- Exam session: Question grid (numbered squares, color-coded by status)
- Learn session: Phase stepper (vertical, with icons and checkmarks)
- Mobile: Collapses into a sheet/drawer triggered from the top bar

### Content Area
- Responsive, max-width constrained, generous padding

## Pages

### Dashboard / Home (`/`)

Replaces the current tabs page. Oriented around student progress and next actions.

Sections top to bottom:
1. **Welcome header** — "Welcome back" with motivational subtitle
2. **Overall progress bar** — Single horizontal bar showing combined CDA readiness. Color-coded segments for GC (blue), RHS (green), ICE (amber)
3. **Quick actions row** — Three cards:
   - "Continue Learning" — resumes last incomplete session or suggests next
   - "Take a Practice Exam" — picks up where they left off or starts fresh
   - "Review Weak Areas" — jumps to recommendations
4. **Domain progress cards** — Three cards (GC, RHS, ICE), each with: completion % arc, best exam score, sessions completed count, domain color accent
5. **Weak area callout** — Soft blue banner with specific recommendation if data shows weak spots. Hidden if no data.
6. **Recent activity** — Last 3-5 items with timestamps

**First-time experience:** Domain cards show "Not started", quick actions emphasize getting started, weak area callout hidden.

### Practice Exam Selection (`/practice`)

Dedicated page (replaces tab on home).

- Three exam cards (GC, RHS, ICE) in a row:
  - Domain color accent (left border or top stripe)
  - Question count, time limit, passing score
  - Best score badge if taken before
  - Expandable "Instructions" accordion — no separate instructions page
  - "Start Exam" button on the card
- Below cards: "Past Attempts" section showing last 3 scores per type

**Route change:** Exam instructions page (`/exam/[examType]`) is eliminated. Instructions fold into the selection card.

### Exam Session (`/exam/[examType]/session`)

- **Top bar** (sticky): Timer left, "Q 12/95" center, submit button right
- **Contextual sidebar** (left, collapsible on mobile):
  - Question grid — color-coded: empty (unanswered), primary fill (answered), amber outline (flagged)
  - Answered/total count, flagged count with quick-jump
- **Main content:**
  - Question text (larger font, good line height)
  - Radio options as full-width clickable cards — selected state uses primary blue fill
  - Flag toggle below options
- **Bottom bar:** Previous / Next with keyboard shortcut hints
- **Mobile:** Sidebar becomes sheet/drawer

### Exam Results (`/exam/[examType]/results`)

- **Score hero:** Large score % with pass/fail. Green ring animation if passed, red if not.
- **Domain breakdown:** Per-domain scores as horizontal bars (if sub-domains available)
- **Question review:** Expandable list — question, your answer (green/red), correct answer, explanation. Filterable: All / Incorrect / Flagged
- **Actions:** Retake Exam, Back to Practice, Review Weak Areas
- Result persisted to progress store on completion

### Learn Selection (`/learn`)

Dedicated page.

- Three domain cards (GC, RHS, ICE):
  - Domain color accent
  - Session completion count (e.g., "8/18 completed")
  - Progress bar
  - "Continue" or "Start" button
- Weak-area recommendation callout below if applicable

### Domain Sessions List (`/learn/[domain]`)

- Header: Domain name, overall progress bar
- Sessions as vertical card stack (not grid — conveys sequential order):
  - Title, brief description
  - Status badge: completed (with date) / in-progress / not started
  - "Recommended" badge for weak-area suggestions
  - "Due for review" badge for sessions completed > 7 days ago
- Sessions grouped by topic cluster if natural grouping exists

### Learning Session (`/learn/session/[sessionId]`)

- **Contextual sidebar** (left, collapsible):
  - Phase stepper — vertical with icons for all 7 phases: Pre-Test, Content Review, Elaboration, Scenario, Interleaved Practice, Teach-Back, SRS Schedule
  - Current phase highlighted primary blue, completed phases checkmarked
  - Can click back to completed phases, not forward
- **Main content:**
  - Phase title and instruction text at top
  - Phase-specific content below
  - "Continue" button to advance
  - Inline answer feedback (correct/incorrect with explanation)
- **Teach-Back phase:**
  - Text area for response
  - "Submit for Review" with loading state
  - AI feedback as styled card: accuracy, completeness, feedback text, missed concepts as tags
- **SRS Schedule phase (final):**
  - Summary of what was learned
  - Suggested review dates (1 day, 3 days, 7 days)
  - "Complete Session" button → marks done in progress store, returns to domain list

## New Features

### Progress Store

Zustand store persisted to **localStorage** (not sessionStorage — progress must survive across browser sessions).

**Stored data:**
- `examAttempts`: Array of `{ examType, date, score, totalQuestions, domainBreakdown }`
- `sessionCompletions`: Map of `sessionId → { completedDate, domain, preTestScore, teachBackScore }`

**Derived data (computed, not stored):**
- Per-domain: best score, average score, sessions completed/total, overall %
- Combined CDA readiness percentage

**Integration points:**
- Exam results page writes on completion
- Learn session SRS phase writes on "Complete Session"
- Dashboard reads for display
- Domain session list reads for completion badges

### Recommendations Engine

Pure function, no store.

**Input:** Progress store data
**Output:** Ordered list of recommended sessions with reasons

**Logic:**
1. Domains where best exam score < 75% → highest priority, recommend uncompleted sessions
2. Sessions completed > 7 days ago → "due for review" badge
3. All done and passing → suggest retaking oldest exam

Each recommendation includes a `reason` string (e.g., "You scored 58% on Radiation Safety" or "Completed 12 days ago — due for review").

## Route Changes

| Current | New | Notes |
|---------|-----|-------|
| `/` (tabs) | `/` (dashboard) | Complete redesign |
| — | `/practice` | New dedicated page |
| `/exam/[examType]` (instructions) | Eliminated | Folded into selection card |
| `/exam/[examType]/session` | `/exam/[examType]/session` | Unchanged route, new UI |
| `/exam/[examType]/results` | `/exam/[examType]/results` | Unchanged route, new UI |
| — | `/learn` | New dedicated page |
| `/learn/[domain]` | `/learn/[domain]` | Unchanged route, new UI |
| `/learn/session/[sessionId]` | `/learn/session/[sessionId]` | Unchanged route, new UI |

## What We Keep (Not Rewriting)

- Zustand exam store (`stores/exam-store.ts`) — session state management
- Zustand learn store (`stores/learn-store.ts`) — learn phase state
- Question loader (`lib/question-loader.ts`) — data loading and shuffling
- Session loader (`lib/session-loader.ts`) — learn session data
- Exam config (`lib/exam-config.ts`) — exam parameters
- Scoring logic (`lib/scoring.ts`) — answer evaluation
- API route (`api/evaluate-teachback`) — AI teach-back evaluation
- All data files (`data/`) — questions and session content
- Type definitions (`types/`) — existing types (extend as needed)

## What We Rewrite

- `app/globals.css` — new design tokens, color palette, dark mode variables
- `app/layout.tsx` — new layout shell with navbar
- `app/page.tsx` — dashboard replacing tabs
- All `app/exam/` pages — new UI
- All `app/learn/` pages — new UI
- All `components/ui/` — restyle shadcn components to match new design
- All `components/exam/` — new exam UI components
- All `components/learn/` — new learn UI components

## What We Add

- `stores/progress-store.ts` — new progress tracking store
- `lib/recommendations.ts` — recommendation engine
- `app/practice/page.tsx` — new practice selection page
- `app/learn/page.tsx` — new learn selection page
- Navbar component
- Contextual sidebar component
- Domain progress card component
- Various new UI subcomponents
