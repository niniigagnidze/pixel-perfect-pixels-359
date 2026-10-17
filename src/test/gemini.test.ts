import { describe, expect, it } from "vitest";
import { aiRequestSchema, readGeminiStream } from "@/lib/gemini-protocol";
import { buildDemoPrompt, handleGeminiRequest } from "@/lib/gemini.server";

function stream(data: string) {
  const bytes = new TextEncoder().encode(data);
  return new ReadableStream<Uint8Array>({ start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close(); } });
}
describe("Gemini clinical safety", () => {
  it("keeps names and social security numbers out of the AI context", () => {
    const data = JSON.stringify(buildDemoPrompt({ kind: "care", patientId: "p1" }));
    expect(data).not.toContain("Ana Beridze");
    expect(data).not.toContain("01024056789");
  });
  it("excludes pending X-ray and ECG findings from patient summaries", () => {
    const prompt = JSON.stringify(buildDemoPrompt({ kind: "summary", patientId: "p1" }));
    expect(prompt).toContain("Lipid panel");
    expect(prompt).not.toContain("Cobb");
    expect(prompt).not.toContain("QTc");
  });
  it("rejects another doctor's analysis", () => {
    expect(() => buildDemoPrompt({ kind: "analysis", patientId: "p1", findingId: "f1" })).toThrow();
  });
  it("does not accept arbitrary real patient data", () => {
    expect(aiRequestSchema.safeParse({ kind: "care", patientId: "p1", record: "private data" }).success).toBe(false);
  });
  it("streams split UTF-8 records without exposing thoughts", async () => {
    const text = 'data: {"candidates":[{"content":{"parts":[{"text":"hidden","thought":true},{"text":"Résumé "}]}}]}\n\ndata: {"candidates":[{"content":{"parts":[{"text":"ready"}]},"finishReason":"STOP"}]}\n\n';
    const updates: string[] = [];
    expect(await readGeminiStream(stream(text), (value) => updates.push(value))).toBe("Résumé ready");
    expect(updates).toEqual(["Résumé ", "Résumé ready"]);
  });
  it("rejects a safety refusal even with HTTP 200", async () => {
    await expect(readGeminiStream(stream('data: {"promptFeedback":{"blockReason":"SAFETY"}}\n\n'), () => undefined)).rejects.toThrow("declined");
  });
  it("never applies truncated answers", async () => {
    await expect(readGeminiStream(stream('data: {"candidates":[{"content":{"parts":[{"text":"Partial"}]}}]}\n\n'), () => undefined)).rejects.toThrow("complete");
  });
  it("blocks cross-origin calls before contacting Gemini", async () => {
    const response = await handleGeminiRequest(new Request("https://curely.example/api/ai", { method: "POST", headers: { origin: "https://other.example" } }));
    expect(response.status).toBe(403);
  });
});