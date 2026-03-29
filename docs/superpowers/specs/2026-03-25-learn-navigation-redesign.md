# Learn Navigation Redesign: Domain → Sub-domain → Session Hierarchy

## Overview

Restructure the Learn section from a flat grid of session cards to a 3-level hierarchy that scales to 68 sessions across all three CDA domains (GC: 28, RHS: 18, ICE: 22). Homepage shows 3 domain cards, each linking to a domain page with always-expanded sub-domain sections containing session cards. Sessions not yet built appear as "Coming soon."

## Route Structure

| Route | Purpose |
|-------|---------|
| `/` (Learn tab) | 3 domain cards (GC, RHS, ICE) |
| `/learn/gc` | GC domain page with sub-domain sections |
| `/learn/rhs` | RHS domain page |
| `/learn/ice` | ICE domain page |
| `/learn/session/[sessionId]` | Session stepper (moved from `/learn/[sessionId]`) |

**Removed:** `/learn/[sessionId]` — replaced by `/learn/session/[sessionId]`

**Migration note:** `app/learn/[sessionId]/page.tsx` must be deleted in the same step as creating `app/learn/[domain]/page.tsx`, since both are dynamic segments at the same path level and cannot coexist. The old `app/learn/[sessionId]/` directory is deleted entirely.

## Data Structure

### New types in `types/learn.ts`

```typescript
export interface SubDomainGroup {
  name: string;                    // e.g., "Evaluation"
  examWeight: string;              // e.g., "17%"
  sessions: SessionMeta[];
}

export interface DomainLearnConfig {
  domain: ExamType;
  title: string;                   // "General Chairside"
  code: string;                    // "GC"
  examDetails: string;             // "95 questions · 75 minutes"
  subDomains: SubDomainGroup[];
}
```

### Modified type

`SessionMeta` gets one new field:

```typescript
export interface SessionMeta {
  id: string;
  title: string;
  domain: ExamType;
  topic: string;
  estimatedMinutes: number;
  scienceTags: string[];
  available: boolean;              // true if session JSON data exists
}
```

The existing `ice-spaulding-classification` session retains its populated `scienceTags`. Unavailable sessions use `scienceTags: []`. The `SessionCard` component does not display science tags (they are only relevant once a session is built and may be used in the future).

### Session index restructure

`data/learn/index.ts` changes from a flat `learningSessions: SessionMeta[]` export to `domainConfigs: DomainLearnConfig[]`. The `learningSessions` named export is removed; its only consumer is `app/page.tsx`, which is updated to import `domainConfigs` instead.

```typescript
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
          { id: "gc-vital-signs", title: "Vital Signs & Baseline Measurements", domain: "gc", topic: "Evaluation", estimatedMinutes: 12, scienceTags: [], available: false },
          // ... remaining sessions
        ],
      },
      // ... remaining sub-domains
    ],
  },
  {
    domain: "rhs",
    title: "Radiation Health & Safety",
    code: "RHS",
    examDetails: "75 questions · 60 minutes",
    subDomains: [ /* ... */ ],
  },
  {
    domain: "ice",
    title: "Infection Control",
    code: "ICE",
    examDetails: "75 questions · 60 minutes",
    subDomains: [ /* ... */ ],
  },
];
```

All 68 sessions from `docs/learning-sessions-outline.md` are encoded in this index. Only `ice-spaulding-classification` has `available: true`. The rest have `available: false`.

Helper functions:

```typescript
export function getDomainConfig(domain: ExamType): DomainLearnConfig | undefined

export function findSessionMeta(sessionId: string): { domain: DomainLearnConfig; session: SessionMeta } | undefined
```

`findSessionMeta` searches across all domains to locate a session by ID. Used by the session page for back-navigation to the correct domain page.

## Components

### New components

**`components/learn/DomainCard.tsx`** — homepage card for each domain.
- Domain badge (GC/RHS/ICE)
- Title (e.g., "General Chairside")
- Exam details (e.g., "95 questions · 75 minutes")
- Sub-domain names listed (e.g., "Evaluation · Patient Management · Chairside Dentistry · Dental Materials")
- Total session count (e.g., "28 learning sessions")
- Links to `/learn/gc` etc.
- Follows the same Card/CardHeader/CardContent pattern as the existing `ExamCard.tsx`

**`components/learn/DomainPage.tsx`** — renders a full domain page.
- Domain title and exam details at top
- Sub-domain sections, always expanded, each with:
  - Section heading: sub-domain name + exam weight (e.g., "Evaluation — 17%")
  - Grid of session cards within the section
- Back link to homepage

**`components/learn/SessionCard.tsx`** — smaller card for individual sessions within a sub-domain.
- Title
- Estimated time
- If `available: true`: links to `/learn/session/{id}`
- If `available: false`: dimmed styling, "Coming soon" label, no link/not clickable

### Removed components

- `components/learn/LearnCard.tsx` — replaced by `DomainCard` (homepage) and `SessionCard` (domain pages)

### Modified components

**`components/learn/SessionStepper.tsx`** — "Back to Home" link updated.
- Currently links to `/` with `onClick={reset}`
- Changed to link to the session's domain page (e.g., `/learn/ice`) instead of the homepage
- The domain is derived from the session data in the store (`session.domain`)

## Pages

### New pages

**`app/learn/[domain]/page.tsx`** — domain page route.
- Client component (needs `useRouter` for redirect on invalid domain)
- Validates `domain` param against the `domainConfigs` array (not hardcoded strings) using `getDomainConfig()`
- Redirects to `/` if invalid
- Renders `DomainPage` with the corresponding `DomainLearnConfig`

### Moved pages

**`app/learn/session/[sessionId]/page.tsx`** — session stepper page.
- Same implementation as current `app/learn/[sessionId]/page.tsx`, just moved to the new route

### Removed pages

- `app/learn/[sessionId]/` — entire directory deleted (replaced by `app/learn/[domain]/` and `app/learn/session/[sessionId]/`)

### Modified pages

**`app/page.tsx`** — Learn tab updated.
- Imports `domainConfigs` from `data/learn/index`
- Renders 3 `DomainCard` components instead of `LearnCard` list
- Footer text unchanged

## Session loader

`lib/session-loader.ts` — unchanged. Still loads session JSON by ID via static import. The `available` flag in the index controls whether the UI links to the session; the loader doesn't need to know about availability.
