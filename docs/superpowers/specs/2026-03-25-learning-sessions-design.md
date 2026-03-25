# Learning Sessions: 7-Phase Evidence-Based Learning Flow

## Overview

Add a "Learn" section to the DANB CDA practice exam app that implements a 7-phase evidence-based learning session. Each session teaches a single topic deeply through pre-testing, chunked content, elaborative interrogation, clinical scenario practice, interleaved cross-domain questions, AI-evaluated teach-back, and spaced repetition scheduling.

The initial implementation includes one session (Sterilization Methods & Instrument Processing) as a proof-of-concept. The SRS phase is presentational only. The teach-back phase uses the Anthropic API (Claude Haiku) for evaluation with graceful fallback.

## Data Schema

Each learning session is a self-contained JSON file stored in `data/learn/`.

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

  scenarioConfidence: string | null;
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
  setConfidence: (level: string) => void;
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

The phase order is a fixed array. `nextPhase`/`prevPhase` increment/decrement an index. Navigation guards prevent skipping ahead (e.g., Phase 2 requires Phase 1 to have an answer).

## Routing & Navigation

### New routes

| Route | Purpose |
|-------|---------|
| `/learn/[sessionId]` | Single-page stepper for a learning session |

### Homepage changes

The homepage (`app/page.tsx`) gets two tabs: **Practice Exams** (existing content) and **Learn** (new). The Learn tab shows session cards with domain badge, topic, estimated time, and science technique tags. For now, one card linking to `/learn/ice-spaulding-classification`.

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

`data/learn/index.ts` — exports available sessions with metadata for homepage cards.

### Session loader

`lib/session-loader.ts` — loads and validates a session JSON file by sessionId.

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
