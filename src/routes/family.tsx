import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Switch } from "@/components/ui/switch";
import { useDemo, familyMembers, shareCategories } from "@/lib/demo-store";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family & sharing — Curely" },
      { name: "description", content: "Choose exactly who can see what in your record." },
      { property: "og:title", content: "Family & sharing — Curely" },
      { property: "og:description", content: "Choose exactly who can see what in your record." },
    ],
  }),
  component: Family,
});

function Family() {
  const { sharing, toggleShare } = useDemo();
  return (
    <Shell side="patient">
      <h1 className="text-4xl">Family & sharing</h1>
      <p className="mt-1 text-muted-foreground">Sharing is off by default. Turn categories on or off at any time.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {familyMembers.map((p) => (
          <section key={p.name} className="rounded-2xl border bg-card p-5 shadow-sm">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="mt-2 text-xl">{p.name}</h2>
            <p className="text-sm text-muted-foreground">{p.relation} · {p.access}</p>
            <ul className="mt-4 space-y-2">
              {shareCategories.map((c) => (
                <li key={c} className="flex items-center justify-between">
                  <span>{c}</span>
                  <Switch checked={!!sharing[p.name]?.[c]} onCheckedChange={() => toggleShare(p.name, c)} aria-label={`Share ${c} with ${p.name}`} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
