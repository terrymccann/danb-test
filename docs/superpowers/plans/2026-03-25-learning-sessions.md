# Learning Sessions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 7-phase evidence-based learning session flow to the DANB CDA practice exam app, with one proof-of-concept session on Sterilization Methods & Instrument Processing.

**Architecture:** Single-page stepper at `/learn/[sessionId]` with a new Zustand store (no persistence), 7 phase components orchestrated by a `SessionStepper`, and a server-side API route for AI teach-back evaluation via Claude Haiku. Homepage gets tabbed navigation (Practice Exams / Learn).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Zustand, Tailwind CSS 4, shadcn/ui (base-nova), @anthropic-ai/sdk, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-03-25-learning-sessions-design.md`

---

## File Structure

### New files to create

| File | Responsibility |
|------|---------------|
| `types/learn.ts` | All learning session type definitions |
| `data/learn/ice-spaulding-classification.json` | Session content data |
| `data/learn/index.ts` | Session index with metadata for homepage cards |
| `lib/session-loader.ts` | Load session JSON by ID |
| `stores/learn-store.ts` | Zustand store for learning session state |
| `components/learn/ScienceTag.tsx` | Small badge for learning science technique labels |
| `components/learn/PhaseBadge.tsx` | Colored "Phase N" badge |
| `components/learn/FeedbackBox.tsx` | Reusable correct/incorrect/detail feedback display |
| `components/learn/ConfidenceSelector.tsx` | Row of confidence level buttons |
| `components/learn/PhasePreTest.tsx` | Phase 1: cold retrieval question |
| `components/learn/PhaseContent.tsx` | Phase 2: chunked content with SVG diagram |
| `components/learn/PhaseElaboration.tsx` | Phase 3: "why" prompt with reveal |
| `components/learn/PhaseScenario.tsx` | Phase 4: clinical vignette + confidence + question |
| `components/learn/PhaseInterleaved.tsx` | Phase 5: cross-domain question |
| `components/learn/PhaseTeachBack.tsx` | Phase 6: textarea + AI evaluation |
| `components/learn/PhaseSRS.tsx` | Phase 7: SRS schedule + session summary |
| `components/learn/SessionStepper.tsx` | Orchestrator: progress bar + active phase + nav |
| `components/learn/LearnCard.tsx` | Homepage card for session selection |
| `app/learn/[sessionId]/page.tsx` | Session page route |
| `app/api/evaluate-teachback/route.ts` | AI evaluation API route |

### Files to modify

| File | Change |
|------|--------|
| `app/page.tsx` | Add tabbed navigation (Practice Exams / Learn) |
| `package.json` | Add `@anthropic-ai/sdk` dependency |

---

## Task 1: Types and Data Layer

**Files:**
- Create: `types/learn.ts`
- Create: `data/learn/ice-spaulding-classification.json`
- Create: `data/learn/index.ts`
- Create: `lib/session-loader.ts`

- [ ] **Step 1: Create type definitions**

Create `types/learn.ts` with all interfaces from the spec:

```typescript
import type { ExamType } from "@/types/exam";

export type PhaseKey =
  | "preTest"
  | "content"
  | "elaboration"
  | "scenario"
  | "interleaved"
  | "teachBack"
  | "srsSchedule";

export type ConfidenceLevel =
  | "guessing"
  | "somewhat"
  | "confident"
  | "very-confident";

export interface PhaseOption {
  id: string;
  text: string;
}

