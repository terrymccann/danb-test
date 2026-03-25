# Learn Navigation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Learn section from a flat session grid to a domain → sub-domain → session hierarchy with 68 sessions across GC, RHS, and ICE.

**Architecture:** Homepage Learn tab shows 3 domain cards. Each links to a domain page (`/learn/gc` etc.) with always-expanded sub-domain sections containing session cards. Session stepper moves to `/learn/session/[sessionId]`. SessionStepper back link updated to point to the session's domain page.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Zustand, Tailwind CSS 4, shadcn/ui (base-nova), Lucide icons.

**Spec:** `docs/superpowers/specs/2026-03-25-learn-navigation-redesign.md`

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `components/learn/DomainCard.tsx` | Homepage card for a domain (GC/RHS/ICE) |
| `components/learn/DomainPage.tsx` | Domain page with sub-domain sections |
| `components/learn/SessionCard.tsx` | Small card for a session within a sub-domain |
| `app/learn/[domain]/page.tsx` | Domain page route |
| `app/learn/session/[sessionId]/page.tsx` | Session stepper route (moved) |

### Modified files

| File | Change |
|------|--------|
| `types/learn.ts` | Add `SubDomainGroup`, `DomainLearnConfig`, `available` field on `SessionMeta` |
| `data/learn/index.ts` | Replace flat `learningSessions` with `domainConfigs` + helpers |
| `app/page.tsx` | Learn tab renders `DomainCard` instead of `LearnCard` |
| `components/learn/SessionStepper.tsx` | Back link goes to `/learn/{domain}` instead of `/` |

### Deleted files

| File | Reason |
|------|--------|
| `components/learn/LearnCard.tsx` | Replaced by `DomainCard` + `SessionCard` |
| `app/learn/[sessionId]/page.tsx` | Moved to `app/learn/session/[sessionId]/page.tsx` |

---

## Task 1: Update Types and Data Index

**Files:**
- Modify: `types/learn.ts`
- Modify: `data/learn/index.ts`

- [ ] **Step 1: Add new types to `types/learn.ts`**

Add `available` to `SessionMeta`, and add `SubDomainGroup` and `DomainLearnConfig` interfaces. Add these after the existing `SessionMeta` interface:

Change `SessionMeta` from:
```typescript
export interface SessionMeta {
  id: string
  title: string
  domain: ExamType
  topic: string
  estimatedMinutes: number
  scienceTags: string[]
}
```

To:
```typescript
export interface SessionMeta {
  id: string
  title: string
  domain: ExamType
  topic: string
  estimatedMinutes: number
  scienceTags: string[]
  available: boolean
}

export interface SubDomainGroup {
  name: string
  examWeight: string
  sessions: SessionMeta[]
}

export interface DomainLearnConfig {
  domain: ExamType
  title: string
  code: string
  examDetails: string
  subDomains: SubDomainGroup[]
}
```

- [ ] **Step 2: Replace `data/learn/index.ts` with full domain configs**

Replace the entire file contents with the complete 68-session domain config. This is a large data file — all session titles come from `docs/learning-sessions-outline.md`. Only `ice-spaulding-classification` has `available: true`.

