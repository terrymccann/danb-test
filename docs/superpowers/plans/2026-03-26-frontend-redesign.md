# Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete frontend redesign of the DANB CDA platform — new design system, layout shell, all pages rewritten, plus progress tracking and recommendations engine.

**Architecture:** Component-level rewrite preserving existing data layer (stores, loaders, API routes, types). New layout shell (navbar + contextual sidebar), new design tokens (Sky Blue palette, Open Sans), new progress store with localStorage persistence, pure-function recommendation engine.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand, shadcn/ui (restyled), next-themes, Open Sans (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-03-26-frontend-redesign-design.md`

---

## Dependency Graph

```
Task 1 (Design System) ──┬──→ Task 3 (Layout Shell) ──┬──→ Task 5 (Dashboard)
                          │                             ├──→ Task 6 (Practice Exam Flow)
Task 2 (Progress Store) ──┘                             └──→ Task 7 (Learn Mode Flow)

Task 4 (Practice Page + Route) — can run after Task 1, merges into Task 6
```

Tasks 5, 6, 7 are independent of each other and can be parallelized.

---

## Task 1: Design System Foundation

**Files:**
- Modify: `app/globals.css` (full rewrite of CSS custom properties)
- Modify: `app/layout.tsx` (swap Geist Sans for Open Sans)
- Modify: `package.json` (no new deps needed — Open Sans via next/font/google)
- Modify: `components/ui/button.tsx` (restyle to Sky Blue primary)
- Modify: `components/ui/card.tsx` (restyle borders, radius, shadows)
- Modify: `components/ui/badge.tsx` (add domain color variants)
- Modify: `components/ui/progress.tsx` (restyle with Sky Blue fill)
- Modify: `components/ui/tabs.tsx` (restyle active states)
- Modify: `components/ui/radio-group.tsx` (restyle for clickable card options)
- Modify: `components/ui/separator.tsx` (update color token)

- [ ] **Step 1: Replace font in layout.tsx**

In `app/layout.tsx`, replace Geist Sans import with Open Sans:

```tsx
import { Open_Sans } from "next/font/google"
import { Geist_Mono } from "next/font/google"

const fontSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})
```

Keep Geist_Mono for monospace. Update the className on `<html>` if needed.

- [ ] **Step 2: Rewrite globals.css color tokens**

Replace the existing CSS custom properties in `app/globals.css` with the Sky Blue palette. Use OKLCH color space to match the existing approach. Define both `:root` (light) and `.dark` (dark) token sets.

Key mappings:
- `--primary`: Sky 500 `#0ea5e9` (light) / Sky 400 `#38bdf8` (dark)
- `--primary-foreground`: White (light) / Slate 950 (dark)
- `--background`: White (light) / Slate 950 `#020617` (dark)
- `--foreground`: Slate 900 `#0f172a` (light) / Slate 100 `#f1f5f9` (dark)
- `--card`: White (light) / Slate 900 `#0f172a` (dark)
- `--muted`: Slate 100 (light) / Slate 800 (dark)
- `--muted-foreground`: Slate 500 (light) / Slate 400 (dark)
- `--border`: Slate 200 `#e2e8f0` (light) / Slate 700 `#334155` (dark)
- `--destructive`: Red 500 (light) / Red 400 (dark)
- `--accent`: Sky 50 (light) / Sky 950 (dark)
- `--ring`: Sky 500 (light) / Sky 400 (dark)

Add new custom properties for domain colors:
- `--domain-gc`: Sky 500 / Sky 400
- `--domain-rhs`: Green 500 `#22c55e` / Green 400 `#4ade80`
- `--domain-ice`: Amber 500 `#f59e0b` / Amber 400 `#fbbf24`

Add semantic status colors:
- `--success`: Green 500 / Green 400
- `--warning`: Amber 500 / Amber 400
- `--error`: Red 500 / Red 400

Set `--radius` to `0.75rem` (12px for cards) and add `--radius-sm: 0.5rem` (8px for buttons).

- [ ] **Step 3: Restyle shadcn UI components**

Update each component to use the new tokens:

**button.tsx:** Primary variant should use `bg-primary text-primary-foreground hover:bg-primary/90`. Border radius `rounded-lg` (8px). Ensure outline variant uses Sky Blue ring.

**card.tsx:** Use `rounded-xl` (12px), `border border-border`, hover state adds subtle `shadow-sm` transition. No heavy shadows.

**badge.tsx:** Add domain color variants: `domain-gc`, `domain-rhs`, `domain-ice` using the CSS custom properties. Also add `success`, `warning`, `error` variants.