export interface PreTestPhase {
  question: string;
  options: PhaseOption[];
  correctOptionId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface ContentPhase {
  conceptTitle: string;
  conceptBody: string;
  diagram?: string;
  scienceTags: string[];
}

export interface ElaborationPhase {
  prompt: string;
  expertReasoning: string;
}

export interface ScenarioPhase {
  scenarioText: string;
  question: string;
  options: PhaseOption[];
  correctOptionId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  detailedExplanation: string;
}

export interface InterleavedPhase {
  domainLabel: string;
  question: string;
  options: PhaseOption[];
  correctOptionId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface TeachBackPhase {
  prompt: string;
  modelAnswer: string;
}

export interface SRSItem {
  concept: string;
  interval: string;
}

export interface SRSPhase {
  items: SRSItem[];
  sessionSummary: string;
}

export interface LearningSession {
  id: string;
  title: string;
  domain: ExamType;
  topic: string;
  estimatedMinutes: number;
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

export interface SessionMeta {
  id: string;
  title: string;
  domain: ExamType;
  topic: string;
  estimatedMinutes: number;
  scienceTags: string[];
}

export interface TeachBackEvaluation {
  accuracy: "good" | "partial" | "missed";
  completeness: number;
  feedback: string;
  missedConcepts: string[];
}
```

- [ ] **Step 2: Create session data JSON**

Create `data/learn/ice-spaulding-classification.json` with all content from the HTML walkthrough. The content is extracted from `tmp/danb-cda-learning-session-walkthrough.html`. The SVG diagram uses fixed colors (not CSS variables) for JSON compatibility.

```json
{
  "id": "ice-spaulding-classification",
  "title": "Sterilization Methods & Instrument Processing",
  "domain": "ice",
  "topic": "Process Instruments and Devices",
  "estimatedMinutes": 12,
  "phases": {
    "preTest": {
      "question": "A dental handpiece is classified as a <strong>semi-critical</strong> item under the Spaulding Classification. What is the minimum acceptable level of processing required before it can be used on the next patient?",
      "options": [
        { "id": "a", "text": "Wipe down with an intermediate-level surface disinfectant" },
        { "id": "b", "text": "Immerse in a high-level disinfectant for 20 minutes" },
        { "id": "c", "text": "Heat sterilize in a steam autoclave after cleaning" },
        { "id": "d", "text": "Flush the waterlines for 30 seconds between patients" }
      ],
      "correctOptionId": "c",
      "feedbackCorrect": "<strong>Correct.</strong> You already have a head start on this topic. The teaching phase will deepen and connect what you know.",
      "feedbackIncorrect": "<strong>That's not right — and that's the point.</strong> Most learners get pre-test questions wrong. Research by Richland, Kornell & Kao (2009) showed that even unsuccessful retrieval attempts boost later learning by 20–40%. Your brain just flagged this as a gap. Now it will pay closer attention when the content is taught."
    },
    "content": {
      "conceptTitle": "The Spaulding Classification",
      "conceptBody": "<strong>The one concept:</strong> The Spaulding Classification (developed by Earle Spaulding in 1968) sorts all patient-care items into three categories based on the <em>risk of infection</em> from their use. A dental handpiece contacts mucous membranes but does not normally penetrate soft tissue or bone, making it <strong>semi-critical</strong>. The CDC's 2003 Guidelines for Infection Control in Dental Health-Care Settings specifically state that dental handpieces <strong>must be heat sterilized between patients</strong> — high-level disinfection alone is not acceptable for handpieces, even though it's technically the minimum for semi-critical items, because handpieces have internal components that can harbor contaminants. This is a frequent DANB exam point.",
      "diagram": "<svg viewBox=\"0 0 520 310\" xmlns=\"http://www.w3.org/2000/svg\" style=\"width:100%;max-width:520px\"><polygon points=\"260,20 420,240 100,240\" fill=\"#FCEBEB\" stroke=\"#E24B4A\" stroke-width=\"1.5\"/><polygon points=\"260,80 380,210 140,210\" fill=\"#FAEEDA\" stroke=\"#EF9F27\" stroke-width=\"1\"/><polygon points=\"260,130 350,195 170,195\" fill=\"#E6F1FB\" stroke=\"#378ADD\" stroke-width=\"1\"/><text x=\"260\" y=\"55\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"500\" fill=\"#791F1F\">Critical</text><text x=\"260\" y=\"70\" text-anchor=\"middle\" font-size=\"10\" fill=\"#A32D2D\">Penetrates tissue/bone → Must sterilize</text><text x=\"260\" y=\"115\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"500\" fill=\"#633806\">Semi-critical</text><text x=\"260\" y=\"130\" text-anchor=\"middle\" font-size=\"10\" fill=\"#854F0B\">Touches mucous membranes → Sterilize or HLD</text><text x=\"260\" y=\"168\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"500\" fill=\"#0C447C\">Non-critical</text><text x=\"260\" y=\"183\" text-anchor=\"middle\" font-size=\"10\" fill=\"#185FA5\">Contacts intact skin only → Clean + disinfect</text><text x=\"100\" y=\"265\" text-anchor=\"start\" font-size=\"10\" fill=\"#6b7280\">Examples: Surgical forceps, scalpels, scalers (critical) · Dental mirrors, handpieces, impression trays (semi-critical) · X-ray heads, blood pressure cuffs, countertops (non-critical)</text><text x=\"100\" y=\"285\" text-anchor=\"start\" font-size=\"10\" fill=\"#6b7280\">Key CDC rule: Semi-critical items that contact mucous membranes should be heat sterilized. If not heat-tolerant, use high-level disinfection (HLD) as the minimum.</text></svg>",
      "scienceTags": ["Cognitive load theory", "Dual coding"]
    },
    "elaboration": {
      "prompt": "Why does the CDC require heat sterilization specifically for dental handpieces, even though the Spaulding Classification technically allows high-level disinfection for semi-critical items? What is it about the physical design of a handpiece that creates a unique infection risk?",
      "expertReasoning": "<strong>Expert reasoning:</strong> Dental handpieces have <em>internal turbines and waterlines</em> that cannot be adequately reached by liquid chemical disinfectants. During use, oral fluids and debris are aspirated (\"sucked back\") into these internal components through a mechanism called <strong>retraction</strong>. Simply wiping or soaking the exterior doesn't decontaminate these internal channels. Only the heat and pressure of steam sterilization (250°F/121°C at 15 psi) can penetrate these internal components and kill all microorganisms, including bacterial endospores. This is why the CDC carved out a specific exception: handpieces must be heat sterilized, not merely high-level disinfected, even though their Spaulding classification would normally allow HLD. The DANB exam tests this distinction frequently because it requires understanding the <em>reasoning behind the rule</em>, not just the rule itself."
    },
    "scenario": {
      "scenarioText": "You are the infection control coordinator at a busy general practice. During your weekly sterilization monitoring review, you discover that the most recent biological indicator (spore test) for the office's steam autoclave came back <strong>positive</strong> — meaning live spores survived the cycle. The autoclave was used to process instruments for 14 patients over the past three days before the test results were returned. The dentist is currently with a patient and has a full afternoon schedule.",
      "question": "What is the <strong>most appropriate immediate</strong> action?",
      "options": [
        { "id": "a", "text": "Continue using the autoclave but run a second spore test immediately to confirm the result before taking any action" },
        { "id": "b", "text": "Remove the autoclave from service immediately, re-test with a new biological indicator, and do not use instruments processed in that autoclave until the issue is resolved" },
        { "id": "c", "text": "Contact all 14 patients immediately to inform them of a potential infection exposure" },
        { "id": "d", "text": "Switch to chemical vapor sterilization for the afternoon and investigate the autoclave failure after the last patient" }
      ],
      "correctOptionId": "b",
      "feedbackCorrect": "<strong>Correct.</strong> The CDC guidelines require that any sterilizer with a positive spore test be immediately removed from service. A repeat biological indicator test is run, and the sterilizer must not be used again until the issue is identified and resolved. Items processed since the last negative spore test should be recalled if possible, though patient notification depends on state law and the specific circumstances.",
      "feedbackIncorrect": "<strong>Not quite.</strong> The correct answer is <strong>B — remove the autoclave from service immediately and re-test</strong>. This follows CDC guidelines: a positive spore test means the sterilizer may not be achieving sterilization, and it must be pulled from use until the cause is found and corrected.",
      "detailedExplanation": "<strong>Why every other answer is wrong:</strong><br/><br/><strong>A (Continue using + re-test)</strong> — This is the most dangerous choice. A positive biological indicator means sterilization may have failed. Continuing to use the autoclave while \"confirming\" exposes more patients to potentially non-sterile instruments. The CDC is clear: remove from service first, then investigate.<br/><br/><strong>C (Contact all 14 patients immediately)</strong> — While patient notification may eventually be warranted, it is not the <em>immediate</em> first action. The priority is to stop the problem (remove sterilizer from service) and confirm the failure before escalating to patient contact. Premature notification without confirmed failure could cause unnecessary alarm. Notification protocols vary by state law and should involve the dentist and possibly legal counsel.<br/><br/><strong>D (Switch to chemical vapor for the afternoon)</strong> — This correctly stops using the failed autoclave but delays investigation. More importantly, the question tests whether you know the protocol: remove from service AND re-test immediately. Simply switching methods and \"investigating later\" doesn't follow CDC recommendations, which prioritize prompt identification and correction of the failure.<br/><br/><strong>Exam insight:</strong> DANB frequently tests the sequence of actions after a positive spore test. The key protocol is: (1) remove from service, (2) re-test, (3) review procedures and correct the problem, (4) re-test again, (5) return to service only after negative result. Items processed since the last negative test should be retrieved if possible and reprocessed."
    },
    "interleaved": {
      "domainLabel": "Radiation Health & Safety",
      "question": "A dental assistant takes a periapical radiograph of tooth #8 using the paralleling technique. The resulting image shows the tooth appearing significantly shorter than its actual length, with the roots appearing compressed. What is the most likely cause of this error?",
      "options": [
        { "id": "a", "text": "The PID (cone) was angled too far toward the patient's feet (negative vertical angulation)" },
        { "id": "b", "text": "The patient moved during the exposure" },
        { "id": "c", "text": "Excessive vertical angulation of the PID — the beam was directed too steeply downward" },
        { "id": "d", "text": "The sensor/film was placed too far from the tooth being imaged" }
      ],
      "correctOptionId": "c",
      "feedbackCorrect": "<strong>Correct.</strong> Excessive positive vertical angulation (beam aimed too steeply) causes <strong>foreshortening</strong> — the image appears shorter than the actual tooth. This is a fundamental paralleling technique error. The opposite error — insufficient vertical angulation — causes <strong>elongation</strong>, where the tooth appears longer than reality. The DANB RHS exam frequently tests your ability to diagnose radiographic errors from image descriptions.",
      "feedbackIncorrect": "<strong>This is the tricky part about interleaving.</strong> The answer is <strong>C — excessive vertical angulation causing foreshortening</strong>. This question jumped from Infection Control to Radiation Health & Safety. That sudden shift forces you to switch mental gears — and that's exactly the skill the CDA exam tests, since it mixes questions from all domains. In radiology, remember: too much angulation = foreshortening (short image), too little = elongation (long image)."
    },
    "teachBack": {
      "prompt": "A new dental assistant on their first day asks you: \"How do I know whether to sterilize something or just wipe it down with disinfectant?\" In 2–3 sentences, explain the Spaulding Classification and the key rule about dental handpieces. Use no textbook jargon.",
      "modelAnswer": "It depends on what the item touches. If it goes inside tissue — like a scalpel or needle — it needs full sterilization, no exceptions. If it goes in the mouth but doesn't cut into anything — like mirrors and handpieces — it also needs to be sterilized, because the mouth has mucous membranes that can easily pick up germs. If it only touches skin or surfaces — like the X-ray cone or the countertop — then cleaning and disinfecting is enough. The big one to remember is handpieces: even though they don't cut tissue, they have internal parts that suck in stuff from the mouth, so they always need heat sterilization."
    },
    "srsSchedule": {
      "items": [
        { "concept": "Spaulding Classification — critical vs. semi-critical vs. non-critical definitions and examples", "interval": "Tomorrow" },
        { "concept": "Positive biological indicator protocol — remove from service, re-test, correct, re-test, return", "interval": "Tomorrow" },
        { "concept": "Dental handpiece sterilization exception — why HLD is not acceptable (internal retraction contamination)", "interval": "3 days" },
        { "concept": "Radiographic foreshortening vs. elongation — vertical angulation errors and their image effects", "interval": "3 days" },
        { "concept": "Steam autoclave parameters — 250°F (121°C), 15 psi, 15–30 minutes depending on load", "interval": "8 days" }
      ],
      "sessionSummary": "This 7-phase session covered one concept deeply — the Spaulding Classification and instrument processing — while weaving in a cross-domain radiology question to build discrimination skills. A traditional study guide would have listed 20 facts about sterilization for you to highlight and forget. Research consistently shows deep processing of fewer concepts produces better exam performance than shallow coverage of many."
    }
  }
}
```

- [ ] **Step 3: Create session index**

Create `data/learn/index.ts`:

```typescript
import type { SessionMeta } from "@/types/learn";

export const learningSessions: SessionMeta[] = [
  {
    id: "ice-spaulding-classification",
    title: "Sterilization Methods & Instrument Processing",
    domain: "ice",
    topic: "Process Instruments and Devices",
    estimatedMinutes: 12,
    scienceTags: [
      "Retrieval practice",
      "Dual coding",
      "Interleaving",
      "Spaced repetition",
    ],
  },
];
```

- [ ] **Step 4: Create session loader**

Create `lib/session-loader.ts`:

```typescript
import type { LearningSession } from "@/types/learn";

import iceSpaulding from "@/data/learn/ice-spaulding-classification.json";

const sessions: Record<string, LearningSession> = {
  "ice-spaulding-classification": iceSpaulding as unknown as LearningSession,
};

export function loadSession(sessionId: string): LearningSession | null {
  return sessions[sessionId] ?? null;
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to the new files.

- [ ] **Step 6: Commit**

```bash
git add types/learn.ts data/learn/ lib/session-loader.ts
git commit -m "feat(learn): add types, session data, and loader"
```

---

## Task 2: Zustand Store

**Files:**
- Create: `stores/learn-store.ts`

- [ ] **Step 1: Create the learn store**

Create `stores/learn-store.ts`. Follow the same `create<State>()` pattern as `stores/exam-store.ts` but without persistence middleware.

```typescript
import { create } from "zustand";
import type {
  LearningSession,
  PhaseKey,
  ConfidenceLevel,
  TeachBackEvaluation,
} from "@/types/learn";

const PHASE_ORDER: PhaseKey[] = [
  "preTest",
  "content",
  "elaboration",
  "scenario",
  "interleaved",
  "teachBack",
  "srsSchedule",
];

interface LearnState {
  session: LearningSession | null;
  currentPhase: PhaseKey;
  phaseIndex: number;

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

  startSession: (session: LearningSession) => void;
  goToPhase: (phase: PhaseKey) => void;
  nextPhase: () => void;
  prevPhase: () => void;
  canAdvance: () => boolean;

  answerPreTest: (optionId: string) => void;
  setConfidence: (level: ConfidenceLevel) => void;
  answerScenario: (optionId: string) => void;
  answerInterleaved: (optionId: string) => void;
  revealElaboration: () => void;

  setTeachBackResponse: (text: string) => void;
  submitTeachBack: () => Promise<void>;

  reset: () => void;
}

export const useLearnStore = create<LearnState>()((set, get) => ({
  session: null,
  currentPhase: "preTest",
  phaseIndex: 0,

  preTestAnswer: null,
  preTestCorrect: null,

  scenarioConfidence: null,
  scenarioAnswer: null,
  scenarioCorrect: null,

  interleavedAnswer: null,
  interleavedCorrect: null,

  elaborationRevealed: false,

  teachBackResponse: "",
  teachBackEvaluation: null,
  teachBackLoading: false,

  startSession: (session) => {
    set({
      session,
      currentPhase: "preTest",
      phaseIndex: 0,
      preTestAnswer: null,
      preTestCorrect: null,
      scenarioConfidence: null,
      scenarioAnswer: null,
      scenarioCorrect: null,
      interleavedAnswer: null,
      interleavedCorrect: null,
      elaborationRevealed: false,
      teachBackResponse: "",
      teachBackEvaluation: null,
      teachBackLoading: false,
    });
  },

  goToPhase: (phase) => {
    const index = PHASE_ORDER.indexOf(phase);
    if (index >= 0) {
      set({ currentPhase: phase, phaseIndex: index });
    }
  },

  nextPhase: () => {
    const { phaseIndex } = get();
    if (!get().canAdvance()) return;
    if (phaseIndex < PHASE_ORDER.length - 1) {
      const newIndex = phaseIndex + 1;
      set({ phaseIndex: newIndex, currentPhase: PHASE_ORDER[newIndex] });
    }
  },

  prevPhase: () => {
    const { phaseIndex } = get();
    if (phaseIndex > 0) {
      const newIndex = phaseIndex - 1;
      set({ phaseIndex: newIndex, currentPhase: PHASE_ORDER[newIndex] });
    }
  },

  canAdvance: () => {
    const state = get();
    switch (state.currentPhase) {
      case "preTest":
        return state.preTestAnswer !== null;
      case "content":
        return true;
      case "elaboration":
        return state.elaborationRevealed;
      case "scenario":
        return state.scenarioConfidence !== null && state.scenarioAnswer !== null;
      case "interleaved":
        return state.interleavedAnswer !== null;
      case "teachBack":
        return state.teachBackResponse.trim().length > 0;
      case "srsSchedule":
        return false; // terminal phase
    }
  },

  answerPreTest: (optionId) => {
    const { session, preTestAnswer } = get();
    if (preTestAnswer !== null || !session) return; // already answered
    set({
      preTestAnswer: optionId,
      preTestCorrect: optionId === session.phases.preTest.correctOptionId,
    });
  },

  setConfidence: (level) => {
    set({ scenarioConfidence: level });
  },

  answerScenario: (optionId) => {
    const { session, scenarioAnswer } = get();
    if (scenarioAnswer !== null || !session) return;
    set({
      scenarioAnswer: optionId,
      scenarioCorrect: optionId === session.phases.scenario.correctOptionId,
    });
  },

  answerInterleaved: (optionId) => {
    const { session, interleavedAnswer } = get();
    if (interleavedAnswer !== null || !session) return;
    set({
      interleavedAnswer: optionId,
      interleavedCorrect: optionId === session.phases.interleaved.correctOptionId,
    });
  },

  revealElaboration: () => {
    set({ elaborationRevealed: true });
  },

  setTeachBackResponse: (text) => {
    set({ teachBackResponse: text });
  },

  submitTeachBack: async () => {
    const { session, teachBackResponse, teachBackEvaluation } = get();
    if (!session || teachBackEvaluation !== null) return;

    set({ teachBackLoading: true });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/evaluate-teachback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userResponse: teachBackResponse,
          prompt: session.phases.teachBack.prompt,
          modelAnswer: session.phases.teachBack.modelAnswer,
          sessionTopic: session.title,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("API error");

      const evaluation: TeachBackEvaluation = await res.json();
      // Clamp completeness to 0-100
      evaluation.completeness = Math.max(0, Math.min(100, evaluation.completeness));
      set({ teachBackEvaluation: evaluation, teachBackLoading: false });
    } catch {
      set({ teachBackLoading: false });
    }
  },

  reset: () => {
    set({
      session: null,
      currentPhase: "preTest",
      phaseIndex: 0,
      preTestAnswer: null,
      preTestCorrect: null,
      scenarioConfidence: null,
      scenarioAnswer: null,
      scenarioCorrect: null,
      interleavedAnswer: null,
      interleavedCorrect: null,
      elaborationRevealed: false,
      teachBackResponse: "",
      teachBackEvaluation: null,
      teachBackLoading: false,
    });
  },
}));

export { PHASE_ORDER };
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add stores/learn-store.ts
git commit -m "feat(learn): add Zustand store for learning sessions"
```

---

## Task 3: Reusable UI Components

**Files:**
- Create: `components/learn/ScienceTag.tsx`
- Create: `components/learn/PhaseBadge.tsx`
- Create: `components/learn/FeedbackBox.tsx`
- Create: `components/learn/ConfidenceSelector.tsx`

These are small, self-contained presentation components used across multiple phases.

- [ ] **Step 1: Create ScienceTag**

Create `components/learn/ScienceTag.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";

interface ScienceTagProps {
  label: string;
}

export function ScienceTag({ label }: ScienceTagProps) {
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {label}
    </Badge>
  );
}
```

- [ ] **Step 2: Create PhaseBadge**

Create `components/learn/PhaseBadge.tsx`. Each phase has a distinct color matching the HTML walkthrough:

```tsx
import { cn } from "@/lib/utils";
import type { PhaseKey } from "@/types/learn";

const PHASE_STYLES: Record<PhaseKey, { bg: string; text: string; label: string }> = {
  preTest: { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", label: "Phase 1" },
  content: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", label: "Phase 2" },
  elaboration: { bg: "bg-amber-100 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", label: "Phase 3" },
  scenario: { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", label: "Phase 4" },
  interleaved: { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", label: "Phase 5" },
  teachBack: { bg: "bg-violet-100 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", label: "Phase 6" },
  srsSchedule: { bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", label: "Phase 7" },
};

interface PhaseBadgeProps {
  phase: PhaseKey;
}

export function PhaseBadge({ phase }: PhaseBadgeProps) {
  const style = PHASE_STYLES[phase];
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2.5 py-0.5 text-xs font-medium",
        style.bg,
        style.text,
      )}
    >
      {style.label}
    </span>
  );
}
```

- [ ] **Step 3: Create FeedbackBox**

Create `components/learn/FeedbackBox.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface FeedbackBoxProps {
  variant: "correct" | "incorrect" | "detail";
  children: React.ReactNode;
  show: boolean;
}

export function FeedbackBox({ variant, children, show }: FeedbackBoxProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "rounded-md p-4 text-sm leading-relaxed",
        variant === "correct" &&
          "border-l-3 border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
        variant === "incorrect" &&
          "border-l-3 border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
        variant === "detail" &&
          "border-l-3 border-border bg-muted text-foreground",
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create ConfidenceSelector**

Create `components/learn/ConfidenceSelector.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/types/learn";

const LEVELS: { value: ConfidenceLevel; label: string }[] = [
  { value: "guessing", label: "Guessing" },
  { value: "somewhat", label: "Somewhat sure" },
  { value: "confident", label: "Confident" },
  { value: "very-confident", label: "Very confident" },
];

interface ConfidenceSelectorProps {
  selected: ConfidenceLevel | null;
  onSelect: (level: ConfidenceLevel) => void;
}

export function ConfidenceSelector({
  selected,
  onSelect,
}: ConfidenceSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">
        How confident do you feel about this topic?
      </p>
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onSelect(level.value)}
            className={cn(
              "flex-1 rounded-md border px-2 py-2 text-center text-xs transition-colors",
              selected === level.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add components/learn/ScienceTag.tsx components/learn/PhaseBadge.tsx components/learn/FeedbackBox.tsx components/learn/ConfidenceSelector.tsx
git commit -m "feat(learn): add reusable UI components — ScienceTag, PhaseBadge, FeedbackBox, ConfidenceSelector"
```

---

## Task 4: Phase Components (Phases 1-3)

**Files:**
- Create: `components/learn/PhasePreTest.tsx`
- Create: `components/learn/PhaseContent.tsx`
- Create: `components/learn/PhaseElaboration.tsx`

- [ ] **Step 1: Create PhasePreTest**

Create `components/learn/PhasePreTest.tsx`. Displays the pre-test question with radio-style option buttons. Once answered, highlights correct/incorrect and shows feedback. Uses `dangerouslySetInnerHTML` for the question text (contains `<strong>` tags) and feedback text.

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";
import { FeedbackBox } from "@/components/learn/FeedbackBox";
import { cn } from "@/lib/utils";

export function PhasePreTest() {
  const session = useLearnStore((s) => s.session);
  const preTestAnswer = useLearnStore((s) => s.preTestAnswer);
  const preTestCorrect = useLearnStore((s) => s.preTestCorrect);
  const answerPreTest = useLearnStore((s) => s.answerPreTest);

  if (!session) return null;
  const { question, options, correctOptionId, feedbackCorrect, feedbackIncorrect } =
    session.phases.preTest;
  const answered = preTestAnswer !== null;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="preTest" />
      <h2 className="text-lg font-medium">Pre-test: what do you already know?</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Before any teaching happens, you answer a question cold. This isn&apos;t to
        grade you — it&apos;s because{" "}
        <strong className="text-foreground">
          attempting retrieval before learning
        </strong>{" "}
        primes your brain to encode the answer more deeply when you see it, even if
        you get it wrong.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Retrieval practice" />
        <ScienceTag label="Pre-testing effect" />
      </div>

      <div
        className="rounded-md bg-muted p-4 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = preTestAnswer === option.id;
          const isCorrect = option.id === correctOptionId;
          let variant = "";
          if (answered) {
            if (isCorrect) variant = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950";
            else if (isSelected) variant = "border-red-500 bg-red-50 dark:bg-red-950";
            else variant = "opacity-50";
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => answerPreTest(option.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left text-sm leading-relaxed transition-colors",
                !answered && "hover:border-primary hover:bg-muted/50",
                answered ? variant : "",
              )}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <FeedbackBox variant="incorrect" show={answered && !preTestCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackIncorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="correct" show={answered && !!preTestCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackCorrect }} />
      </FeedbackBox>
    </div>
  );
}
```

- [ ] **Step 2: Create PhaseContent**

Create `components/learn/PhaseContent.tsx`. Displays the chunked teaching content with optional SVG diagram. Uses `dangerouslySetInnerHTML` for the concept body and diagram.

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";

export function PhaseContent() {
  const session = useLearnStore((s) => s.session);
  if (!session) return null;

  const { conceptTitle, conceptBody, diagram, scienceTags } =
    session.phases.content;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="content" />
      <h2 className="text-lg font-medium">
        Chunked content delivery: {conceptTitle}
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The content is broken into{" "}
        <strong className="text-foreground">
          exactly one concept per screen
        </strong>
        , respecting working memory limits of 4±1 items. Visuals and text together
        (dual coding) strengthen encoding through two separate memory channels.
      </p>
      <div className="flex gap-2">
        {scienceTags.map((tag) => (
          <ScienceTag key={tag} label={tag} />
        ))}
      </div>

      {diagram && (
        <div
          className="my-4"
          dangerouslySetInnerHTML={{ __html: diagram }}
        />
      )}

      <div
        className="rounded-md bg-muted p-4 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: conceptBody }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create PhaseElaboration**

Create `components/learn/PhaseElaboration.tsx`. Shows the "why" prompt and a button to reveal expert reasoning.

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";
import { Button } from "@/components/ui/button";

export function PhaseElaboration() {
  const session = useLearnStore((s) => s.session);
  const elaborationRevealed = useLearnStore((s) => s.elaborationRevealed);
  const revealElaboration = useLearnStore((s) => s.revealElaboration);

  if (!session) return null;
  const { prompt, expertReasoning } = session.phases.elaboration;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="elaboration" />
      <h2 className="text-lg font-medium">
        Elaborative interrogation: why, not just what
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Instead of moving on, the platform forces you to think about{" "}
        <strong className="text-foreground">why</strong> the classification works
        this way. This technique produces effect sizes of d = 0.54–0.69 — comparable
        to hiring a private tutor.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Elaborative interrogation" />
        <ScienceTag label="Self-explanation" />
      </div>

      <div className="rounded-md border-l-3 border-amber-500 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950 dark:text-amber-100">
        <strong>Think about this before revealing the answer:</strong>
        <br />
        <br />
        {prompt}
      </div>

      {!elaborationRevealed ? (
        <Button onClick={revealElaboration}>Reveal expert reasoning</Button>
      ) : (
        <div
          className="rounded-md bg-muted p-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: expertReasoning }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add components/learn/PhasePreTest.tsx components/learn/PhaseContent.tsx components/learn/PhaseElaboration.tsx
git commit -m "feat(learn): add phase components 1-3 — PreTest, Content, Elaboration"
```

---

## Task 5: Phase Components (Phases 4-5)

**Files:**
- Create: `components/learn/PhaseScenario.tsx`
- Create: `components/learn/PhaseInterleaved.tsx`

- [ ] **Step 1: Create PhaseScenario**

Create `components/learn/PhaseScenario.tsx`. Clinical vignette with confidence selector that must be completed before answer options become active. Shows elaborated feedback for all wrong answers.

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";
import { FeedbackBox } from "@/components/learn/FeedbackBox";
import { ConfidenceSelector } from "@/components/learn/ConfidenceSelector";
import { cn } from "@/lib/utils";

export function PhaseScenario() {
  const session = useLearnStore((s) => s.session);
  const scenarioConfidence = useLearnStore((s) => s.scenarioConfidence);
  const scenarioAnswer = useLearnStore((s) => s.scenarioAnswer);
  const scenarioCorrect = useLearnStore((s) => s.scenarioCorrect);
  const setConfidence = useLearnStore((s) => s.setConfidence);
  const answerScenario = useLearnStore((s) => s.answerScenario);

  if (!session) return null;
  const {
    scenarioText,
    question,
    options,
    correctOptionId,
    feedbackCorrect,
    feedbackIncorrect,
    detailedExplanation,
  } = session.phases.scenario;
  const answered = scenarioAnswer !== null;
  const confidenceSelected = scenarioConfidence !== null;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="scenario" />
      <h2 className="text-lg font-medium">
        Scenario vignette: applied clinical judgment
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Now you face a realistic clinical scenario. First, rate your confidence —{" "}
        <strong className="text-foreground">
          high-confidence errors corrected with feedback create the strongest
          memories
        </strong>
        .
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Scenario-based learning" />
        <ScienceTag label="Hypercorrection effect" />
      </div>

      <div className="rounded-md bg-muted p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Clinical Scenario
        </p>
        <div
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: scenarioText }}
        />
      </div>

      <ConfidenceSelector
        selected={scenarioConfidence}
        onSelect={setConfidence}
      />

      <div
        className="rounded-md bg-muted p-4 text-sm"
        dangerouslySetInnerHTML={{ __html: question }}
      />

      <div className={cn("space-y-2", !confidenceSelected && "pointer-events-none opacity-50")}>
        {options.map((option) => {
          const isSelected = scenarioAnswer === option.id;
          const isCorrect = option.id === correctOptionId;
          let variant = "";
          if (answered) {
            if (isCorrect) variant = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950";
            else if (isSelected) variant = "border-red-500 bg-red-50 dark:bg-red-950";
            else variant = "opacity-50";
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered || !confidenceSelected}
              onClick={() => answerScenario(option.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left text-sm leading-relaxed transition-colors",
                !answered && confidenceSelected && "hover:border-primary hover:bg-muted/50",
                answered ? variant : "",
              )}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <FeedbackBox variant="correct" show={answered && !!scenarioCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackCorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="incorrect" show={answered && !scenarioCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackIncorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="detail" show={answered}>
        <span dangerouslySetInnerHTML={{ __html: detailedExplanation }} />
      </FeedbackBox>
    </div>
  );
}
```

- [ ] **Step 2: Create PhaseInterleaved**

Create `components/learn/PhaseInterleaved.tsx`. Cross-domain question with a domain switch label.

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";
import { FeedbackBox } from "@/components/learn/FeedbackBox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PhaseInterleaved() {
  const session = useLearnStore((s) => s.session);
  const interleavedAnswer = useLearnStore((s) => s.interleavedAnswer);
  const interleavedCorrect = useLearnStore((s) => s.interleavedCorrect);
  const answerInterleaved = useLearnStore((s) => s.answerInterleaved);

  if (!session) return null;
  const {
    domainLabel,
    question,
    options,
    correctOptionId,
    feedbackCorrect,
    feedbackIncorrect,
  } = session.phases.interleaved;
  const answered = interleavedAnswer !== null;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="interleaved" />
      <h2 className="text-lg font-medium">
        Interleaved practice: mixing topics forces discrimination
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        This platform deliberately{" "}
        <strong className="text-foreground">
          mixes topics from different CDA domains
        </strong>{" "}
        so you must first identify which area of knowledge applies. Research shows
        interleaving produces 3× better delayed retention despite feeling harder.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Interleaving" />
        <ScienceTag label="Desirable difficulties" />
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed">
        <div className="mb-2">
          <Badge variant="outline">{domainLabel}</Badge>
        </div>
        {question}
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = interleavedAnswer === option.id;
          const isCorrect = option.id === correctOptionId;
          let variant = "";
          if (answered) {
            if (isCorrect) variant = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950";
            else if (isSelected) variant = "border-red-500 bg-red-50 dark:bg-red-950";
            else variant = "opacity-50";
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={answered}
              onClick={() => answerInterleaved(option.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left text-sm leading-relaxed transition-colors",
                !answered && "hover:border-primary hover:bg-muted/50",
                answered ? variant : "",
              )}
            >
              {option.text}
            </button>
          );
        })}
      </div>

      <FeedbackBox variant="correct" show={answered && !!interleavedCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackCorrect }} />
      </FeedbackBox>
      <FeedbackBox variant="incorrect" show={answered && !interleavedCorrect}>
        <span dangerouslySetInnerHTML={{ __html: feedbackIncorrect }} />
      </FeedbackBox>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/learn/PhaseScenario.tsx components/learn/PhaseInterleaved.tsx
git commit -m "feat(learn): add phase components 4-5 — Scenario, Interleaved"
```

---

## Task 6: Phase Components (Phases 6-7) and API Route

**Files:**
- Create: `components/learn/PhaseTeachBack.tsx`
- Create: `components/learn/PhaseSRS.tsx`
- Create: `app/api/evaluate-teachback/route.ts`
- Modify: `package.json` (add `@anthropic-ai/sdk`)

- [ ] **Step 1: Install Anthropic SDK**

Run: `npm install @anthropic-ai/sdk`

- [ ] **Step 2: Create API route**

Create `app/api/evaluate-teachback/route.ts`:

```typescript
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 503 },
    );
  }

