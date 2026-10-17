import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import { DoctorSwitcher } from "@/components/DoctorSwitcher";
import { careStatus, conversation } from "@/lib/hospitals";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "My patients — Curely Doctor Portal" },
      { name: "description", content: "Find patients by personal number, review analyses and complete care." },
      { property: "og:title", content: "My patients — Curely Doctor Portal" },
      { property: "og:description", content: "Find patients by personal number, review analyses and complete care." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DoctorPage,
});

function DoctorPage() {
  const { patients, findings, threads, doctor } = useDemo();
  const [tab, setTab] = useState<"pending" | "done">("pending");
  const [q, setQ] = useState("");
  const list = patients.filter(
    (p) => careStatus(p, doctor.id).status === tab && (p.ssn.includes(q.trim()) || p.name.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const count = (s: "pending" | "done") => patients.filter((p) => careStatus(p, doctor.id).status === s).length;

  return (
    <Shell side="doctor">
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-4xl">My patients</h1><DoctorSwitcher /></div>
      <p className="mt-1 text-muted-foreground">{doctor.name} · {doctor.hospital} · Search by personal number (SSN) or name.</p>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="e.g. 01024056789" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-6 flex gap-2">
        {(["pending", "done"] as const).map((s) => (
          <Button
            key={s}
            onClick={() => setTab(s)}
            className={`rounded-lg px-4 py-2 font-medium ${tab === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {s === "pending" ? "Pending" : "Done"} ({count(s)})
          </Button>
        ))}
      </div>

      <div className="mt-4 divide-y rounded-2xl border bg-card shadow-sm">
        {list.length === 0 && <p className="p-6 text-center text-muted-foreground">No patients here.</p>}
        {list.map((p) => {
          const mine = findings.filter((f) => f.patientId === p.id && f.doctor === doctor.name);
          const toReview = mine.filter((f) => f.status === "pending").length;
          const unread = conversation(threads[p.id] ?? [], doctor.name).filter((m) => m.from === "patient" && !m.read).length;
          return (
            <Link
              key={p.id}
              to="/doctor/$patientId"
              params={{ patientId: p.id }}
              className="flex items-center gap-4 p-4 hover:bg-muted"
            >
              <div className="flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="font-mono text-sm text-muted-foreground">SSN {p.ssn} · {p.dob}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {mine.length} analyses{toReview > 0 && <b className="ml-1 text-warning">· {toReview} to review</b>}
                {careStatus(p, doctor.id).completedAt && ` · done ${careStatus(p, doctor.id).completedAt}`}
                {unread > 0 && <b className="ml-2 rounded-full bg-primary px-2 py-0.5 text-primary-foreground">{unread} new message{unread > 1 ? "s" : ""}</b>}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </Shell>
  );
}
