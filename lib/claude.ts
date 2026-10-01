import Anthropic from "@anthropic-ai/sdk";

// Singleton client — one instance reused across all API routes
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The model we're using for the hackathon
export const CLAUDE_MODEL = "claude-sonnet-4-6";

// Core call function — takes a system prompt and user content, returns parsed JSON
export async function callClaude<T>(
  systemPrompt: string,
  userContent: string,
  maxTokens: number = 4096
): Promise<T> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature: 0.2,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
  });

  // Extract the text from the response
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const rawText = textBlock.text.trim();

  // Strip any markdown fences if Claude adds them despite instructions
  const jsonText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(jsonText) as T;
  } catch  {
    console.error("Failed to parse Claude JSON response:", rawText);
    throw new Error("Claude returned invalid JSON");
  }
}