**progress.tsx:** Fill color uses `bg-primary`. Add a `variant` prop for domain colors (gc/rhs/ice).

**tabs.tsx:** Active tab uses primary underline or filled background. Inactive uses muted foreground.

**radio-group.tsx:** Style as full-width clickable cards. Selected state: `border-primary bg-primary/5`. Hover state: `border-primary/50`. Rounded-lg.

**separator.tsx:** Uses `bg-border` token.

- [ ] **Step 4: Verify light and dark mode**

Run `npm run dev`. Check:
- Light mode: white background, Sky Blue primary, Slate text
- Dark mode: Slate 950 background, Sky 400 primary, light text
- Toggle using 'D' hotkey
- All restyled components render correctly in both modes

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx components/ui/
git commit -m "feat(design): new Sky Blue design system with Open Sans"
```

---

## Task 2: Progress Store & Recommendations Engine

**Files:**
- Create: `stores/progress-store.ts`
- Create: `lib/recommendations.ts`
- Create: `types/progress.ts`

This task has no UI dependencies and can run in parallel with Task 1.

- [ ] **Step 1: Define progress types**

Create `types/progress.ts`:

```typescript
import type { ExamType } from "./exam"

export interface ExamAttempt {
  examType: ExamType
  date: string // ISO date string
  score: number // percentage 0-100
  totalQuestions: number
  correctAnswers: number
  topicBreakdown: TopicBreakdownItem[]
}

export interface TopicBreakdownItem {
  topic: string
  correct: number
  total: number
  percentage: number
}

export interface SessionCompletion {
  sessionId: string
  domain: ExamType
  completedDate: string // ISO date string
  preTestScore: "correct" | "incorrect" | null
  teachBackCompleteness: number | null // 0-100
}

export interface DomainStats {
  domain: ExamType
  bestExamScore: number | null
  averageExamScore: number | null
  examAttempts: number
  sessionsCompleted: number
  sessionsTotal: number
  completionPercentage: number
}

export interface Recommendation {
  sessionId: string
  domain: ExamType
  reason: string
  priority: "high" | "medium" | "low"
  type: "weak-area" | "review-due" | "not-started"
}
```

- [ ] **Step 2: Create progress store**

Create `stores/progress-store.ts` using Zustand with `persist` middleware, persisted to `localStorage` with key `"danb-progress"`.

**State:**
- `examAttempts: ExamAttempt[]`
- `sessionCompletions: Record<string, SessionCompletion>` (keyed by sessionId)

**Actions:**
- `recordExamAttempt(attempt: ExamAttempt)` — push to examAttempts array
- `recordSessionCompletion(completion: SessionCompletion)` — set in sessionCompletions map
- `getDomainStats(domain: ExamType, totalSessions: number): DomainStats` — compute from raw data
- `getOverallReadiness(): number` — weighted average of domain completion percentages
- `getRecentActivity(limit: number): Array<{type: "exam" | "session", date: string, label: string}>` — merge and sort exam attempts + session completions by date, return most recent
- `reset()` — clear all data

- [ ] **Step 3: Create recommendations engine**

Create `lib/recommendations.ts`:

```typescript
import type { ExamAttempt, SessionCompletion, Recommendation } from "@/types/progress"
import type { ExamType } from "@/types/exam"
import type { SessionMeta } from "@/types/learn"

export function getRecommendations(
  examAttempts: ExamAttempt[],
  sessionCompletions: Record<string, SessionCompletion>,
  allSessions: SessionMeta[]
): Recommendation[]
```

**Logic:**
1. Group sessions by domain
2. For each domain, find the best exam score from `examAttempts`
3. If best score < 75%: find incomplete sessions in that domain → priority "high", type "weak-area", reason includes the score
4. For completed sessions: if `completedDate` is > 7 days ago → priority "medium", type "review-due"
5. Any remaining not-started sessions → priority "low", type "not-started"
6. Sort by priority (high → medium → low), then by domain

- [ ] **Step 4: Verify store persistence**

Run `npm run dev`, open browser console:
- Access store: `window.__ZUSTAND_STORE__` or test via a temporary component
- Record a test attempt, refresh page, verify data persists
- Test `getDomainStats` returns correct computed values
- Test `getRecommendations` returns ordered list

- [ ] **Step 5: Commit**

```bash
git add types/progress.ts stores/progress-store.ts lib/recommendations.ts
git commit -m "feat(progress): add progress store and recommendations engine"
```

---

## Task 3: Layout Shell

**Files:**
- Modify: `app/layout.tsx` (add Navbar to layout)
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/SidebarSheet.tsx` (mobile drawer version)
- Modify: `components/theme-provider.tsx` (keep ThemeHotkey, update if needed)

