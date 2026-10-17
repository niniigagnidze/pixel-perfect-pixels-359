import { Sparkles, Square, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGemini } from "@/hooks/use-gemini";
import type { AiRequest } from "@/lib/gemini-protocol";

export function GeminiAssistant({ request, label, onGenerated }: { request: AiRequest; label: string; onGenerated?: (text: string) => void }) {
  const ai = useGemini();
  return <div className="mt-4 space-y-3">
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" size="sm" disabled={ai.loading} onClick={async () => { const result = await ai.generate(request); if (result) onGenerated?.(result); }}>
        {ai.loading ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Sparkles className="h-4 w-4" />}{label}
      </Button>
      {ai.loading && <Button type="button" variant="ghost" size="sm" onClick={ai.stop}><Square className="h-4 w-4" />Stop</Button>}
      <span className="text-xs text-muted-foreground">Gemini · sample records only</span>
    </div>
    {ai.loading && !ai.text && <p role="status" className="text-sm text-muted-foreground">Preparing draft…</p>}
    {ai.text && !(ai.complete && onGenerated) && <div className="whitespace-pre-wrap break-words text-sm leading-relaxed" aria-live="polite">{ai.text}</div>}
    {ai.complete && <p className="text-xs font-semibold text-ai">AI-generated · {request.kind === "summary" ? "informational, not a diagnosis" : "requires clinician review"}</p>}
    {ai.error && <p role="alert" className="text-sm text-destructive">{ai.error}</p>}
  </div>;
}