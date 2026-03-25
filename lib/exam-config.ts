import { ExamConfig } from "@/types/exam"

export const PASS_THRESHOLD = 0.75

export const examConfigs: Record<string, ExamConfig> = {
  gc: {
    type: "gc",
    title: "General Chairside",
    code: "GC",
    questionCount: 95,
    timeLimitMinutes: 75,
    description:
      "Covers chairside assisting procedures, patient care, dental materials, and office operations.",
    topics: [
      "Patient Care",
      "Chairside Procedures",
      "Dental Materials",
      "Office Operations",
      "Patient Education",
      "Instruments & Equipment",
    ],
  },
  rhs: {
    type: "rhs",
    title: "Radiation Health & Safety",
    code: "RHS",
    questionCount: 75,
    timeLimitMinutes: 60,
    description:
      "Covers radiation physics, biological effects, equipment operation, infection control in radiography, and technique errors.",
    topics: [
      "Radiation Physics",
      "Biological Effects",
      "Equipment Operation",
      "Radiation Safety",
      "Technique & Errors",
      "Image Evaluation",
    ],
  },
  ice: {
    type: "ice",
    title: "Infection Control",
    code: "ICE",
    questionCount: 75,
    timeLimitMinutes: 60,
    description:
      "Covers standard precautions, sterilization, disinfection, occupational safety, and waste management.",
    topics: [
      "Standard Precautions",
      "Sterilization Procedures",
      "Disinfection",
      "Occupational Safety",
      "Waste Management",
      "Regulatory Compliance",
    ],
  },
}

export function getExamConfig(type: string): ExamConfig | undefined {
  return examConfigs[type]
}