Depends on: Task 1 (design tokens must exist)

- [ ] **Step 1: Create Navbar component**

Create `components/layout/Navbar.tsx`:

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

**Structure:**
- Full-width sticky header with `border-b bg-background/95 backdrop-blur`
- Inner container: `max-w-7xl mx-auto px-4 h-14 flex items-center`
- Left: Logo area — GraduationCap icon + "DANB CDA Prep" text, links to `/`
- Center: Nav links — Dashboard (`/`), Practice (`/practice`), Learn (`/learn`). Active link gets `text-primary font-semibold` styling, others get `text-muted-foreground hover:text-foreground`
- Right: Theme toggle button — Sun/Moon icon, calls `setTheme(theme === "dark" ? "light" : "dark")`
- Use `usePathname()` to determine active link. Practice is active for any `/practice` or `/exam/*` path. Learn is active for any `/learn/*` path.

- [ ] **Step 2: Create Sidebar component**

Create `components/layout/Sidebar.tsx`:

A reusable sidebar container that accepts children. Not page-specific — the page decides what content goes in it.

```tsx
"use client"

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside className={cn(
      "hidden lg:block w-64 shrink-0 border-r bg-card overflow-y-auto",
      className
    )}>
      <div className="p-4">
        {children}
      </div>
    </aside>
  )
}
```

Hidden on mobile (`hidden lg:block`), 256px wide, scrollable.

- [ ] **Step 3: Create SidebarSheet for mobile**

Create `components/layout/SidebarSheet.tsx`:

Uses shadcn Dialog or a simple sheet implementation for mobile sidebar. Triggered by a menu button that only appears on `lg:hidden` screens.

```tsx
"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarSheetProps {
  children: React.ReactNode
  trigger?: React.ReactNode
}
```

- Overlay with `fixed inset-0 z-50 bg-black/50` backdrop
- Slide-in panel from left: `fixed left-0 top-0 bottom-0 w-72 bg-card border-r z-50`
- Close button in top-right of panel
- Renders children inside the panel

- [ ] **Step 4: Update app/layout.tsx**

Add Navbar to the root layout, below ThemeProvider:

```tsx
<ThemeProvider>
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-14"> {/* offset for fixed navbar */}
      {children}
    </div>
  </div>
</ThemeProvider>
```

Remove the ThemeHotkey from theme-provider.tsx since the navbar now has a visible toggle (or keep it as an additional shortcut — user preference).

- [ ] **Step 5: Verify layout shell**

Run `npm run dev`. Check:
- Navbar renders on all pages, sticky at top
- Nav links highlight correctly based on current route
- Theme toggle works
- Content is offset below navbar (no overlap)
- Sidebar component renders when used (test with a dummy page)
- Mobile sheet opens/closes correctly

- [ ] **Step 6: Commit**

```bash
git add components/layout/ app/layout.tsx components/theme-provider.tsx
git commit -m "feat(layout): add navbar and sidebar shell"
```

---

## Task 4: Practice Selection Page & Route

**Files:**
- Create: `app/practice/page.tsx`
- Create: `components/practice/ExamSelectionCard.tsx`
- Create: `components/practice/PastAttempts.tsx`
- Modify: `components/exam/ExamCard.tsx` (may be replaced or repurposed)

Depends on: Task 1 (design tokens), Task 2 (progress store for past attempts)

- [ ] **Step 1: Create ExamSelectionCard component**

Create `components/practice/ExamSelectionCard.tsx`:

Each card shows one exam type with:
- Domain color accent as left border (4px solid, using `--domain-gc/rhs/ice`)
- Header: Badge with exam code (GC/RHS/ICE) + exam title
- Stats row: question count, time limit, passing score (75%) — use icons from Lucide (FileText, Clock, Target)
- Best score badge (if available from progress store): green if >= 75%, red otherwise
- Expandable instructions accordion (use a simple `useState` toggle with `overflow-hidden` transition)
- "Start Exam" button — primary, full width at bottom of card
- Clicking "Start Exam" calls `startExam(examType)` from exam store and navigates to `/exam/${examType}/session`

```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Clock, Target, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExamStore } from "@/stores/exam-store"
import { useProgressStore } from "@/stores/progress-store"
import type { ExamConfig } from "@/lib/exam-config"
import type { ExamType } from "@/types/exam"
```

- [ ] **Step 2: Create PastAttempts component**

Create `components/practice/PastAttempts.tsx`:

