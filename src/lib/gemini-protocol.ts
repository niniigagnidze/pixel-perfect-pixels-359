import { z } from "zod";

export const aiRequestSchema = z.object({
  kind: z.enum(["summary", "analysis", "care"]),
  patientId: z.enum(["p1", "p2", "p3", "p4"]),
  findingId: z.string().max(10).optional(),
}).strict();
export type AiRequest = z.infer<typeof aiRequestSchema>;

export function parseGeminiEvent(record: string): { text: string; complete: boolean } {
  const data = record.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
  if (!data) return { text: "", complete: false };
  const event = JSON.parse(data);
  if (event.error) throw new Error("Gemini could not complete this request.");
  if (event.promptFeedback?.blockReason) throw new Error("Gemini declined this request for safety reasons.");
  const candidate = event.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(candidate.finishReason === "MAX_TOKENS" ? "Gemini's response was incomplete. No draft was applied." : "Gemini declined or could not complete this request. No draft was applied.");
  }
  const text = (candidate?.content?.parts ?? []).filter((part: { text?: string; thought?: boolean }) => !part.thought && typeof part.text === "string").map((part: { text: string }) => part.text).join("");
  return { text, complete: candidate?.finishReason === "STOP" };
}

export async function readGeminiStream(body: ReadableStream<Uint8Array>, onText: (text: string) => void) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", output = "", complete = false;
  const consume = (record: string) => {
    const event = parseGeminiEvent(record);
    output += event.text;
    complete ||= event.complete;
    if (event.text) onText(output);
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      buffer = buffer.replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        consume(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");
      }
      if (done) break;
    }
    if (buffer.trim()) consume(buffer);
    if (!complete || !output.trim()) throw new Error("Gemini returned no complete answer. No draft was applied.");
    return output;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}