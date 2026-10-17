import { useEffect, useRef, useState } from "react";
import { readGeminiStream, type AiRequest } from "@/lib/gemini-protocol";

export function useGemini() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const generate = async (input: AiRequest) => {
    if (controller.current) return;
    const abort = new AbortController();
    controller.current = abort;
    setText(""); setError(""); setComplete(false); setLoading(true);
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: abort.signal });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "The AI request could not be completed.");
      }
      if (!response.body) throw new Error("Gemini returned no response.");
      const result = await readGeminiStream(response.body, setText);
      setComplete(true);
      return result;
    } catch (e) {
      setError(abort.signal.aborted ? "Stopped. No draft was applied." : e instanceof Error ? e.message : "The AI request failed.");
      return undefined;
    } finally { controller.current = null; setLoading(false); }
  };
  return { text, error, loading, complete, generate, stop: () => controller.current?.abort() };
}