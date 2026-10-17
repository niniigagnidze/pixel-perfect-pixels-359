import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Pill, Stethoscope, RotateCcw } from "lucide-react";
import { Shell } from "@/components/Shell";
import { FindingCard } from "@/components/FindingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDemo, CURRENT_DOCTOR } from "@/lib/demo-store";

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
  const { patients, findings, addDiagnosis, addPrescription, setPatientStatus } = useDemo();
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

  const mine = findings.filter((f) => f.patientId === p.id && f.doctor === CURRENT_DOCTOR);
  const pending = mine.filter((f) => f.status === "pending");
  const reviewed = mine.filter((f) => f.status !== "pending");
  const done = p.status === "done";

  return (
    <Shell side="doctor">
      <Link to="/doctor" className="inline-flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" /> All patients</Link>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <h2 className="text-2xl">Analyses ({mine.length})</h2>
          {mine.length === 0 && <p className="rounded-xl bg-muted p-6 text-center">No analyses assigned to you.</p>}
          {pending.map((f) => <FindingCard key={f.id} f={f} />)}
          {reviewed.map((f) => <FindingCard key={f.id} f={f} />)}
        </div>

        <aside className="space-y-6">
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
                <li key={i} className="rounded-lg bg-muted p-3"><b>{d.name}</b>{d.note && <p className="text-sm">{d.note}</p>}<p className="text-xs text-muted-foreground">{d.by} · {d.date}</p></li>
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
                <li key={i} className="rounded-lg bg-muted p-3"><b>{r.name}</b><p className="text-sm">{r.dose}</p><p className="text-xs text-muted-foreground">{r.by} · {r.date}</p></li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
