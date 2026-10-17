import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Bot, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, type Finding, type Plan } from "@/lib/demo-store";
import { GeminiAssistant } from "@/components/GeminiAssistant";

const plans: Plan[] = ["No visit needed", "Book follow-up visit", "Order more tests"];

export function FindingCard({ f }: { f: Finding }) {
  const { review, undoReview } = useDemo();
  const [text, setText] = useState(f.aiSuggestion);
  const [generated, setGenerated] = useState(false);
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<Plan>("Book follow-up visit");
  const done = f.status !== "pending";

  return (
    <article className="min-w-0 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-primary">{f.specialty}</p>
          <h3 className="text-2xl">{f.study}</h3>
          <p className="text-sm text-muted-foreground">{f.hospital} · {f.source} · {f.date} · Assigned to {f.doctor}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${f.status === "approved" ? "bg-success/15 text-success" : f.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-accent-foreground"}`}>
          {f.status === "pending" ? "Needs review" : f.status === "approved" ? "Approved" : "Rejected"}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-ai-soft p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ai"><Bot className="h-4 w-4" /> {generated ? "Gemini draft · requires clinician review" : "Sample AI assistant suggestion"}</p>
        {done ? <p className="mt-2">{f.aiSuggestion}</p> : <Textarea className="mt-2 bg-card" value={text} onChange={(e) => setText(e.target.value)} rows={3} />}
        {!done && <GeminiAssistant request={{ kind: "analysis", patientId: f.patientId as "p1" | "p2" | "p3" | "p4", findingId: f.id }} label="Generate Gemini draft" onGenerated={(draft) => { setText(draft); setGenerated(true); }} />}
      </div>

      {f.flags.map((fl) => (
        <p key={fl} className="mt-3 flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> {fl}</p>
      ))}

      {done ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Note: {f.doctorNote} · Plan: {f.plan} · {f.reviewedAt}</p>
          <Button variant="outline" size="sm" onClick={() => { if (confirm("Undo this review and send it back to Needs review?")) { undoReview(f.id); setText(f.aiSuggestion); toast("Review withdrawn — back to Needs review"); } }}>
            <RotateCcw className="h-4 w-4" /> Undo review
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Textarea placeholder="Note for the patient (plain language)…" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {plans.map((p) => (
              <Button key={p} type="button" variant={plan === p ? "default" : "outline"} size="sm" onClick={() => setPlan(p)}>{p}</Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="h-auto whitespace-normal py-2 text-left" onClick={() => { review(f.id, "approved", note || "Results reviewed.", plan, text); toast.success("Approved — patient notified"); }}>
              <Check className="h-4 w-4" /> Approve & send to patient
            </Button>
            <Button variant="outline" onClick={() => { review(f.id, "rejected", note || "AI suggestion rejected.", plan); toast("Suggestion rejected — not shown to patient"); }}>
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