```typescript
import type { ExamType } from "@/types/exam"
import type { DomainLearnConfig, SessionMeta } from "@/types/learn"

function s(
  id: string,
  title: string,
  domain: ExamType,
  topic: string,
  available = false,
): SessionMeta {
  return { id, title, domain, topic, estimatedMinutes: 12, scienceTags: [], available }
}

export const domainConfigs: DomainLearnConfig[] = [
  {
    domain: "gc",
    title: "General Chairside",
    code: "GC",
    examDetails: "95 questions · 75 minutes",
    subDomains: [
      {
        name: "Evaluation",
        examWeight: "17%",
        sessions: [
          s("gc-vital-signs", "Vital Signs & Baseline Measurements", "gc", "Evaluation"),
          s("gc-medical-history", "Medical History Review & Risk Assessment", "gc", "Evaluation"),
          s("gc-dental-charting", "Dental Charting & Tooth Numbering", "gc", "Evaluation"),
          s("gc-tooth-anatomy", "Tooth Anatomy & Morphology", "gc", "Evaluation"),
          s("gc-head-neck-anatomy", "Head & Neck Anatomy", "gc", "Evaluation"),
          s("gc-occlusion", "Occlusion & Malocclusion", "gc", "Evaluation"),
          s("gc-medical-emergencies", "Medical Emergencies in the Dental Office", "gc", "Evaluation"),
        ],
      },
      {
        name: "Patient Management & Administration",
        examWeight: "17%",
        sessions: [
          s("gc-oral-health-education", "Oral Health Education & Prevention", "gc", "Patient Management & Administration"),
          s("gc-legal-compliance", "Legal & Regulatory Compliance", "gc", "Patient Management & Administration"),
          s("gc-hipaa", "HIPAA & Patient Records", "gc", "Patient Management & Administration"),
          s("gc-patient-communication", "Patient Communication & Behavior Management", "gc", "Patient Management & Administration"),
        ],
      },
      {
        name: "Chairside Dentistry",
        examWeight: "50%",
        sessions: [
          s("gc-four-handed", "Four-Handed Dentistry & Ergonomics", "gc", "Chairside Dentistry"),
          s("gc-instrument-id", "Instrument Identification & Function", "gc", "Chairside Dentistry"),
          s("gc-restorative", "Restorative Procedures", "gc", "Chairside Dentistry"),
          s("gc-endodontic", "Endodontic Procedures", "gc", "Chairside Dentistry"),
          s("gc-periodontic", "Periodontic Procedures", "gc", "Chairside Dentistry"),
          s("gc-prosthodontic", "Prosthodontic Procedures", "gc", "Chairside Dentistry"),
          s("gc-orthodontic", "Orthodontic Procedures", "gc", "Chairside Dentistry"),
          s("gc-oral-surgery", "Oral Surgery Procedures", "gc", "Chairside Dentistry"),
          s("gc-pediatric", "Pediatric Dentistry", "gc", "Chairside Dentistry"),
          s("gc-anesthesia", "Anesthesia & Pain Management", "gc", "Chairside Dentistry"),
          s("gc-dental-dam", "Dental Dam & Moisture Control", "gc", "Chairside Dentistry"),
          s("gc-tray-setup", "Tray Setup & Procedural Sequencing", "gc", "Chairside Dentistry"),
        ],
      },
      {
        name: "Dental Materials",
        examWeight: "16%",
        sessions: [
          s("gc-amalgam", "Amalgam & Direct Restorative Materials", "gc", "Dental Materials"),
          s("gc-composite", "Composite & Bonding Systems", "gc", "Dental Materials"),
          s("gc-cements", "Dental Cements & Liners", "gc", "Dental Materials"),
          s("gc-impressions", "Impression Materials & Gypsum", "gc", "Dental Materials"),
          s("gc-temporaries", "Temporary Materials & Waxes", "gc", "Dental Materials"),
        ],
      },
    ],
  },
  {
    domain: "rhs",
    title: "Radiation Health & Safety",
    code: "RHS",
    examDetails: "75 questions · 60 minutes",
    subDomains: [
      {
        name: "Purpose and Technique",
        examWeight: "50%",
        sessions: [
          s("rhs-paralleling", "Paralleling Technique", "rhs", "Purpose and Technique"),
          s("rhs-bisecting", "Bisecting Angle Technique", "rhs", "Purpose and Technique"),
          s("rhs-bitewing", "Bitewing Radiographs", "rhs", "Purpose and Technique"),
          s("rhs-occlusal-panoramic", "Occlusal & Panoramic Radiography", "rhs", "Purpose and Technique"),
          s("rhs-digital", "Digital Radiography", "rhs", "Purpose and Technique"),
          s("rhs-film-processing", "Film Processing & Darkroom Procedures", "rhs", "Purpose and Technique"),
          s("rhs-image-evaluation", "Image Evaluation & Mounting", "rhs", "Purpose and Technique"),
          s("rhs-anatomical-landmarks", "Anatomical Landmarks on Radiographs", "rhs", "Purpose and Technique"),
          s("rhs-exposure-settings", "Exposure Settings & Image Quality", "rhs", "Purpose and Technique"),
          s("rhs-patient-positioning", "Patient Positioning & Common Errors", "rhs", "Purpose and Technique"),
        ],
      },
      {
        name: "Radiation Characteristics and Protection",
        examWeight: "25%",
        sessions: [
          s("rhs-radiation-physics", "Radiation Physics Fundamentals", "rhs", "Radiation Characteristics and Protection"),
          s("rhs-biological-effects", "Biological Effects of Radiation", "rhs", "Radiation Characteristics and Protection"),
          s("rhs-dose-limits", "Dose Limits & ALARA Principle", "rhs", "Radiation Characteristics and Protection"),
          s("rhs-protective-equipment", "Protective Equipment & Monitoring", "rhs", "Radiation Characteristics and Protection"),
        ],
      },
      {
        name: "Infection Prevention and Control — Radiology-Specific",
        examWeight: "25%",
        sessions: [
          s("rhs-barrier-techniques", "Barrier Techniques in Radiography", "rhs", "Infection Prevention and Control — Radiology-Specific"),
          s("rhs-equipment-disinfection", "Equipment Disinfection & Sensor Handling", "rhs", "Infection Prevention and Control — Radiology-Specific"),
          s("rhs-infection-control-workflow", "Radiographic Infection Control Workflow", "rhs", "Infection Prevention and Control — Radiology-Specific"),
          s("rhs-darkroom-asepsis", "Darkroom & Digital Sensor Asepsis", "rhs", "Infection Prevention and Control — Radiology-Specific"),
        ],
      },
    ],
  },
  {
    domain: "ice",
    title: "Infection Control",
    code: "ICE",
    examDetails: "75 questions · 60 minutes",
    subDomains: [
      {
        name: "Prevention of Disease Transmission",
        examWeight: "20%",
        sessions: [
          s("ice-chain-of-infection", "Chain of Infection & Modes of Transmission", "ice", "Prevention of Disease Transmission"),
          s("ice-standard-precautions", "Standard Precautions & Hand Hygiene", "ice", "Prevention of Disease Transmission"),
          s("ice-ppe", "Personal Protective Equipment (PPE)", "ice", "Prevention of Disease Transmission"),
          s("ice-vaccination", "Vaccination & Immunization Requirements", "ice", "Prevention of Disease Transmission"),
        ],
      },
      {
        name: "Prevention of Cross-Contamination",
        examWeight: "34%",
        sessions: [
          s("ice-surface-disinfection", "Surface Disinfection Protocols", "ice", "Prevention of Cross-Contamination"),
          s("ice-barrier-techniques", "Barrier Techniques for Clinical Surfaces", "ice", "Prevention of Cross-Contamination"),
          s("ice-waterline-management", "Dental Unit Waterline Management", "ice", "Prevention of Cross-Contamination"),
          s("ice-single-use", "Single-Use Items & Disposables", "ice", "Prevention of Cross-Contamination"),
          s("ice-laboratory-asepsis", "Laboratory Asepsis", "ice", "Prevention of Cross-Contamination"),
          s("ice-radiography-ic", "Radiography-Specific Infection Control", "ice", "Prevention of Cross-Contamination"),
        ],
      },
      {
        name: "Process Instruments and Devices",
        examWeight: "26%",
        sessions: [
          {
            id: "ice-spaulding-classification",
            title: "Sterilization Methods & Instrument Processing",
            domain: "ice",
            topic: "Process Instruments and Devices",
            estimatedMinutes: 12,
            scienceTags: ["Retrieval practice", "Dual coding", "Interleaving", "Spaced repetition"],
            available: true,
          },
          s("ice-instrument-cleaning", "Instrument Cleaning Methods", "ice", "Process Instruments and Devices"),
          s("ice-sterilization-methods", "Sterilization Methods", "ice", "Process Instruments and Devices"),
          s("ice-sterilization-monitoring", "Sterilization Monitoring", "ice", "Process Instruments and Devices"),
          s("ice-instrument-packaging", "Instrument Packaging & Storage", "ice", "Process Instruments and Devices"),
          s("ice-handpiece-processing", "Handpiece & Semicritical Device Processing", "ice", "Process Instruments and Devices"),
        ],
      },
      {
        name: "Occupational Safety and Administration",
        examWeight: "20%",
        sessions: [
          s("ice-osha-bbp", "OSHA Bloodborne Pathogens Standard", "ice", "Occupational Safety and Administration"),
          s("ice-exposure-incidents", "Exposure Incident Management", "ice", "Occupational Safety and Administration"),
          s("ice-hazcom", "Hazard Communication (HazCom/GHS)", "ice", "Occupational Safety and Administration"),
          s("ice-waste-management", "Waste Management & Regulated Medical Waste", "ice", "Occupational Safety and Administration"),
          s("ice-ergonomics", "Ergonomics & Injury Prevention", "ice", "Occupational Safety and Administration"),
          s("ice-recordkeeping", "Recordkeeping & Compliance Programs", "ice", "Occupational Safety and Administration"),
        ],
      },
    ],
  },
]

export function getDomainConfig(domain: ExamType): DomainLearnConfig | undefined {
  return domainConfigs.find((c) => c.domain === domain)
}

export function findSessionMeta(
  sessionId: string,
): { domain: DomainLearnConfig; session: SessionMeta } | undefined {
  for (const domain of domainConfigs) {
    for (const sub of domain.subDomains) {
      const session = sub.sessions.find((s) => s.id === sessionId)
      if (session) return { domain, session }
    }
  }
  return undefined
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add types/learn.ts data/learn/index.ts
git commit -m "feat(learn): add domain hierarchy types and 68-session index"
```