Reads from progress store. For each exam type, shows last 3 attempts as a compact list:
- Date, score %, pass/fail badge
- If no attempts: "No attempts yet"
- Grouped by exam type with domain color headers

- [ ] **Step 3: Create practice page**

Create `app/practice/page.tsx`:

```tsx
import { examConfigs } from "@/lib/exam-config"
import { ExamSelectionCard } from "@/components/practice/ExamSelectionCard"
import { PastAttempts } from "@/components/practice/PastAttempts"
```

Layout:
- Page header: "Practice Exams" title + subtitle about simulating real conditions
- Three ExamSelectionCards in a responsive grid: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`
- PastAttempts section below with a "Recent Attempts" heading
- No sidebar on this page

- [ ] **Step 4: Verify practice page**

Run `npm run dev`, navigate to `/practice`. Check:
- Three cards render with correct domain colors
- Instructions accordion expands/collapses
- "Start Exam" navigates to exam session
- Past attempts section renders (empty state if no data)
- Responsive layout on mobile/tablet/desktop

- [ ] **Step 5: Commit**

```bash
git add app/practice/ components/practice/
git commit -m "feat(practice): add practice exam selection page"
```

---

## Task 5: Dashboard / Home Page

**Files:**
- Modify: `app/page.tsx` (full rewrite)
- Create: `components/dashboard/WelcomeHeader.tsx`
- Create: `components/dashboard/OverallProgress.tsx`
- Create: `components/dashboard/QuickActions.tsx`
- Create: `components/dashboard/DomainProgressCard.tsx`
- Create: `components/dashboard/WeakAreaCallout.tsx`
- Create: `components/dashboard/RecentActivity.tsx`

Depends on: Task 1 (design tokens), Task 2 (progress store), Task 3 (layout shell)

- [ ] **Step 1: Create WelcomeHeader**

Create `components/dashboard/WelcomeHeader.tsx`:

Simple: "Welcome back" heading with `text-2xl font-bold`, subtitle "Pick up where you left off, or start something new." in `text-muted-foreground`. No user name (no auth system).

- [ ] **Step 2: Create OverallProgress**

Create `components/dashboard/OverallProgress.tsx`:

A segmented horizontal progress bar showing combined CDA readiness. Uses `useProgressStore().getOverallReadiness()` for the total, and `getDomainStats()` for each segment.

Structure:
- Label: "CDA Readiness" + percentage
- Bar container: `h-3 rounded-full bg-muted overflow-hidden flex`
- Three colored segments inside, width proportional to each domain's contribution:
  - GC segment: `bg-[color:var(--domain-gc)]`
  - RHS segment: `bg-[color:var(--domain-rhs)]`
  - ICE segment: `bg-[color:var(--domain-ice)]`
- Legend below: three small dots with domain names and individual percentages
- If no data: show empty bar with "Take your first exam or learning session to start tracking progress"

- [ ] **Step 3: Create QuickActions**

Create `components/dashboard/QuickActions.tsx`:

Three cards in a row (`grid gap-4 sm:grid-cols-3`):

1. **Continue Learning** — BookOpen icon, "Continue Learning" title. If there's an incomplete domain (sessions remaining), subtitle shows domain name + next session. Links to the next uncompleted session. If all done, says "All sessions complete!" and links to `/learn`.

2. **Take Practice Exam** — FileText icon, "Practice Exam" title. Subtitle suggests the domain with the lowest score, or "Start your first exam" if no data. Links to `/practice`.

3. **Review Weak Areas** — Target icon, "Weak Areas" title. Uses `getRecommendations()` to show count of recommendations. Links to `/learn` with weak-area sessions highlighted. If no weak areas: "Looking good! Keep practicing."

Each card: `Card` with `hover:shadow-sm transition-shadow cursor-pointer`, icon in primary color, padding `p-5`.

- [ ] **Step 4: Create DomainProgressCard**

Create `components/dashboard/DomainProgressCard.tsx`:

Props: `domain: ExamType`, `stats: DomainStats`, `domainConfig: DomainConfig`

Card with domain color accent (top border 3px):
- Domain title + code badge
- Circular progress indicator (CSS-only): arc showing completion percentage. Use `conic-gradient` on a rounded div, or a simple SVG circle with `stroke-dasharray`.
- Stats grid (2x2):
  - Best score: percentage or "—"
  - Exam attempts: count
  - Sessions: "X/Y"
  - Completion: percentage
- "View Sessions" link to `/learn/${domain}`

- [ ] **Step 5: Create WeakAreaCallout**

Create `components/dashboard/WeakAreaCallout.tsx`:

Reads recommendations from the engine. If high-priority recommendations exist:
- Soft blue banner: `bg-primary/5 border border-primary/20 rounded-xl p-4`
- AlertCircle icon + "Recommended Focus Area" heading
- Text: "You scored below 75% on [domain]. We recommend these sessions:"
- List of 1-3 recommended session titles as links
- If no recommendations: component returns null (hidden)

- [ ] **Step 6: Create RecentActivity**

Create `components/dashboard/RecentActivity.tsx`:

Uses `useProgressStore().getRecentActivity(5)`. Shows last 5 items:
- Each item: icon (exam or book), label ("GC Practice Exam — 82%", "Radiation Physics — Completed"), relative date ("2 days ago")
- Simple vertical list with separators
- If empty: "No activity yet. Start a practice exam or learning session!"

- [ ] **Step 7: Assemble dashboard page**

Rewrite `app/page.tsx`:

```tsx
"use client"

