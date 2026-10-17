import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log — Curely Doctor Portal" },
      { name: "description", content: "Every view, edit and AI action, recorded." },
      { property: "og:title", content: "Audit log — Curely Doctor Portal" },
      { property: "og:description", content: "Every view, edit and AI action, recorded." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Audit,
});

function Audit() {
  const { audit } = useDemo();
  return (
    <Shell side="doctor">
      <h1 className="text-4xl">Audit log</h1>
      <p className="mt-1 text-muted-foreground">Who did what, and when.</p>
      <table className="mt-6 w-full rounded-2xl border bg-card text-left">
        <thead className="text-sm text-muted-foreground"><tr><th className="p-3">When</th><th>Who</th><th>Action</th></tr></thead>
        <tbody>
          {audit.map((a, i) => (
            <tr key={i} className="border-t"><td className="p-3 whitespace-nowrap">{a.when}</td><td>{a.who}</td><td>{a.what}</td></tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}