---

## Task 2: Route Migration

Delete the old session route directory and create both new route files. These must happen in the same step to avoid route conflicts.

**Files:**
- Delete: `app/learn/[sessionId]/page.tsx` (entire `[sessionId]` directory)
- Create: `app/learn/session/[sessionId]/page.tsx`
- Create: `app/learn/[domain]/page.tsx`

- [ ] **Step 1: Delete old route and create new session route**

Delete `app/learn/[sessionId]/` entirely. Create `app/learn/session/[sessionId]/page.tsx` with the same content as the old file, but with the redirect pointing to `/` on invalid session:

```tsx
"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLearnStore } from "@/stores/learn-store"
import { loadSession } from "@/lib/session-loader"
import { SessionStepper } from "@/components/learn/SessionStepper"

export default function LearnSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  const router = useRouter()
  const session = useLearnStore((s) => s.session)
  const startSession = useLearnStore((s) => s.startSession)

  useEffect(() => {
    if (session?.id === sessionId) return

    const data = loadSession(sessionId)
    if (!data) {
      router.replace("/")
      return
    }
    startSession(data)
  }, [sessionId, session?.id, router, startSession])

  if (!session) return null

  return <SessionStepper />
}
```

- [ ] **Step 2: Create domain page route**

Create `app/learn/[domain]/page.tsx` as a **Server Component** (no `"use client"`) so that `redirect()` works:

```tsx
import { redirect } from "next/navigation"
import { getDomainConfig } from "@/data/learn/index"
import { DomainPage } from "@/components/learn/DomainPage"
import type { ExamType } from "@/types/exam"

export default async function LearnDomainPage({
  params,
}: {
  params: Promise<{ domain: string }>
}) {
  const { domain } = await params

  const config = getDomainConfig(domain as ExamType)
  if (!config) {
    redirect("/")
  }

  return <DomainPage config={config} />
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: Will fail because `DomainPage` component doesn't exist yet. That's OK — it will be created in Task 4. Verify no other errors.

- [ ] **Step 4: Commit**

```bash
git add app/learn/
git commit -m "feat(learn): migrate session route to /learn/session/[sessionId], add domain route"
```

---

## Task 3: New Components — DomainCard and SessionCard

**Files:**
- Create: `components/learn/DomainCard.tsx`
- Create: `components/learn/SessionCard.tsx`
- Delete: `components/learn/LearnCard.tsx`

- [ ] **Step 1: Create DomainCard**

Create `components/learn/DomainCard.tsx`. Follows the `ExamCard` pattern:

```tsx
"use client"

import Link from "next/link"
import { BookOpen, FileText } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { DomainLearnConfig } from "@/types/learn"

interface DomainCardProps {
  config: DomainLearnConfig
}