import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader"
import { OverallProgress } from "@/components/dashboard/OverallProgress"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { DomainProgressCard } from "@/components/dashboard/DomainProgressCard"
import { WeakAreaCallout } from "@/components/dashboard/WeakAreaCallout"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
```

Layout: `max-w-6xl mx-auto px-4 py-8 space-y-8`. No sidebar. Stack all sections vertically. Domain progress cards in a `grid gap-6 sm:grid-cols-3` row.

- [ ] **Step 8: Verify dashboard**

Run `npm run dev`. Check:
- All sections render in both empty and populated states
- Progress bar segments are proportional and colored correctly
- Quick actions link to correct pages
- Domain cards show correct stats
- Weak area callout appears/hides based on data
- Recent activity shows items in reverse chronological order
- Light and dark mode both look correct
- Responsive on mobile

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx components/dashboard/
git commit -m "feat(dashboard): add progress-aware dashboard home page"
```

---

## Task 6: Practice Exam Flow (Session + Results)

**Files:**
- Modify: `app/exam/[examType]/session/page.tsx` (rewrite UI)
- Modify: `app/exam/[examType]/results/page.tsx` (rewrite UI)
- Remove: `app/exam/[examType]/page.tsx` (instructions page — folded into practice selection)
- Rewrite: `components/exam/QuestionDisplay.tsx`
- Rewrite: `components/exam/QuestionNav.tsx`
- Rewrite: `components/exam/QuestionGrid.tsx`
- Rewrite: `components/exam/Timer.tsx`
- Rewrite: `components/exam/ResultsSummary.tsx`
- Remove: `components/exam/ExamCard.tsx` (replaced by ExamSelectionCard)

Depends on: Task 1 (design tokens), Task 2 (progress store for recording results), Task 3 (layout shell — sidebar)

- [ ] **Step 1: Rewrite Timer component**

`components/exam/Timer.tsx`:
- Use Geist Mono font for the timer display (`font-mono`)
- Format as `MM:SS`
- When < 5 minutes remaining: text turns `text-error` (red)
- When < 1 minute: add `animate-pulse`
- Clean, compact display — no card wrapper, just the time

- [ ] **Step 2: Rewrite QuestionGrid component**

`components/exam/QuestionGrid.tsx`:

This now renders in the sidebar (not as a popover/modal).

- Grid of numbered squares: `grid grid-cols-5 gap-1.5`
- Each square: `w-8 h-8 rounded text-xs font-medium flex items-center justify-center cursor-pointer`
- Color states:
  - Unanswered: `bg-muted text-muted-foreground`
  - Answered: `bg-primary text-primary-foreground`
  - Flagged: `ring-2 ring-warning` (amber outline, can be combined with answered fill)
  - Current: `ring-2 ring-foreground` (bold outline for current question)
- Clicking a square calls `goToQuestion(index)` from exam store
- Below the grid: stats — "X/Y answered" + "Z flagged"

- [ ] **Step 3: Rewrite QuestionDisplay component**

`components/exam/QuestionDisplay.tsx`:

- Question stem: `text-lg font-medium leading-relaxed mb-6`
- Answer options: Full-width clickable cards (not radio buttons). Each option:
  - Container: `border rounded-lg p-4 cursor-pointer transition-colors`
  - Unselected: `border-border hover:border-primary/50 hover:bg-primary/5`
  - Selected: `border-primary bg-primary/5`
  - Option letter (A, B, C, D) in a small circle on the left, option text to the right
  - Click calls `selectAnswer(questionId, optionId)`
- Flag button below options: `Button variant="outline"` with Flag icon, text "Flag for review". Active state: amber background with filled flag icon.

