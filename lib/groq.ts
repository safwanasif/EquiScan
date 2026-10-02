// Imported only by server routes. Never expose GROQ_API_KEY to browser code.
export class AnalysisError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function callGroq<T>(system: string, content: string, maxTokens = 2048): Promise<T> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AnalysisError("Live analysis is not configured yet.", 503);
  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [{ role: "system", content: system }, { role: "user", content }],
        response_format: { type: "json_object" },
        max_completion_tokens: maxTokens,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(45_000),
      cache: "no-store",
    });
  } catch {
    throw new AnalysisError("Analysis could not connect or timed out. Please try again shortly.", 503);
  }
  if (response.status === 429) {
    throw new AnalysisError("Analysis capacity is temporarily exhausted. Please try again later.", 429);
  }
  if (!response.ok) throw new AnalysisError("The analysis provider is unavailable. Please try again later.", 503);
  try {
    const body = await response.json();
    const choice = body.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") {
      throw new Error("Incomplete response");
    }
    // Route-specific runtime validation must follow parsing.
    return JSON.parse(choice.message.content) as T;
  } catch {
    throw new AnalysisError("Analysis returned an incomplete or invalid result. Please try a shorter passage.", 502);
  }
}

export function analysisFailure(error: unknown) {
  return Response.json(
    { error: error instanceof AnalysisError ? error.message : "The analysis result could not be validated. Please try again." },
    { status: error instanceof AnalysisError ? error.status : 502 },
  );
}
