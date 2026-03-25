import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 503 }
    )
  }

  let body: {
    userResponse: string
    prompt: string
    modelAnswer: string
    sessionTopic: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { userResponse, prompt, modelAnswer, sessionTopic } = body

  if (!userResponse || !prompt || !modelAnswer || !sessionTopic) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    )
  }

  const client = new Anthropic({ apiKey })

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: `You are a dental assisting instructor evaluating a student's explanation of a clinical concept. The topic is "${sessionTopic}".

Evaluate the student's response against the model answer for factual accuracy and completeness. Be encouraging but honest. Your feedback should clearly explain what the student got right, what they got wrong, and what key concepts they missed.

Respond ONLY with valid JSON matching this exact structure (no markdown, no code fences):

{"accuracy":"good","completeness":85,"feedback":"Your explanation was clear and accurate...","missedConcepts":[]}

Rules for the fields:
- accuracy: Use "good" if factually correct and covers the key points. Use "partial" if mostly correct but missing important details. Use "missed" if fundamentally wrong or missing the core concept.
- completeness: A number from 0 to 100 indicating how much of the model answer's content was covered.
- feedback: 2-3 sentences explaining what the student did well and what they could improve. Be specific about which concepts were correct and which were missing or wrong.
- missedConcepts: An array of strings listing specific key points from the model answer that the student did not cover. Use an empty array if nothing was missed.`,
      messages: [
        {
          role: "user",
          content: `Teach-back prompt given to the student: "${prompt}"

Model answer: "${modelAnswer}"

Student's response: "${userResponse}"

Evaluate the student's response.`,
        },
      ],
    })

    const text =
      message.content[0].type === "text" ? message.content[0].text : ""

    let evaluation
    try {
      evaluation = JSON.parse(text)
    } catch {
      console.error("Failed to parse AI response:", text)
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 502 }
      )
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Teach-back evaluation error:", error)
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 })
  }
}
