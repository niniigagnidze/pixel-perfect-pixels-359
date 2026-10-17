import { createFileRoute, Link } from "@tanstack/react-router";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Bone, Clock, FileText, Pill, Syringe, TestTube, Phone } from "lucide-react";
import { Shell, AiBadge } from "@/components/Shell";
import { useDemo, patient, labs, cholesterol } from "@/lib/demo-store";
import { GeminiAssistant } from "@/components/GeminiAssistant";
import { buildTimeline, hospitalOf } from "@/lib/hospitals";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "My health — Curely" },
      { name: "description", content: "Your medical record and plain-language summaries." },
      { property: "og:title", content: "My health — Curely" },
      { property: "og:description", content: "Your medical record and plain-language summaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PatientPage,
});

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-xl">{icon}{title}</h2>
      {children}
    </section>
  );
}

function PatientPage() {
  const { findings: all, patients } = useDemo();
  const [selectedHospital, setSelectedHospital] = useState("all");
  const me = patients.find((p) => p.id === "p1");
  const medications = me
    ? me.prescriptions.map((r) => ({ name: r.name, dose: r.dose, by: r.by, since: r.date, hospital: hospitalOf(r.by, r.hospital) }))
    : patient.medications.map((m) => ({ ...m, hospital: "Vake Family Clinic" }));
  const conditions = [
    ...(me ? me.diagnoses.map((d) => ({ name: d.name, status: "Active", by: d.by, date: d.date, note: d.note, hospital: hospitalOf(d.by, d.hospital) })) : []),
    ...patient.conditions.filter((c) => c.status === "Past").map((c) => ({ ...c, note: "", hospital: c.by })),
  ];
  const findings = all.filter((f) => f.patientId === "p1");
  const approved = findings.filter((f) => f.status === "approved");
  const pending = findings.filter((f) => f.status === "pending");
  const timeline = buildTimeline({
    diagnoses: me?.diagnoses ?? [], prescriptions: me?.prescriptions ?? [],
    results: approved.map((f) => ({ study: f.study, note: f.doctorNote ?? "", date: f.date, doctor: f.doctor, hospital: f.hospital })),
  });
  const hospitals = [...new Set([...timeline.map((t) => t.hospital), ...pending.map((f) => f.hospital)])];

  return (
    <Shell side="patient">
      <h1 className="text-4xl">Hello, Ana</h1>
      <p className="mt-1 text-muted-foreground">Born {patient.dob} · Blood type {patient.bloodType} · Family doctor: {patient.gp}</p>

      <section className="mt-6 rounded-2xl border border-ai/30 bg-ai-soft p-6">
        <div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl">Your health in plain words</h2><AiBadge /></div>
        <p className="mt-3 text-lg leading-relaxed">
          Overall you're doing well. Your cholesterol is still slightly above normal, but it has dropped steadily since February — the medicine and diet are working.
          Your other blood tests are normal.
        </p>
        <p className="mt-3 font-semibold">What changed since last time:</p>
        <ul className="mt-1 list-disc pl-6">
          <li>Cholesterol went down from 5.7 to 5.4 mmol/L.</li>
          {approved.filter((f) => f.id !== "f3").map((f) => (
            <li key={f.id}>{f.study}: reviewed by {f.doctor} — {f.plan}.</li>
          ))}
          {pending.map((f) => (
            <li key={f.id}>Your {f.study} is being reviewed by {f.doctor}. You'll be notified once confirmed.</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">This summary is not a diagnosis. Always follow your doctor's advice.</p>
        <GeminiAssistant request={{ kind: "summary", patientId: "p1" }} label="Generate Gemini summary" />
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-2xl"><Building2 className="h-6 w-6 text-primary" /> Your care across {hospitals.length} hospitals</h2>
        <p className="mt-1 text-muted-foreground">Everything your hospitals write lands here in one record, newest first.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant={selectedHospital === "all" ? "default" : "outline"} onClick={() => setSelectedHospital("all")}>All hospitals</Button>
          {hospitals.map((h) => {
            const n = timeline.filter((t) => t.hospital === h).length;
            const w = pending.filter((f) => f.hospital === h).length;
            return <Button key={h} size="sm" variant={selectedHospital === h ? "default" : "outline"} className="h-auto whitespace-normal py-2" onClick={() => setSelectedHospital(h)}>{h} · {n} records{w ? ` · ${w} in review` : ""}</Button>;
          })}
        </div>
        <ol className="mt-5 space-y-3 border-l-2 border-primary/30 pl-5">
          {timeline.filter((t) => selectedHospital === "all" || t.hospital === selectedHospital).map((t, i) => (
            <li key={i}>
              <p className="text-sm text-muted-foreground">{t.date} · <b className="text-foreground">{t.hospital}</b> · {t.by}</p>
              <p><span className="mr-2 rounded bg-muted px-2 text-sm">{t.kind}</span><b>{t.title}</b>{t.detail && ` — ${t.detail}`}</p>
            </li>
          ))}
        </ol>
        {timeline.filter((t) => selectedHospital === "all" || t.hospital === selectedHospital).length === 0 && <p className="mt-4 text-muted-foreground">No confirmed records yet.</p>}
        {pending.filter((f) => selectedHospital === "all" || f.hospital === selectedHospital).map((f) => <p key={f.id} className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4 shrink-0" /> {f.study} · {f.hospital} · Awaiting {f.doctor}</p>)}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Doctor-confirmed results" icon={<Bone className="h-5 w-5 text-primary" />}>
          {approved.length === 0 && <p className="text-muted-foreground">Nothing new yet.</p>}
          <ul className="space-y-4">
            {approved.map((f) => (
              <li key={f.id} className="rounded-xl bg-muted p-4">
                <div className="flex justify-between gap-2"><b>{f.study}</b><span className="text-sm text-success font-semibold">Confirmed</span></div>
                <p className="mt-1">{f.doctorNote}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.hospital} · {f.doctor} · {f.specialty} · {f.reviewedAt} · Plan: {f.plan}</p>
              </li>
            ))}
            {pending.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-muted-foreground">
                <Clock className="h-4 w-4" /> {f.study} — awaiting review by {f.doctor} at {f.hospital}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Cholesterol over time" icon={<TestTube className="h-5 w-5 text-primary" />}>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={cholesterol}>
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis domain={[4, 7]} stroke="var(--muted-foreground)" />
                <Tooltip />
                <ReferenceLine y={5.2} stroke="var(--success)" strokeDasharray="4 4" label="Normal < 5.2" />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Lab results · 14 Oct 2026 · Curely Partner Lab" icon={<TestTube className="h-5 w-5 text-primary" />}>
          <table className="w-full text-left">
            <thead className="text-sm text-muted-foreground"><tr><th>Test</th><th>Value</th><th>Normal</th><th /></tr></thead>
            <tbody>
              {labs.map((l) => (
                <tr key={l.name} className="border-t">
                  <td className="py-2">{l.name}</td><td>{l.value}</td><td className="text-muted-foreground">{l.range}</td>
                  <td className={l.status === "High" ? "font-semibold text-warning" : "text-success"}>{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Allergies" icon={<AlertTriangle className="h-5 w-5 text-destructive" />}>
          <ul className="space-y-2">
            {patient.allergies.map((a) => (
              <li key={a.name} className="flex justify-between rounded-xl bg-muted px-4 py-3">
                {a.name}<span className={a.severity === "Severe" ? "font-semibold text-destructive" : "text-muted-foreground"}>{a.severity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="h-4 w-4" /> Emergency contact: {patient.emergency}</p>
        </Card>

        <Card title="Medications" icon={<Pill className="h-5 w-5 text-primary" />}>
          <ul className="space-y-3">
            {medications.length === 0 && <li className="text-muted-foreground">No medicines prescribed.</li>}
            {medications.map((m, i) => (
              <li key={`${m.name}-${i}`}><b>{m.name}</b><p className="text-sm text-muted-foreground">{m.dose} · prescribed by {m.by} at {m.hospital} · since {m.since}</p></li>
            ))}
          </ul>
        </Card>

        <Card title="Conditions & surgeries" icon={<FileText className="h-5 w-5 text-primary" />}>
          <ul className="space-y-3">
            {conditions.map((c, i) => (
              <li key={`${c.name}-${i}`}><b>{c.name}</b> <span className="ml-1 rounded-full bg-secondary px-2 text-sm">{c.status}</span>{c.note && <p className="text-sm">{c.note}</p>}<p className="text-sm text-muted-foreground">{c.by}{c.hospital !== c.by ? ` · ${c.hospital}` : ""} · {c.date}</p></li>
            ))}
          </ul>
        </Card>

        <Card title="Vaccinations" icon={<Syringe className="h-5 w-5 text-primary" />}>
          <ul className="space-y-2">{patient.vaccinations.map((v) => <li key={v.name} className="flex justify-between"><span>{v.name}</span><span className="text-muted-foreground">{v.date}</span></li>)}</ul>
        </Card>

        <Card title="Visit notes" icon={<FileText className="h-5 w-5 text-primary" />}>
          <ul className="space-y-3">{patient.visits.map((v) => <li key={v.date}><p className="text-sm text-muted-foreground">{v.date} · {v.doctor}</p><p>{v.note}</p></li>)}</ul>
        </Card>
      </div>

      <p className="mt-8 text-center"><Link to="/messages" className="font-semibold text-primary underline">Message your doctor</Link></p>
    </Shell>
  );
}
