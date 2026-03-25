# Learning Sessions: 7-Phase Evidence-Based Learning Flow

## Overview

Add a "Learn" section to the DANB CDA practice exam app that implements a 7-phase evidence-based learning session. Each session teaches a single topic deeply through pre-testing, chunked content, elaborative interrogation, clinical scenario practice, interleaved cross-domain questions, AI-evaluated teach-back, and spaced repetition scheduling.

The initial implementation includes one session (Sterilization Methods & Instrument Processing) as a proof-of-concept. The SRS phase is presentational only. The teach-back phase uses the Anthropic API (Claude Haiku) for evaluation with graceful fallback.

## Type Definitions

All new types live in `types/learn.ts`. The `ExamType` type is imported from `@/types/exam`.

## Data Schema

Each learning session is a self-contained JSON file stored in `data/learn/`. Session IDs are kebab-case strings (e.g., `ice-spaulding-classification`).

```typescript
interface LearningSession {
  id: string;                    // e.g., "ice-spaulding-classification"
  title: string;                 // "Sterilization Methods & Instrument Processing"
  domain: ExamType;              // "gc" | "rhs" | "ice"
  topic: string;                 // "Process Instruments and Devices"
  estimatedMinutes: number;      // 12

  phases: {
    preTest: PreTestPhase;
    content: ContentPhase;
    elaboration: ElaborationPhase;
    scenario: ScenarioPhase;
    interleaved: InterleavedPhase;
    teachBack: TeachBackPhase;
    srsSchedule: SRSPhase;
  };
}

interface PreTestPhase {
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

interface ContentPhase {
  conceptTitle: string;
  conceptBody: string;           // HTML string
  diagram?: string;              // SVG string (optional)
  scienceTags: string[];
}

interface ElaborationPhase {
  prompt: string;
  expertReasoning: string;       // HTML string, revealed after reflection
}

interface ScenarioPhase {
  scenarioText: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  detailedExplanation: string;   // HTML string — why every wrong answer is wrong
}

interface InterleavedPhase {
  domainLabel: string;           // e.g., "Radiation Health & Safety"
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

interface TeachBackPhase {
  prompt: string;
  modelAnswer: string;
}

interface SRSPhase {
  items: {
    concept: string;
    interval: string;            // "Tomorrow" | "3 days" | "8 days"
  }[];
  sessionSummary: string;
}
```

## State Management

A new Zustand store at `stores/learn-store.ts`. No persistence — sessions are short and not resumable.

```typescript
type PhaseKey = "preTest" | "content" | "elaboration" | "scenario" | "interleaved" | "teachBack" | "srsSchedule";

interface LearnState {
  session: LearningSession | null;
  currentPhase: PhaseKey;

  // Phase responses
  preTestAnswer: string | null;
  preTestCorrect: boolean | null;

  scenarioConfidence: ConfidenceLevel | null;
  scenarioAnswer: string | null;
  scenarioCorrect: boolean | null;

  interleavedAnswer: string | null;
  interleavedCorrect: boolean | null;

  elaborationRevealed: boolean;

  teachBackResponse: string;
  teachBackEvaluation: TeachBackEvaluation | null;
  teachBackLoading: boolean;

  // Actions
  startSession: (session: LearningSession) => void;
  goToPhase: (phase: PhaseKey) => void;
  nextPhase: () => void;
  prevPhase: () => void;

  answerPreTest: (optionId: string) => void;
  setConfidence: (level: ConfidenceLevel) => void;
  answerScenario: (optionId: string) => void;
  answerInterleaved: (optionId: string) => void;
  revealElaboration: () => void;

  setTeachBackResponse: (text: string) => void;
  submitTeachBack: () => Promise<void>;

  reset: () => void;
}

interface TeachBackEvaluation {
  accuracy: "good" | "partial" | "missed";
  completeness: number;
  feedback: string;
  missedConcepts: string[];
}
```

```typescript
type ConfidenceLevel = "guessing" | "somewhat" | "confident" | "very-confident";
```

The phase order is a fixed array. `nextPhase`/`prevPhase` increment/decrement an index.

### Confidence selector behavior

The confidence selector appears in Phase 4 (Scenario) **before** the answer options. The user selects a confidence level, then answers the question. Confidence selection is required before the answer options become active. The confidence data is stored for potential future use (hypercorrection effect analysis) but has no behavioral effect in this implementation.

The four levels displayed as buttons in a row: "Guessing" | "Somewhat sure" | "Confident" | "Very confident".

### Navigation guards

Each phase has a gate condition that must be met before advancing:

| Phase | Gate to advance |
|-------|----------------|
| 1 - Pre-test | Must select an answer |
| 2 - Content | Must view (no action required — arriving on the phase is sufficient) |
| 3 - Elaboration | Must click "Reveal expert reasoning" |
| 4 - Scenario | Must select confidence level AND select an answer |
| 5 - Interleaved | Must select an answer |
| 6 - Teach-back | Must type a response (non-empty) and either submit for AI evaluation or skip. Submitting is not required but the textarea must not be empty. |
| 7 - SRS | Terminal phase — no forward gate. Shows "Back to Home" and "Restart" buttons. |

**Backward navigation:** The user can freely navigate back to any previously completed phase. The Back button is hidden on Phase 1. On Phase 7, Back returns to Phase 6.

## Routing & Navigation

### New routes

| Route | Purpose |
|-------|---------|
| `/learn/[sessionId]` | Single-page stepper for a learning session |

### Homepage changes

