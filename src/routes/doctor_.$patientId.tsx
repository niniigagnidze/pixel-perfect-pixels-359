import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Pill, Stethoscope, RotateCcw, Trash2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { FindingCard } from "@/components/FindingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import { careStatus, hospitalOf, type DoctorId } from "@/lib/hospitals";
import { DoctorSwitcher } from "@/components/DoctorSwitcher";
import { Building2 } from "lucide-react";
import { GeminiAssistant } from "@/components/GeminiAssistant";
import { ChatThread } from "@/components/ChatThread";

export const Route = createFileRoute("/doctor_/$patientId")({
  head: () => ({
    meta: [
      { title: "Patient file — Curely Doctor Portal" },
      { name: "description", content: "Review analyses, diagnose and prescribe for a patient." },
      { property: "og:title", content: "Patient file — Curely Doctor Portal" },
      { property: "og:description", content: "Review analyses, diagnose and prescribe for a patient." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PatientFile,
});

function PatientFile() {
  const { patientId } = Route.useParams();
  const { doctor, patients, findings, addDiagnosis, addPrescription, setPatientStatus, removeDiagnosis, removePrescription } = useDemo();
  const navigate = useNavigate();
  const p = patients.find((x) => x.id === patientId);
  const [dx, setDx] = useState({ name: "", note: "" });
  const [rx, setRx] = useState({ name: "", dose: "" });

  if (!p)
    return (
      <Shell side="doctor">
        <p>Patient not found. <Link to="/doctor" className="text-primary underline">Back to list</Link></p>
      </Shell>
    );

  const mine = findings.filter((f) => f.patientId === p.id && f.doctor === doctor.name);
  const elsewhere = findings.filter((f) => f.patientId === p.id && f.doctor !== doctor.name && f.status === "approved");
  const pending = mine.filter((f) => f.status === "pending");
  const reviewed = mine.filter((f) => f.status !== "pending");
  const done = careStatus(p, doctor.id).status === "done";

  return (
    <Shell side="doctor">
      <div className="flex flex-wrap items-center justify-between gap-2"><Link to="/doctor" className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> All patients</Link><DoctorSwitcher /></div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">{p.name}</h1>
          <p className="font-mono text-muted-foreground">SSN {p.ssn} · {p.dob} · {p.bloodType}</p>
          {p.allergies.length > 0 && <p className="mt-1 font-semibold text-destructive">Allergies: {p.allergies.join(", ")}</p>}
        </div>
        {done ? (
          <Button variant="outline" onClick={() => { setPatientStatus(p.id, "pending"); toast("Moved back to pending"); }}>
            <RotateCcw className="h-4 w-4" /> Reopen
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (pending.length > 0 && !confirm(`${pending.length} analyses are still unreviewed. Mark as done anyway?`)) return;
              setPatientStatus(p.id, "done");
              toast.success(`${p.name} moved to Done`);
              navigate({ to: "/doctor" });
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Mark as done
          </Button>
        )}
      </div>

      <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <h2 className="text-2xl">Analyses ({mine.length})</h2>
          {mine.length === 0 && <p className="rounded-xl bg-muted p-6 text-center">No analyses assigned to you.</p>}
          {pending.map((f) => <FindingCard key={f.id} f={f} />)}
          {reviewed.map((f) => <FindingCard key={f.id} f={f} />)}
          {elsewhere.length > 0 && (
            <section className="rounded-2xl border bg-muted/40 p-5">
              <h2 className="flex items-center gap-2 text-xl"><Building2 className="h-5 w-5 text-primary" /> Confirmed at other hospitals</h2>
              <ul className="mt-3 space-y-2">
                {elsewhere.map((f) => (
                  <li key={f.id} className="rounded-lg bg-card p-3"><b>{f.study}</b> <span className="text-sm text-muted-foreground">· {f.hospital} · {f.doctor} · {f.date}</span>{f.doctorNote && <p className="text-sm">{f.doctorNote}</p>}</li>
                ))}
              </ul>
            </section>
          )}
          <section id="chat" className="pt-4">
            <h2 className="mb-3 text-2xl">Messages with {p.name}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{doctor.name} · {doctor.hospital}</p>
            <ChatThread key={`${p.id}:${doctor.id}`} patientId={p.id} viewer="doctor" otherName={p.name} doctorId={doctor.id as DoctorId} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border-b pb-5">
            <h2 className="text-xl">Clinical AI review</h2>
            <GeminiAssistant key={p.id} request={{ kind: "care", patientId: p.id as "p1" | "p2" | "p3" | "p4" }} label="Generate care review" />
          </section>
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl"><Stethoscope className="h-5 w-5 text-primary" /> Diagnoses</h2>
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!dx.name.trim()) return;
                addDiagnosis(p.id, dx.name.trim(), dx.note.trim());
                setDx({ name: "", note: "" });
                toast.success("Diagnosis added");
              }}
            >
              <Input placeholder="Diagnosis" value={dx.name} onChange={(e) => setDx({ ...dx, name: e.target.value })} />
              <Input placeholder="Note (optional)" value={dx.note} onChange={(e) => setDx({ ...dx, note: e.target.value })} />
              <Button type="submit" size="sm" className="w-full">Add diagnosis</Button>
            </form>
            <ul className="mt-4 space-y-2">
              {p.diagnoses.map((d, i) => (
                <li key={i} className="flex items-start justify-between gap-2 rounded-lg bg-muted p-3">
                  <div className="min-w-0"><b>{d.name}</b>{d.note && <p className="text-sm">{d.note}</p>}<p className="text-xs text-muted-foreground">{d.by} · {hospitalOf(d.by, d.hospital)} · {d.date}</p></div>
                  {d.by === doctor.name && <Button variant="ghost" size="icon" aria-label={`Remove diagnosis ${d.name}`} onClick={() => { if (confirm(`Remove diagnosis "${d.name}"?`)) { removeDiagnosis(p.id, i); toast("Diagnosis removed"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl"><Pill className="h-5 w-5 text-primary" /> Prescriptions</h2>
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!rx.name.trim()) return;
                addPrescription(p.id, rx.name.trim(), rx.dose.trim());
                setRx({ name: "", dose: "" });
                toast.success("Prescription added");
              }}
            >
              <Input placeholder="Medicine & strength" value={rx.name} onChange={(e) => setRx({ ...rx, name: e.target.value })} />
              <Input placeholder="Dosage, e.g. once daily" value={rx.dose} onChange={(e) => setRx({ ...rx, dose: e.target.value })} />
              <Button type="submit" size="sm" className="w-full">Prescribe</Button>
            </form>
            <ul className="mt-4 space-y-2">
              {p.prescriptions.map((r, i) => (
                <li key={i} className="flex items-start justify-between gap-2 rounded-lg bg-muted p-3">
                  <div className="min-w-0"><b>{r.name}</b><p className="text-sm">{r.dose}</p><p className="text-xs text-muted-foreground">{r.by} · {hospitalOf(r.by, r.hospital)} · {r.date}</p></div>
                  {r.by === doctor.name && <Button variant="ghost" size="icon" aria-label={`Remove prescription ${r.name}`} onClick={() => { if (confirm(`Remove prescription "${r.name}"?`)) { removePrescription(p.id, i); toast("Prescription removed"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