- [ ] **Step 4: Rewrite QuestionNav component**

`components/exam/QuestionNav.tsx`:

- Flex row: Previous button (left), question position text (center), Next button (right)
- Previous: `Button variant="outline"` with ChevronLeft icon, disabled on first question
- Next: `Button variant="outline"` with ChevronRight icon. On last question, text changes to "Review & Submit"
- Keyboard hint text below: `text-xs text-muted-foreground` — "Use arrow keys to navigate"
- Submit confirmation: When "Review & Submit" is clicked, show an AlertDialog confirming submission with unanswered count warning

- [ ] **Step 5: Rewrite exam session page**

`app/exam/[examType]/session/page.tsx`:

New layout using the sidebar:

```tsx
<div className="flex min-h-[calc(100vh-3.5rem)]">
  {/* Sidebar — hidden on mobile */}
  <Sidebar>
    <QuestionGrid />
  </Sidebar>

  {/* Main content */}
  <div className="flex-1 flex flex-col">
    {/* Top bar */}
    <div className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between">
      <Timer />
      <span className="text-sm text-muted-foreground">Q {n}/{total}</span>
      {/* Mobile: sidebar trigger button (lg:hidden) */}
      <SidebarSheet><QuestionGrid /></SidebarSheet>
      {/* Desktop: submit button (hidden lg:block) */}
      <Button>Submit</Button>
    </div>

    {/* Question area */}
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
      <QuestionDisplay />
    </main>

    {/* Bottom nav */}
    <div className="border-t bg-background px-4 py-4 max-w-3xl mx-auto w-full">
      <QuestionNav />
    </div>
  </div>
</div>
```

Keep existing logic: redirect if no active exam, beforeunload warning, keyboard navigation.

- [ ] **Step 6: Rewrite ResultsSummary component**

`components/exam/ResultsSummary.tsx`:

- **Score hero**: Large centered score with circular progress indicator (SVG circle). Green fill + "PASSED" badge if >= 75%, red fill + "NOT PASSED" if below. Score percentage in center of circle, large font.
- **Stats row**: Time used, questions answered, accuracy — in a horizontal `flex gap-6 justify-center` row with icons
- **Topic breakdown**: Each topic as a row with label, horizontal bar, and percentage. Bar uses domain color. Sorted by score ascending (weakest first).
- **Question review**: Expandable accordion list. Each item shows question number, your answer, correct answer. Color-coded: green for correct, red for incorrect. Expand to see full question + explanation. Filter buttons at top: All / Incorrect / Flagged.

- [ ] **Step 7: Rewrite results page**

`app/exam/[examType]/results/page.tsx`:

- No sidebar on results page
- Layout: `max-w-3xl mx-auto px-4 py-8`
- Header: exam title + "Results" with domain badge
- ResultsSummary component
- Action buttons: "Back to Practice" (outline, links to `/practice`), "Retake Exam" (primary), "Review Weak Areas" (links to `/learn` if failed topics exist)
- **Integration with progress store:** On mount, if result exists and hasn't been recorded yet, call `recordExamAttempt()` from progress store. Use a ref to prevent double-recording.

- [ ] **Step 8: Remove old instructions page**

Delete `app/exam/[examType]/page.tsx` — its content is now in the ExamSelectionCard accordion. The route `/exam/[examType]` should redirect to `/practice` or just 404 naturally.

Actually, keep a simple redirect page instead of deleting:
```tsx
import { redirect } from "next/navigation"
export default function ExamInstructionsRedirect() {
  redirect("/practice")
}
```

- [ ] **Step 9: Verify exam flow**

Run `npm run dev`. Full flow test:
1. Navigate to `/practice` → click "Start Exam" on GC
2. Exam session loads with sidebar question grid
3. Answer questions, flag some, navigate with arrows and grid clicks
4. Timer counts down correctly
5. Submit → results page shows score hero, topic breakdown, question review
6. Progress store records the attempt
7. "Back to Practice" shows the attempt in Past Attempts
8. Mobile: sidebar sheet works, layout is responsive

- [ ] **Step 10: Commit**

```bash
git add app/exam/ components/exam/ components/practice/
git commit -m "feat(exam): redesigned exam session and results pages"
```

---

## Task 7: Learn Mode Flow

