import { describe, expect, it, vi, afterEach } from "vitest";
import { aiRequestSchema, readGeminiStream } from "@/lib/gemini-protocol";
import { buildDemoPrompt, handleGeminiRequest, cancellationSafeStream } from "@/lib/gemini.server";

function stream(data: string) {
  const bytes = new TextEncoder().encode(data);
  return new ReadableStream<Uint8Array>({ start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close(); } });
}
describe("Gemini clinical safety", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it("returns 499 when fetching headers is cancelled across error realms", async () => {
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue({ name: "AbortError", message: "This operation was aborted" }));
    const response = await handleGeminiRequest(new Request("https://curely.example/api/ai", { method: "POST", headers: { origin: "https://curely.example", "content-type": "application/json" }, body: JSON.stringify({ kind: "care", patientId: "p2" }) }));
    expect(response.status).toBe(499);
  });
  it("closes without throwing when Gemini aborts after headers", async () => {
    const body = new ReadableStream<Uint8Array>({ pull(controller) { controller.error(new DOMException("This operation was aborted", "AbortError")); } });
    const reader = cancellationSafeStream(body, new AbortController().signal).getReader();
    await expect(reader.read()).resolves.toEqual({ done: true, value: undefined });
  });
  it("handles cancelled request-body reads before fetching Gemini", async () => {
    const request = new Request("https://curely.example/api/ai", { method: "POST", headers: { origin: "https://curely.example", "content-type": "application/json" }, body: "{}" });
    vi.spyOn(request, "text").mockRejectedValue(new DOMException("Aborted", "AbortError"));
    expect((await handleGeminiRequest(request)).status).toBe(499);
  });
  it("does not treat a genuine stream failure as successful output", async () => {
    const body = new ReadableStream<Uint8Array>({ pull(controller) { controller.error(new Error("Network failed")); } });
    await expect(cancellationSafeStream(body, new AbortController().signal).getReader().read()).rejects.toThrow("interrupted");
  });
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