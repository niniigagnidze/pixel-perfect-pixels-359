import { createFileRoute } from "@tanstack/react-router";
import { EyeOff, Lock, ShieldCheck, Users, Globe } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Switch } from "@/components/ui/switch";
import { useDemo, familyMembers, shareCategories, CURRENT_DOCTOR } from "@/lib/demo-store";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family, privacy & security — Curely" },
      { name: "description", content: "Choose what stays private, what family can see, and who can access your record." },
      { property: "og:title", content: "Family, privacy & security — Curely" },
      { property: "og:description", content: "Choose what stays private, what family can see, and who can access your record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Family,
});

function Family() {
  const { sharing, toggleShare, confidential, setConfidential, privateCats, togglePrivate, twoStep, setTwoStep, canSee, audit } = useDemo();
  const accessLog = audit.filter((a) => a.what.toLowerCase().includes("view") || a.what.includes("sharing") || a.what.includes("confidential") || a.what.includes("private")).slice(0, 6);

  return (
    <Shell side="patient">
      <h1 className="text-4xl">Family, privacy & security</h1>
      <p className="mt-1 text-muted-foreground">You decide who sees your health information. Everything is private unless you share it.</p>

      <section className={`mt-6 flex flex-wrap items-center gap-4 rounded-2xl border p-5 shadow-sm ${confidential ? "border-destructive/40 bg-destructive/10" : "bg-card"}`}>
        <EyeOff className="h-7 w-7 text-destructive" />
        <div className="flex-1">
          <h2 className="text-xl">Confidential mode</h2>
          <p className="text-sm text-muted-foreground">Hide your whole record from all family members. Only your doctors can see it. Your sharing choices are kept for later.</p>
        </div>
        <Switch checked={confidential} onCheckedChange={setConfidential} aria-label="Confidential mode" />
      </section>

      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl"><Lock className="h-5 w-5 text-primary" /> What can be shared</h2>
        <p className="text-sm text-muted-foreground">Private items are never shown to family, even if sharing is turned on for someone.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {shareCategories.map((c) => (
            <li key={c} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
              <span>{c}</span>
              <button
                onClick={() => togglePrivate(c)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${privateCats[c] ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}
              >
                {privateCats[c] ? <><Lock className="h-3.5 w-3.5" /> Private</> : <><Globe className="h-3.5 w-3.5" /> Shareable</>}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mt-8 text-2xl">Family members</h2>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {familyMembers.map((p) => (
          <section key={p.name} className="rounded-2xl border bg-card p-5 shadow-sm">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="mt-2 text-xl">{p.name}</h3>
            <p className="text-sm text-muted-foreground">{p.relation} · {p.access}</p>
            <ul className="mt-4 space-y-2">
              {shareCategories.map((c) => {
                const blocked = confidential || privateCats[c];
                return (
                  <li key={c} className="flex items-center justify-between">
                    <span className={blocked ? "text-muted-foreground line-through" : ""}>{c}</span>
                    {blocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" aria-label="Private" />
                    ) : (
                      <Switch checked={!!sharing[p.name]?.[c]} onCheckedChange={() => toggleShare(p.name, c)} aria-label={`Share ${c} with ${p.name}`} />
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm font-medium">
              Can see: {shareCategories.filter((c) => canSee(p.name, c)).join(", ") || "nothing"}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl"><ShieldCheck className="h-5 w-5 text-success" /> Who can open your record</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>✓ You</li>
            <li>✓ Your doctors: {CURRENT_DOCTOR}, Dr. Nika Tsiklauri, Dr. Mariam Lomidze</li>
            <li>✓ Family members — only what you allow above</li>
            <li className="font-semibold text-destructive">✗ Everyone else is blocked (employers, insurers, other clinics)</li>
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
            <span>2-step verification at sign-in</span>
            <Switch checked={twoStep} onCheckedChange={setTwoStep} aria-label="2-step verification" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Every view and change is recorded and cannot be deleted.</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-xl">Recent access & changes</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {accessLog.map((a, i) => <li key={i}><b>{a.who}</b> — {a.what} <span className="text-muted-foreground">· {a.when}</span></li>)}
          </ul>
        </div>
      </section>
    </Shell>
  );
}