The homepage (`app/page.tsx`) gets two tabs using the existing shadcn `Tabs` component (`components/ui/tabs.tsx`): **Practice Exams** (existing content, default active tab) and **Learn** (new). Tab state is client-side only — no URL change. The Learn tab shows session cards with domain badge, topic, estimated time, and science technique tags. For now, one card linking to `/learn/ice-spaulding-classification`.

### Session page layout

- **Top:** Progress bar (7 segments) + step counter ("Step 3 of 7 — Sterilization methods & instrument processing")
- **Middle:** Active phase component
- **Bottom:** Back/Next navigation with contextual labels ("Continue to teaching phase", "Continue to scenario practice", etc.)
- Redirect to homepage if sessionId is invalid

## Components

All new components in `components/learn/`:

| Component | Purpose |
|-----------|---------|
| `SessionStepper.tsx` | Orchestrator — reads store, renders active phase + progress bar + nav |
| `PhasePreTest.tsx` | Cold retrieval question with radio options, correct/incorrect feedback |
| `PhaseContent.tsx` | Teaching content with optional SVG diagram and science tags |
| `PhaseElaboration.tsx` | "Why" prompt with reveal button for expert reasoning |
| `PhaseScenario.tsx` | Clinical vignette + confidence selector + question + elaborated feedback for all choices |
| `PhaseInterleaved.tsx` | Cross-domain question with domain switch label + feedback |
| `PhaseTeachBack.tsx` | Prompt + textarea + submit for AI evaluation + model answer reveal |
| `PhaseSRS.tsx` | SRS item cards with intervals + session summary |
| `LearnCard.tsx` | Homepage card for session selection |
| `ConfidenceSelector.tsx` | Reusable row of confidence level buttons |
| `ScienceTag.tsx` | Small badge for learning science technique labels |
| `PhaseBadge.tsx` | Colored "Phase N" badge |
| `FeedbackBox.tsx` | Reusable correct/incorrect/detail feedback display |

## AI Teach-Back Evaluation

### API route

`app/api/evaluate-teachback/route.ts` — a Next.js Route Handler.

### Request

```typescript
{
  userResponse: string;
  prompt: string;
  modelAnswer: string;
  sessionTopic: string;
}
```

### Response

```typescript
{
  accuracy: "good" | "partial" | "missed";
  completeness: number;        // 0-100
  feedback: string;            // 2-3 sentences
  missedConcepts: string[];
}
```

### Implementation details

- **Model:** `claude-haiku-4-5-20251001` via `@anthropic-ai/sdk`
- **System prompt:** Act as a dental assisting instructor evaluating a student's explanation. Evaluate against the model answer for factual accuracy and completeness. Be encouraging but honest. Return structured JSON.
- **Environment:** `ANTHROPIC_API_KEY` in `.env.local`
- **Graceful degradation:** If the API key is missing or the call fails, the UI skips the evaluation and shows just the model answer. The AI evaluation enhances but does not gate the teach-back phase.
- **Loading state:** While the API call is in progress, the submit button shows a spinner and is disabled. A "Skip evaluation" link is visible so the user can proceed without waiting.
- **Evaluation display:** On success, show the `feedback` text, the `accuracy` as a colored badge (good=green, partial=yellow, missed=red), and `missedConcepts` as a bulleted list if non-empty. The `completeness` percentage is shown as a small progress bar. The model answer is always shown below the evaluation.
- **Timeout:** 15 second timeout on the API call. On timeout, treat as a failure and show the model answer without evaluation.

## Session Data

### File

`data/learn/ice-spaulding-classification.json` — all content from the HTML walkthrough:

- Pre-test: Handpiece Spaulding classification question (4 options)
- Content: Spaulding Classification teaching text + SVG triangle diagram
- Elaboration: Why CDC requires heat sterilization for handpieces, expert reasoning
- Scenario: Positive biological indicator protocol (4 options, elaborated feedback for all wrong answers)
- Interleaved: RHS radiographic foreshortening question (4 options)
- Teach-back: Explain Spaulding Classification to a new dental assistant
- SRS: 5 items at Tomorrow/3 days/8 days intervals

### Session index

`data/learn/index.ts` — exports available sessions with metadata for homepage cards:

```typescript
interface SessionMeta {
  id: string;                    // matches the JSON filename
  title: string;
  domain: ExamType;
  topic: string;
  estimatedMinutes: number;
  scienceTags: string[];         // subset shown on card
}

export const learningSessions: SessionMeta[] = [
  {
    id: "ice-spaulding-classification",
    title: "Sterilization Methods & Instrument Processing",
    domain: "ice",
    topic: "Process Instruments and Devices",
    estimatedMinutes: 12,
    scienceTags: ["Retrieval practice", "Dual coding", "Interleaving", "Spaced repetition"],
  },
];
```

### Session loader

`lib/session-loader.ts` — loads a session JSON file by sessionId using static imports (matching the pattern in `question-loader.ts`). Returns `LearningSession | null` — returns `null` if the sessionId doesn't match any known session. No schema validation beyond TypeScript types; the data is authored by us.

For the initial single session, this is a simple switch/map over the known session ID. The pattern scales to a dynamic `import()` approach when more sessions are added.

### New dependency

`@anthropic-ai/sdk` must be added to `package.json` for the teach-back evaluation API route.

## Content rendering

The `diagram` field (SVG string) and HTML content fields (`conceptBody`, `expertReasoning`, `detailedExplanation`) are rendered via `dangerouslySetInnerHTML`. This is safe because the content is authored by us in static JSON files, not user-supplied.

## What is deferred

- FSRS spaced repetition engine (SRS phase is presentational only)
- Adaptive algorithm (BKT mastery tracking)
- Persistent user state / accounts
- Multiple learning sessions
- Instrument identification drills
- Worked example fading
- After-action reviews
- Mobile/offline support
