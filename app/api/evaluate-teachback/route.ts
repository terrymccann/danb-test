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