export function DomainCard({ config }: DomainCardProps) {
  const totalSessions = config.subDomains.reduce(
    (sum, sub) => sum + sub.sessions.length,
    0,
  )

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm font-semibold">
            {config.code}
          </Badge>
        </div>
        <CardTitle className="text-xl">{config.title}</CardTitle>
        <CardDescription>{config.examDetails}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{totalSessions} learning sessions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {config.subDomains.map((sub) => sub.name).join(" · ")}
            </span>
          </div>
        </div>
        <Link
          href={`/learn/${config.domain}`}
          className={buttonVariants({ className: "w-full" })}
        >
          View Sessions
        </Link>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create SessionCard**

Create `components/learn/SessionCard.tsx`:

```tsx
"use client"

import Link from "next/link"
import { Clock, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SessionMeta } from "@/types/learn"

interface SessionCardProps {
  session: SessionMeta
}

export function SessionCard({ session }: SessionCardProps) {
  if (!session.available) {
    return (
      <Card className="flex flex-col opacity-50">
        <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-6">
          <div>
            <p className="text-sm font-medium">{session.title}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col justify-between gap-3 pt-6">
        <div>
          <p className="text-sm font-medium">{session.title}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>~{session.estimatedMinutes} min</span>
          </div>
        </div>
        <Link
          href={`/learn/session/${session.id}`}
          className={cn(buttonVariants({ size: "sm" }), "w-full")}
        >
          Start
        </Link>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Delete LearnCard**

Delete `components/learn/LearnCard.tsx`.

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: May show errors in `app/page.tsx` (still imports `LearnCard`). That's fixed in Task 5.

- [ ] **Step 5: Commit**

```bash
git add components/learn/DomainCard.tsx components/learn/SessionCard.tsx
git rm components/learn/LearnCard.tsx
git commit -m "feat(learn): add DomainCard and SessionCard, remove LearnCard"
```

---

## Task 4: DomainPage Component

**Files:**
- Create: `components/learn/DomainPage.tsx`

- [ ] **Step 1: Create DomainPage**

Create `components/learn/DomainPage.tsx`:

```tsx
"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SessionCard } from "@/components/learn/SessionCard"
import type { DomainLearnConfig } from "@/types/learn"

interface DomainPageProps {
  config: DomainLearnConfig
}

export function DomainPage({ config }: DomainPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <Badge variant="outline" className="text-sm font-semibold">
            {config.code}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {config.examDetails}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
      </div>

      <div className="space-y-10">
        {config.subDomains.map((sub) => (
          <section key={sub.name}>
            <div className="mb-4 flex items-baseline gap-2">
              <h2 className="text-lg font-semibold">{sub.name}</h2>
              <span className="text-sm text-muted-foreground">
                — {sub.examWeight}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sub.sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (this resolves the missing `DomainPage` import from Task 2).

- [ ] **Step 3: Commit**

```bash
git add components/learn/DomainPage.tsx
git commit -m "feat(learn): add DomainPage component with sub-domain sections"
```

---

## Task 5: Update Homepage and SessionStepper

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/learn/SessionStepper.tsx`

- [ ] **Step 1: Update homepage Learn tab**

In `app/page.tsx`, replace the `LearnCard` import and usage with `DomainCard`:

Change imports from:
```tsx
import { LearnCard } from "@/components/learn/LearnCard"
import { learningSessions } from "@/data/learn/index"
```

To:
```tsx
import { DomainCard } from "@/components/learn/DomainCard"
import { domainConfigs } from "@/data/learn/index"
```

Change the Learn tab content from:
```tsx
<TabsContent value="learn">
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {learningSessions.map((session) => (
      <LearnCard key={session.id} session={session} />
    ))}
  </div>
```

To:
```tsx
<TabsContent value="learn">
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {domainConfigs.map((config) => (
      <DomainCard key={config.domain} config={config} />
    ))}
  </div>
```

- [ ] **Step 2: Update SessionStepper back link**

In `components/learn/SessionStepper.tsx`, change the "Back to Home" link to go to the session's domain page.

Change:
```tsx
<Link
  href="/"
  className={buttonVariants({ variant: "outline" })}
  onClick={reset}
>
  Back to Home
</Link>
```

To:
```tsx
<Link
  href={`/learn/${session.domain}`}
  className={buttonVariants({ variant: "outline" })}
  onClick={reset}
>
  Back to Sessions
</Link>
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/learn/SessionStepper.tsx
git commit -m "feat(learn): update homepage with domain cards, stepper back-nav to domain page"
```

---

## Task 6: Final Verification

- [ ] **Step 1: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No new errors.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds. Routes should include `/`, `/learn/[domain]`, `/learn/session/[sessionId]`, `/api/evaluate-teachback`, and the exam routes.

- [ ] **Step 4: Browser walkthrough**

Run: `npm run dev` and verify:

1. Homepage → Learn tab shows 3 domain cards (GC, RHS, ICE)
2. GC card shows "28 learning sessions" and 4 sub-domain names
3. Click GC card → `/learn/gc` page with 4 sub-domain sections, all expanded
4. Sub-domain headings show name and weight (e.g., "Evaluation — 17%")
5. 27 of 28 session cards show as dimmed "Coming soon" (no link)
6. Navigate to ICE domain → "Process Instruments and Devices" section has Spaulding Classification as an available card
7. Click Spaulding card → `/learn/session/ice-spaulding-classification` loads the 7-phase stepper
8. Complete session → "Back to Sessions" link goes to `/learn/ice` (not homepage)
9. Invalid domain `/learn/xyz` redirects to homepage
10. Existing exam functionality still works (Practice Exams tab)

- [ ] **Step 5: Format code**

Run: `npm run format`

- [ ] **Step 6: Commit any formatting changes**

```bash
git add -A
git commit -m "chore: format code"
```