  let body: {
    userResponse: string;
    prompt: string;
    modelAnswer: string;
    sessionTopic: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { userResponse, prompt, modelAnswer, sessionTopic } = body;

  if (!userResponse || !prompt || !modelAnswer || !sessionTopic) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You are a dental assisting instructor evaluating a student's explanation of a clinical concept. The topic is "${sessionTopic}". Evaluate the student's response against the model answer for factual accuracy and completeness. Be encouraging but honest. Respond ONLY with valid JSON in this exact format:
{
  "accuracy": "good" | "partial" | "missed",
  "completeness": <number 0-100>,
  "feedback": "<2-3 sentences of natural language feedback>",
  "missedConcepts": ["<concept 1>", "<concept 2>"]
}
Where accuracy is "good" if factually correct and covers key points, "partial" if mostly correct but missing important details, "missed" if fundamentally wrong or missing the core concept. missedConcepts should list specific key points from the model answer that the student did not cover. If nothing was missed, use an empty array.`,
      messages: [
        {
          role: "user",
          content: `Teach-back prompt given to the student: "${prompt}"

Model answer: "${modelAnswer}"

Student's response: "${userResponse}"

Evaluate the student's response.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const evaluation = JSON.parse(text);

    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Create PhaseTeachBack**

Create `components/learn/PhaseTeachBack.tsx`:

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhaseTeachBack() {
  const session = useLearnStore((s) => s.session);
  const teachBackResponse = useLearnStore((s) => s.teachBackResponse);
  const teachBackEvaluation = useLearnStore((s) => s.teachBackEvaluation);
  const teachBackLoading = useLearnStore((s) => s.teachBackLoading);
  const setTeachBackResponse = useLearnStore((s) => s.setTeachBackResponse);
  const submitTeachBack = useLearnStore((s) => s.submitTeachBack);
  const nextPhase = useLearnStore((s) => s.nextPhase);

  if (!session) return null;
  const { prompt, modelAnswer } = session.phases.teachBack;
  const hasResponse = teachBackResponse.trim().length > 0;
  const submitted = teachBackEvaluation !== null;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="teachBack" />
      <h2 className="text-lg font-medium">
        Teach-back: the Feynman technique
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Explaining concepts to others produces an effect size of g = 0.55 — you
        learn more by teaching than by restudying.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Generation effect" />
        <ScienceTag label="Feynman technique" />
      </div>

      <div className="rounded-md border-l-3 border-violet-500 bg-violet-50 p-4 text-sm leading-relaxed text-violet-900 dark:bg-violet-950 dark:text-violet-100">
        <strong>Teach-back prompt:</strong>
        <br />
        <br />
        {prompt}
      </div>

      <textarea
        value={teachBackResponse}
        onChange={(e) => setTeachBackResponse(e.target.value)}
        placeholder="Type your explanation here..."
        disabled={submitted}
        className="min-h-[120px] w-full resize-y rounded-md border bg-background p-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      />

      {!submitted && !teachBackLoading && (
        <div className="flex items-center gap-3">
          <Button onClick={submitTeachBack} disabled={!hasResponse}>
            Submit for AI evaluation
          </Button>
          {hasResponse && (
            <button
              type="button"
              onClick={nextPhase}
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Skip evaluation
            </button>
          )}
        </div>
      )}

      {teachBackLoading && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Evaluating your response...
          </div>
          <button
            type="button"
            onClick={nextPhase}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Skip evaluation
          </button>
        </div>
      )}

      {submitted && teachBackEvaluation && (
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                teachBackEvaluation.accuracy === "good" &&
                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
                teachBackEvaluation.accuracy === "partial" &&
                  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                teachBackEvaluation.accuracy === "missed" &&
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
              )}
            >
              {teachBackEvaluation.accuracy === "good" && "Good"}
              {teachBackEvaluation.accuracy === "partial" && "Partial"}
              {teachBackEvaluation.accuracy === "missed" && "Needs work"}
            </Badge>
            <Progress value={teachBackEvaluation.completeness} className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {teachBackEvaluation.completeness}%
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            {teachBackEvaluation.feedback}
          </p>
          {teachBackEvaluation.missedConcepts.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Missed concepts:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {teachBackEvaluation.missedConcepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div className="rounded-md bg-muted p-4 text-sm leading-relaxed">
          <strong>Model answer:</strong>
          <br />
          <br />
          {modelAnswer}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create PhaseSRS**

Create `components/learn/PhaseSRS.tsx`:

```tsx
"use client";

import { useLearnStore } from "@/stores/learn-store";
import { PhaseBadge } from "@/components/learn/PhaseBadge";
import { ScienceTag } from "@/components/learn/ScienceTag";
import { cn } from "@/lib/utils";

const INTERVAL_STYLES: Record<string, string> = {
  Tomorrow: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "3 days": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "8 days": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

export function PhaseSRS() {
  const session = useLearnStore((s) => s.session);
  if (!session) return null;

  const { items, sessionSummary } = session.phases.srsSchedule;

  return (
    <div className="space-y-4">
      <PhaseBadge phase="srsSchedule" />
      <h2 className="text-lg font-medium">
        Spaced repetition scheduling: what happens after
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Everything you just learned enters a{" "}
        <strong className="text-foreground">spaced repetition queue</strong>.
        Items you got wrong come back sooner. This produces 200%+ better long-term
        retention than restudying.
      </p>
      <div className="flex gap-2">
        <ScienceTag label="Spaced repetition (FSRS)" />
        <ScienceTag label="Forgetting curve" />
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.concept}
            className="flex items-center gap-3 rounded-md bg-muted p-3 text-sm"
          >
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
                INTERVAL_STYLES[item.interval] ?? "bg-muted-foreground/10",
              )}
            >
              {item.interval}
            </span>
            <span className="leading-relaxed">{item.concept}</span>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-muted p-4">
        <p className="mb-2 text-sm font-medium">Session complete</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {sessionSummary}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add components/learn/PhaseTeachBack.tsx components/learn/PhaseSRS.tsx app/api/evaluate-teachback/route.ts
git commit -m "feat(learn): add phases 6-7 (TeachBack, SRS) and AI evaluation API route"
```

---

## Task 7: Session Stepper and Learn Card

**Files:**
- Create: `components/learn/SessionStepper.tsx`
- Create: `components/learn/LearnCard.tsx`

- [ ] **Step 1: Create SessionStepper**

Create `components/learn/SessionStepper.tsx`. This is the orchestrator component that renders the progress bar, active phase, and back/next navigation.

```tsx
"use client";

import { useLearnStore, PHASE_ORDER } from "@/stores/learn-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { PhasePreTest } from "@/components/learn/PhasePreTest";
import { PhaseContent } from "@/components/learn/PhaseContent";
import { PhaseElaboration } from "@/components/learn/PhaseElaboration";
import { PhaseScenario } from "@/components/learn/PhaseScenario";
import { PhaseInterleaved } from "@/components/learn/PhaseInterleaved";
import { PhaseTeachBack } from "@/components/learn/PhaseTeachBack";
import { PhaseSRS } from "@/components/learn/PhaseSRS";
import type { PhaseKey } from "@/types/learn";
import Link from "next/link";

const PHASE_COMPONENTS: Record<PhaseKey, React.ComponentType> = {
  preTest: PhasePreTest,
  content: PhaseContent,
  elaboration: PhaseElaboration,
  scenario: PhaseScenario,
  interleaved: PhaseInterleaved,
  teachBack: PhaseTeachBack,
  srsSchedule: PhaseSRS,
};

const NEXT_LABELS: Record<PhaseKey, string> = {
  preTest: "Continue to teaching phase",
  content: "Continue to elaboration",
  elaboration: "Continue to scenario practice",
  scenario: "Continue to interleaved practice",
  interleaved: "Continue to teach-back",
  teachBack: "Continue to SRS scheduling",
  srsSchedule: "",
};

export function SessionStepper() {
  const session = useLearnStore((s) => s.session);
  const currentPhase = useLearnStore((s) => s.currentPhase);
  const phaseIndex = useLearnStore((s) => s.phaseIndex);
  const canAdvance = useLearnStore((s) => s.canAdvance);
  const nextPhase = useLearnStore((s) => s.nextPhase);
  const prevPhase = useLearnStore((s) => s.prevPhase);
  const reset = useLearnStore((s) => s.reset);

  if (!session) return null;

  const PhaseComponent = PHASE_COMPONENTS[currentPhase];
  const progressPercent = Math.round(((phaseIndex + 1) / PHASE_ORDER.length) * 100);
  const isLastPhase = currentPhase === "srsSchedule";
  const isFirstPhase = phaseIndex === 0;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar + step counter */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Step {phaseIndex + 1} of {PHASE_ORDER.length} — {session.title}
          </p>
        </div>
      </div>

      {/* Phase content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <PhaseComponent />
      </main>

      {/* Navigation */}
      <div className="border-t bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          {!isFirstPhase ? (
            <Button variant="outline" onClick={prevPhase}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {isLastPhase ? (
            <div className="flex gap-2">
              <Link
                href="/"
                className={buttonVariants({ variant: "outline" })}
                onClick={reset}
              >
                Back to Home
              </Link>
              <Button
                onClick={() => {
                  // reset() sets session to null, which triggers the page's
                  // useEffect to re-load and call startSession() on next render
                  reset();
                }}
              >
                Restart
              </Button>
            </div>
          ) : (
            <Button onClick={nextPhase} disabled={!canAdvance()}>
              {NEXT_LABELS[currentPhase]}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create LearnCard**

Create `components/learn/LearnCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ScienceTag } from "@/components/learn/ScienceTag";
import type { SessionMeta } from "@/types/learn";

interface LearnCardProps {
  session: SessionMeta;
}

export function LearnCard({ session }: LearnCardProps) {
  const domainLabels = { gc: "GC", rhs: "RHS", ice: "ICE" } as const;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-sm font-semibold">
            {domainLabels[session.domain]}
          </Badge>
        </div>
        <CardTitle className="text-xl">{session.title}</CardTitle>
        <CardDescription>{session.topic}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>7-phase learning session</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>~{session.estimatedMinutes} minutes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {session.scienceTags.map((tag) => (
              <ScienceTag key={tag} label={tag} />
            ))}
          </div>
        </div>
        <Link
          href={`/learn/${session.id}`}
          className={buttonVariants({ className: "w-full" })}
        >
          Start Learning Session
        </Link>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/learn/SessionStepper.tsx components/learn/LearnCard.tsx
git commit -m "feat(learn): add SessionStepper orchestrator and LearnCard"
```

---

## Task 8: Pages and Homepage Integration

**Files:**
- Create: `app/learn/[sessionId]/page.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create session page**

Create `app/learn/[sessionId]/page.tsx`:

```tsx
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLearnStore } from "@/stores/learn-store";
import { loadSession } from "@/lib/session-loader";
import { SessionStepper } from "@/components/learn/SessionStepper";

export default function LearnSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const router = useRouter();
  const session = useLearnStore((s) => s.session);
  const startSession = useLearnStore((s) => s.startSession);

  useEffect(() => {
    // If store already has this session loaded, don't reload
    if (session?.id === sessionId) return;

    const data = loadSession(sessionId);
    if (!data) {
      router.replace("/");
      return;
    }
    startSession(data);
  }, [sessionId, session?.id, router, startSession]);

  if (!session) return null;

  return <SessionStepper />;
}
```

- [ ] **Step 2: Update homepage with tabs**

The current homepage at `app/page.tsx` is a server component. Adding client-side tabs requires converting it to a client component (since the `Tabs` component from shadcn/ui is `"use client"`). Modify `app/page.tsx`:

```tsx
"use client";

import { ExamCard } from "@/components/exam/ExamCard";
import { LearnCard } from "@/components/learn/LearnCard";
import { examConfigs } from "@/lib/exam-config";
import { learningSessions } from "@/data/learn/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          DANB CDA Practice Exams
        </h1>
        <p className="mt-3 text-muted-foreground">
          Prepare for the Certified Dental Assistant exam with timed,
          randomized practice tests and evidence-based learning sessions.
        </p>
      </div>

      <Tabs defaultValue="exams">
        <div className="mb-6 flex justify-center">
          <TabsList>
            <TabsTrigger value="exams">Practice Exams</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="exams">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(examConfigs).map((config) => (
              <ExamCard key={config.type} config={config} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Each practice exam simulates real DANB CDA testing conditions with
            randomized questions and a countdown timer. A score of 75% or higher
            is considered passing.
          </p>
        </TabsContent>

        <TabsContent value="learn">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learningSessions.map((session) => (
              <LearnCard key={session.id} session={session} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Each learning session uses evidence-based techniques — retrieval
            practice, spaced repetition, interleaving, and elaborative
            interrogation — to build deep understanding of a single topic.
          </p>
        </TabsContent>
      </Tabs>
    </main>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Test in browser**

Run: `npm run dev`

Verify:
1. Homepage loads with two tabs (Practice Exams / Learn)
2. Practice Exams tab shows the 3 exam cards (existing functionality preserved)
3. Learn tab shows the Spaulding Classification session card
4. Clicking the session card navigates to `/learn/ice-spaulding-classification`
5. All 7 phases work: pre-test → content → elaboration → scenario → interleaved → teach-back → SRS
6. Navigation guards work (can't advance without completing each phase's requirements)
7. Back button works on all phases except Phase 1
8. Phase 7 shows "Back to Home" and "Restart" buttons
9. Invalid sessionId (e.g., `/learn/nonexistent`) redirects to homepage

- [ ] **Step 5: Commit**

```bash
git add app/learn/ app/page.tsx
git commit -m "feat(learn): add session page, homepage tabs integration"
```

---

## Task 9: Final Verification and Cleanup

- [ ] **Step 1: Run full typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors. Fix any issues.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds. This verifies all imports resolve, server/client boundaries are correct, and the API route compiles.

- [ ] **Step 4: End-to-end browser walkthrough**

Run: `npm run dev` and verify the complete flow:

1. Homepage → Learn tab → Click session card
2. Phase 1 (Pre-test): Answer wrong → see incorrect feedback → Next enabled
3. Phase 2 (Content): See SVG diagram + teaching text → Next enabled immediately
4. Phase 3 (Elaboration): See prompt → click "Reveal expert reasoning" → Next enabled
5. Phase 4 (Scenario): Select confidence → options become active → answer → see feedback for all choices
6. Phase 5 (Interleaved): See RHS domain switch → answer → see feedback
7. Phase 6 (Teach-back): Type response → submit → see AI evaluation (or model answer if no API key) → Next enabled
8. Phase 7 (SRS): See 5 scheduled items → session summary → "Back to Home" works
9. Verify existing exam functionality still works (navigate to Practice Exams tab, start an exam)

- [ ] **Step 5: Format code**

Run: `npm run format`

- [ ] **Step 6: Commit any formatting changes**

```bash
git add -A
git commit -m "chore: format code"
```