**Files:**
- Create: `app/learn/page.tsx` (new learn selection page)
- Modify: `app/learn/[domain]/page.tsx`
- Rewrite: `components/learn/DomainPage.tsx`
- Rewrite: `components/learn/DomainCard.tsx`
- Rewrite: `components/learn/SessionCard.tsx`
- Rewrite: `components/learn/SessionStepper.tsx`
- Rewrite: `components/learn/PhasePreTest.tsx`
- Rewrite: `components/learn/PhaseContent.tsx`
- Rewrite: `components/learn/PhaseElaboration.tsx`
- Rewrite: `components/learn/PhaseScenario.tsx`
- Rewrite: `components/learn/PhaseInterleaved.tsx`
- Rewrite: `components/learn/PhaseTeachBack.tsx`
- Rewrite: `components/learn/PhaseSRS.tsx`
- Rewrite: `components/learn/ConfidenceSelector.tsx`
- Rewrite: `components/learn/FeedbackBox.tsx`
- Keep: `components/learn/PhaseBadge.tsx`, `components/learn/ScienceTag.tsx` (restyle only)
- Modify: `app/learn/session/[sessionId]/page.tsx`

Depends on: Task 1 (design tokens), Task 2 (progress store), Task 3 (layout shell — sidebar)

- [ ] **Step 1: Create learn selection page**

Create `app/learn/page.tsx`:

```tsx
import { domainConfigs } from "@/data/learn/index"
import { DomainCard } from "@/components/learn/DomainCard"
```

Layout: `max-w-6xl mx-auto px-4 py-8`
- Header: "Learn" title + subtitle about evidence-based study techniques
- Three DomainCards in `grid gap-6 sm:grid-cols-3`
- Below: WeakAreaCallout component (reused from dashboard)

- [ ] **Step 2: Rewrite DomainCard**

`components/learn/DomainCard.tsx`:

Card with domain color accent (top border 3px):
- Domain badge + title
- Progress bar (filled to session completion %)
- "X/Y sessions completed" text
- "Continue" button if sessions in progress, "Start" if fresh, "Review" if all complete
- Links to `/learn/${domain}`

Uses progress store for completion data, domain config for total session count.

- [ ] **Step 3: Rewrite DomainPage**

`components/learn/DomainPage.tsx`:

Page layout: `max-w-4xl mx-auto px-4 py-8`
- Header: Domain name + badge, overall progress bar for this domain
- Sessions as vertical stack of SessionCards (not grid)
- No sidebar on this page

- [ ] **Step 4: Rewrite SessionCard**

`components/learn/SessionCard.tsx`:

Props: `session: SessionMeta`, `completion: SessionCompletion | undefined`, `isRecommended: boolean`, `isDueForReview: boolean`

Card layout:
- Left: Status indicator (checkmark circle if complete, empty circle if not, half-filled if in-progress)
- Center: Session title, topic, estimated time
- Right: Badges — "Completed [date]" (green), "Recommended" (primary blue), "Due for Review" (amber)
- Click navigates to `/learn/session/${session.id}`
- Completed sessions have slightly muted styling

Get completion status from progress store. Get recommendation/review status from recommendations engine.

- [ ] **Step 5: Rewrite SessionStepper (sidebar phase stepper)**

`components/learn/SessionStepper.tsx`:

This component now manages the overall session layout with sidebar.

```tsx
<div className="flex min-h-[calc(100vh-3.5rem)]">
  <Sidebar>
    <PhaseStepper />
  </Sidebar>
  <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
    {/* Current phase content */}
  </main>
</div>
```

**PhaseStepper** (inside sidebar):
- Vertical list of 7 phases
- Each phase: icon + label
- Icons: ClipboardCheck (preTest), BookOpen (content), Lightbulb (elaboration), MessageSquare (scenario), Shuffle (interleaved), Mic (teachBack), Calendar (srsSchedule)
- Current phase: `text-primary font-semibold` with filled icon
- Completed phase: `text-success` with checkmark
- Future phase: `text-muted-foreground`
- Clickable to jump back to completed phases only
- Mobile: use SidebarSheet with PhaseStepper as content

- [ ] **Step 6: Rewrite phase components**

Restyle each phase component with the new design tokens. Key changes for each:

**PhasePreTest.tsx:**
- Question in a clean card with Sky Blue accent
- Options as full-width clickable cards (same pattern as exam)
- Feedback: inline green/red banner with explanation after answering
- "Continue" button appears after answering

**PhaseContent.tsx:**
- Content title in `text-xl font-semibold`
- Body text with good line height (`leading-relaxed`)
- Science tags as small colored badges
- Diagram area if present
- "Continue" button at bottom

**PhaseElaboration.tsx:**
- Prompt question in a card
- "Reveal Expert Reasoning" button (primary outline)
- After reveal: expert reasoning in a `bg-primary/5 border-primary/20 rounded-xl p-4` box
- "Continue" button appears after reveal

