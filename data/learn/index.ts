import type { ExamType } from "@/types/exam"
import type { DomainLearnConfig, SessionMeta } from "@/types/learn"

function s(
  id: string,
  title: string,
  domain: ExamType,
  topic: string,
  available = false
): SessionMeta {
  return {
    id,
    title,
    domain,
    topic,
    estimatedMinutes: 12,
    scienceTags: [],
    available,
  }
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
          s(
            "gc-vital-signs",
            "Vital Signs & Baseline Measurements",
            "gc",
            "Evaluation",
            true
          ),
          s(
            "gc-medical-history",
            "Medical History Review & Risk Assessment",
            "gc",
            "Evaluation"
          ),
          s(
            "gc-dental-charting",
            "Dental Charting & Tooth Numbering",
            "gc",
            "Evaluation"
          ),
          s(
            "gc-tooth-anatomy",
            "Tooth Anatomy & Morphology",
            "gc",
            "Evaluation"
          ),
          s("gc-head-neck-anatomy", "Head & Neck Anatomy", "gc", "Evaluation"),
          s("gc-occlusion", "Occlusion & Malocclusion", "gc", "Evaluation"),
          s(
            "gc-medical-emergencies",
            "Medical Emergencies in the Dental Office",
            "gc",
            "Evaluation"
          ),
        ],
      },
      {
        name: "Patient Management & Administration",
        examWeight: "17%",
        sessions: [
          s(
            "gc-oral-health-education",
            "Oral Health Education & Prevention",
            "gc",
            "Patient Management & Administration"
          ),
          s(
            "gc-legal-compliance",
            "Legal & Regulatory Compliance",
            "gc",
            "Patient Management & Administration"
          ),
          s(
            "gc-hipaa",
            "HIPAA & Patient Records",
            "gc",
            "Patient Management & Administration"
          ),
          s(
            "gc-patient-communication",
            "Patient Communication & Behavior Management",
            "gc",
            "Patient Management & Administration"
          ),
        ],
      },
      {
        name: "Chairside Dentistry",
        examWeight: "50%",
        sessions: [
          s(
            "gc-four-handed",
            "Four-Handed Dentistry & Ergonomics",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-instrument-id",
            "Instrument Identification & Function",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-restorative",
            "Restorative Procedures",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-endodontic",
            "Endodontic Procedures",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-periodontic",
            "Periodontic Procedures",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-prosthodontic",
            "Prosthodontic Procedures",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-orthodontic",
            "Orthodontic Procedures",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-oral-surgery",
            "Oral Surgery Procedures",
            "gc",
            "Chairside Dentistry"
          ),
          s("gc-pediatric", "Pediatric Dentistry", "gc", "Chairside Dentistry"),
          s(
            "gc-anesthesia",
            "Anesthesia & Pain Management",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-dental-dam",
            "Dental Dam & Moisture Control",
            "gc",
            "Chairside Dentistry"
          ),
          s(
            "gc-tray-setup",
            "Tray Setup & Procedural Sequencing",
            "gc",
            "Chairside Dentistry"
          ),
        ],
      },
      {
        name: "Dental Materials",
        examWeight: "16%",
        sessions: [
          s(
            "gc-amalgam",
            "Amalgam & Direct Restorative Materials",
            "gc",
            "Dental Materials"
          ),
          s(
            "gc-composite",
            "Composite & Bonding Systems",
            "gc",
            "Dental Materials"
          ),
          s("gc-cements", "Dental Cements & Liners", "gc", "Dental Materials"),
          s(
            "gc-impressions",
            "Impression Materials & Gypsum",
            "gc",
            "Dental Materials"
          ),
          s(
            "gc-temporaries",
            "Temporary Materials & Waxes",
            "gc",
            "Dental Materials"
          ),
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
          s(
            "rhs-paralleling",
            "Paralleling Technique",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-bisecting",
            "Bisecting Angle Technique",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-bitewing",
            "Bitewing Radiographs",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-occlusal-panoramic",
            "Occlusal & Panoramic Radiography",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-digital",
            "Digital Radiography",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-film-processing",
            "Film Processing & Darkroom Procedures",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-image-evaluation",
            "Image Evaluation & Mounting",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-anatomical-landmarks",
            "Anatomical Landmarks on Radiographs",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-exposure-settings",
            "Exposure Settings & Image Quality",
            "rhs",
            "Purpose and Technique"
          ),
          s(
            "rhs-patient-positioning",
            "Patient Positioning & Common Errors",
            "rhs",
            "Purpose and Technique"
          ),
        ],
      },
      {
        name: "Radiation Characteristics and Protection",
        examWeight: "25%",
        sessions: [
          s(
            "rhs-radiation-physics",
            "Radiation Physics Fundamentals",
            "rhs",
            "Radiation Characteristics and Protection"
          ),
          s(
            "rhs-biological-effects",
            "Biological Effects of Radiation",
            "rhs",
            "Radiation Characteristics and Protection"
          ),
          s(
            "rhs-dose-limits",
            "Dose Limits & ALARA Principle",
            "rhs",
            "Radiation Characteristics and Protection"
          ),
          s(
            "rhs-protective-equipment",
            "Protective Equipment & Monitoring",
            "rhs",
            "Radiation Characteristics and Protection"
          ),
        ],
      },
      {
        name: "Infection Prevention and Control — Radiology-Specific",
        examWeight: "25%",
        sessions: [
          s(
            "rhs-barrier-techniques",
            "Barrier Techniques in Radiography",
            "rhs",
            "Infection Prevention and Control — Radiology-Specific"
          ),
          s(
            "rhs-equipment-disinfection",
            "Equipment Disinfection & Sensor Handling",
            "rhs",
            "Infection Prevention and Control — Radiology-Specific"
          ),
          s(
            "rhs-infection-control-workflow",
            "Radiographic Infection Control Workflow",
            "rhs",
            "Infection Prevention and Control — Radiology-Specific"
          ),
          s(
            "rhs-darkroom-asepsis",
            "Darkroom & Digital Sensor Asepsis",
            "rhs",
            "Infection Prevention and Control — Radiology-Specific"
          ),
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
          s(
            "ice-chain-of-infection",
            "Chain of Infection & Modes of Transmission",
            "ice",
            "Prevention of Disease Transmission"
          ),
          s(
            "ice-standard-precautions",
            "Standard Precautions & Hand Hygiene",
            "ice",
            "Prevention of Disease Transmission"
          ),
          s(
            "ice-ppe",
            "Personal Protective Equipment (PPE)",
            "ice",
            "Prevention of Disease Transmission"
          ),
          s(
            "ice-vaccination",
            "Vaccination & Immunization Requirements",
            "ice",
            "Prevention of Disease Transmission"
          ),
        ],
      },
      {
        name: "Prevention of Cross-Contamination",
        examWeight: "34%",
        sessions: [
          s(
            "ice-surface-disinfection",
            "Surface Disinfection Protocols",
            "ice",
            "Prevention of Cross-Contamination"
          ),
          s(
            "ice-barrier-techniques",
            "Barrier Techniques for Clinical Surfaces",
            "ice",
            "Prevention of Cross-Contamination"
          ),
          s(
            "ice-waterline-management",
            "Dental Unit Waterline Management",
            "ice",
            "Prevention of Cross-Contamination"
          ),
          s(
            "ice-single-use",
            "Single-Use Items & Disposables",
            "ice",
            "Prevention of Cross-Contamination"
          ),
          s(
            "ice-laboratory-asepsis",
            "Laboratory Asepsis",
            "ice",
            "Prevention of Cross-Contamination"
          ),
          s(
            "ice-radiography-ic",
            "Radiography-Specific Infection Control",
            "ice",
            "Prevention of Cross-Contamination"
          ),
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
            scienceTags: [
              "Retrieval practice",
              "Dual coding",
              "Interleaving",
              "Spaced repetition",
            ],
            available: true,
          },
          s(
            "ice-instrument-cleaning",
            "Instrument Cleaning Methods",
            "ice",
            "Process Instruments and Devices"
          ),
          s(
            "ice-sterilization-methods",
            "Sterilization Methods",
            "ice",
            "Process Instruments and Devices"
          ),
          s(
            "ice-sterilization-monitoring",
            "Sterilization Monitoring",
            "ice",
            "Process Instruments and Devices"
          ),
          s(
            "ice-instrument-packaging",
            "Instrument Packaging & Storage",
            "ice",
            "Process Instruments and Devices"
          ),
          s(
            "ice-handpiece-processing",
            "Handpiece & Semicritical Device Processing",
            "ice",
            "Process Instruments and Devices"
          ),
        ],
      },
      {
        name: "Occupational Safety and Administration",
        examWeight: "20%",
        sessions: [
          s(
            "ice-osha-bbp",
            "OSHA Bloodborne Pathogens Standard",
            "ice",
            "Occupational Safety and Administration"
          ),
          s(
            "ice-exposure-incidents",
            "Exposure Incident Management",
            "ice",
            "Occupational Safety and Administration"
          ),
          s(
            "ice-hazcom",
            "Hazard Communication (HazCom/GHS)",
            "ice",
            "Occupational Safety and Administration"
          ),
          s(
            "ice-waste-management",
            "Waste Management & Regulated Medical Waste",
            "ice",
            "Occupational Safety and Administration"
          ),
          s(
            "ice-ergonomics",
            "Ergonomics & Injury Prevention",
            "ice",
            "Occupational Safety and Administration"
          ),
          s(
            "ice-recordkeeping",
            "Recordkeeping & Compliance Programs",
            "ice",
            "Occupational Safety and Administration"
          ),
        ],
      },
    ],
  },
]

export function getDomainConfig(
  domain: ExamType
): DomainLearnConfig | undefined {
  return domainConfigs.find((c) => c.domain === domain)
}

export function findSessionMeta(
  sessionId: string
): { domain: DomainLearnConfig; session: SessionMeta } | undefined {
  for (const domain of domainConfigs) {
    for (const sub of domain.subDomains) {
      const session = sub.sessions.find((s) => s.id === sessionId)
      if (session) return { domain, session }
    }
  }
  return undefined
}
