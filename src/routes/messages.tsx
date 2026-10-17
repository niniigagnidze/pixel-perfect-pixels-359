import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Building2, Stethoscope } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ChatThread } from "@/components/ChatThread";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { CLINICIANS, conversation, type DoctorId } from "@/lib/hospitals";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Curely" },
      { name: "description", content: "Conversations with your care team across hospitals." },
      { property: "og:title", content: "Messages — Curely" },
      { property: "og:description", content: "Conversations with your care team across hospitals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { threads } = useDemo();
  const [selected, setSelected] = useState<DoctorId>("d1");
  const clinician = CLINICIANS.find((d) => d.id === selected);
  if (!clinician) return null;
  return (
    <Shell side="patient">
      <h1 className="text-4xl">Messages</h1>
      <p className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-destructive">
        <AlertTriangle className="h-5 w-5 shrink-0" /><span>Messaging is not for emergencies. In an emergency call <b>112</b>.</span>
      </p>
      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <h2 className="mb-3 text-xl">Your doctors</h2>
          <div className="divide-y border-y">
            {CLINICIANS.map((d) => {
              const list = conversation(threads["p1"] ?? [], d.name);
              const unread = list.filter((m) => m.from === "doctor" && !m.read).length;
              const last = list.at(-1);
              return (
                <Button key={d.id} variant="ghost" aria-pressed={selected === d.id} onClick={() => setSelected(d.id as DoctorId)} className={`h-auto w-full justify-start whitespace-normal rounded-none px-3 py-4 text-left ${selected === d.id ? "bg-secondary" : ""}`}>
                  <Stethoscope className="h-5 w-5 shrink-0 self-start text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{d.name}</span>
                    <span className="block text-sm text-muted-foreground">{d.hospital}</span>
                    <span className="block text-xs text-muted-foreground">{d.specialty}</span>
                    {last && <span className="mt-1 block truncate text-sm text-muted-foreground">{last.text}</span>}
                  </span>
                  {unread > 0 && <span className="rounded-full bg-primary px-2 text-xs text-primary-foreground">{unread}</span>}
                </Button>
              );
            })}
          </div>
        </aside>
        <section className="min-w-0">
          <h2 className="text-2xl">{clinician.name}</h2>
          <p className="mb-4 mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4 shrink-0" /> {clinician.hospital} · {clinician.specialty}</p>
          <ChatThread key={selected} patientId="p1" viewer="patient" otherName={clinician.name} doctorId={selected} />
        </section>
      </div>
    </Shell>
  );
}