**PhaseScenario.tsx:**
- Scenario text in an italicized quote block or subtle card
- ConfidenceSelector before answering
- Question + options (same card pattern)
- Detailed explanation after answering

**PhaseInterleaved.tsx:**
- Domain label badge at top
- Question + options (same card pattern)
- Feedback inline after answering

**PhaseTeachBack.tsx:**
- Prompt in a card
- Textarea: `min-h-[120px] border rounded-lg p-3`
- "Submit for Review" button with loading spinner state
- AI feedback card: bordered card with accuracy badge (green/amber/red), completeness bar, feedback text, missed concepts as red outline badges
- Error state: red banner with retry button

**PhaseSRS.tsx:**
- Session summary text
- Review schedule as a clean list: "Review in 1 day", "Review in 3 days", "Review in 7 days" with calendar icons
- "Complete Session" button (primary, prominent)
- On click: record completion in progress store, navigate to `/learn/${domain}`

- [ ] **Step 7: Rewrite ConfidenceSelector**

`components/learn/ConfidenceSelector.tsx`:

Four options as horizontal toggle buttons:
- "Guessing", "Somewhat", "Confident", "Very Confident"
- Unselected: `border bg-background text-muted-foreground`
- Selected: `bg-primary text-primary-foreground`
- Layout: `flex gap-2`, buttons have `flex-1 rounded-lg py-2 text-sm`

- [ ] **Step 8: Rewrite FeedbackBox**

`components/learn/FeedbackBox.tsx`:

Props: `isCorrect: boolean`, `feedback: string`

- Correct: `bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 rounded-xl p-4` with CheckCircle icon
- Incorrect: `bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 rounded-xl p-4` with XCircle icon
- Feedback text below icon

- [ ] **Step 9: Update learn session page**

`app/learn/session/[sessionId]/page.tsx`:

Keep existing session loading logic. The component renders `<SessionStepper />` which now includes the sidebar layout internally. No changes to the data loading — just the component handles layout.

- [ ] **Step 10: Integrate progress store into PhaseSRS**

When "Complete Session" is clicked in PhaseSRS:
1. Call `recordSessionCompletion()` from progress store with session data
2. Navigate back to `/learn/${session.domain}`

Read pre-test result from learn store to populate `preTestScore` field.
Read teach-back evaluation from learn store to populate `teachBackCompleteness` field.

- [ ] **Step 11: Verify learn flow**

Run `npm run dev`. Full flow test:
1. Navigate to `/learn` → see three domain cards with progress
2. Click a domain → see session list with completion/recommended/review badges
3. Click a session → sidebar shows phase stepper
4. Progress through all 7 phases:
   - PreTest: answer, see feedback
   - Content: read, continue
   - Elaboration: reveal reasoning, continue
   - Scenario: set confidence, answer, see explanation
   - Interleaved: answer, see feedback
   - TeachBack: write response, submit, see AI feedback
   - SRS: see schedule, complete session
5. Session marked as complete in progress store
6. Domain page shows updated completion
7. Dashboard shows in recent activity
8. Mobile: sidebar sheet works at each stage

- [ ] **Step 12: Commit**

```bash
git add app/learn/ components/learn/
git commit -m "feat(learn): redesigned learn mode with sidebar stepper and progress integration"
```

---

## Task 8: Final Polish & Cleanup

**Files:**
- Modify: Various files for final consistency pass
- Remove: Unused components/files

Depends on: All previous tasks complete

- [ ] **Step 1: Remove unused files**

- Delete `components/exam/ExamCard.tsx` (replaced by ExamSelectionCard)
- Delete `components/.gitkeep` and `lib/.gitkeep` (directories have content now)
- Clean up any unused imports across modified files

- [ ] **Step 2: Responsive audit**

Test every page at three breakpoints:
- Mobile (375px): single column, sheet sidebars, stacked cards
- Tablet (768px): two-column grids where applicable
- Desktop (1280px): full layout with persistent sidebars

Fix any layout issues found.

- [ ] **Step 3: Dark mode audit**

Toggle dark mode on every page. Check:
- No white flashes on navigation
- All text is readable (sufficient contrast)
- Domain colors are visible against dark backgrounds
- Cards, badges, and feedback boxes all use dark variants
- Focus rings are visible

- [ ] **Step 4: Accessibility check**

- All interactive elements are keyboard accessible
- Focus order follows visual order
- Color is not the only indicator (icons + text accompany color states)
- Buttons have descriptive text or aria-labels
- Images/icons have alt text where needed

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: cleanup unused files and polish responsive/dark mode"
```
