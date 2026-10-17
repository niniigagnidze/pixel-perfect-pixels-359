import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Bot, Check, X } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDemo, patient, type Finding, type Plan } from "@/lib/demo-store";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Review queue — Curely Doctor Portal" },
      { name: "description", content: "Review AI pre-analysis and approve diagnoses." },
      { property: "og:title", content: "Review queue — Curely Doctor Portal" },
      { property: "og:description", content: "Review AI pre-analysis and approve diagnoses." },
    ],
  }),
  component: DoctorPage,
});

const plans: Plan[] = ["No visit needed", "Book follow-up visit", "Order more tests"];

function FindingCard({ f }: { f: Finding }) {
  const { review } = useDemo();
  const [text, setText] = useState(f.aiSuggestion);
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState<Plan>("Book follow-up visit");
  const done = f.status !== "pending";

  return (
    <article className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-primary">{f.specialty}</p>
          <h3 className="text-2xl">{f.study}</h3>
          <p className="text-sm text-muted-foreground">{f.source} · {f.date} · Assigned to {f.doctor}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${f.status === "approved" ? "bg-success/15 text-success" : f.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-accent-foreground"}`}>
          {f.status === "pending" ? "Needs review" : f.status === "approved" ? "Approved" : "Rejected"}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-ai-soft p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ai"><Bot className="h-4 w-4" /> AI assistant suggestion · {Math.round(f.confidence * 100)}% confidence</p>
        {done ? <p className="mt-2">{f.aiSuggestion}</p> : <Textarea className="mt-2 bg-card" value={text} onChange={(e) => setText(e.target.value)} rows={3} />}
      </div>

      {f.flags.map((fl) => (
        <p key={fl} className="mt-3 flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> {fl}</p>
      ))}

      {done ? (
        <p className="mt-4 text-sm text-muted-foreground">Note: {f.doctorNote} · Plan: {f.plan} · {f.reviewedAt}</p>
      ) : (
        <div className="mt-4 space-y-3">
          <Textarea placeholder="Note for the patient (plain language)…" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {plans.map((p) => (
              <Button key={p} type="button" variant={plan === p ? "default" : "outline"} size="sm" onClick={() => setPlan(p)}>{p}</Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { review(f.id, "approved", note || "Results reviewed.", plan, text); toast.success("Approved — patient notified"); }}>
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

function DoctorPage() {
  const { findings } = useDemo();
  const pending = findings.filter((f) => f.status === "pending");
  const done = findings.filter((f) => f.status !== "pending");
  return (
    <Shell side="doctor">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-4xl">Review queue</h1>
          <p className="mt-1 text-muted-foreground">Nothing is shown to the patient until you approve it. Several specialists can work on this patient at once.</p>
          <div className="mt-6 space-y-5">
            {pending.length === 0 && <p className="rounded-xl bg-muted p-6 text-center">All caught up.</p>}
            {pending.map((f) => <FindingCard key={f.id} f={f} />)}
          </div>
          {done.length > 0 && <h2 className="mt-10 text-2xl">Reviewed</h2>}
          <div className="mt-4 space-y-5">{done.map((f) => <FindingCard key={f.id} f={f} />)}</div>
        </div>
        <aside className="h-fit rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Patient</p>
          <h2 className="text-2xl">{patient.name}</h2>
          <p className="text-sm text-muted-foreground">{patient.dob} · {patient.bloodType}</p>
          <p className="mt-4 font-semibold">Allergies</p>
          {patient.allergies.map((a) => <p key={a.name} className={a.severity === "Severe" ? "text-destructive" : ""}>{a.name} ({a.severity})</p>)}
          <p className="mt-4 font-semibold">Medications</p>
          {patient.medications.map((m) => <p key={m.name}>{m.name}</p>)}
          <p className="mt-4 font-semibold">Active conditions</p>
          {patient.conditions.filter((c) => c.status === "Active").map((c) => <p key={c.name}>{c.name}</p>)}
        </aside>
      </div>
    </Shell>
  );
}
