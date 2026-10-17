import { Link } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import type { ReactNode } from "react";

const patientLinks = [
  { to: "/patient", label: "My health" },
  { to: "/messages", label: "Messages" },
  { to: "/family", label: "Family & sharing" },
] as const;
const doctorLinks = [
  { to: "/doctor", label: "My patients" },
  { to: "/audit", label: "Audit log" },
] as const;

export function Shell({ side, children }: { side: "patient" | "doctor"; children: ReactNode }) {
  const links = side === "patient" ? patientLinks : doctorLinks;
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-5 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl text-primary">
            <HeartPulse className="h-7 w-7" /> Curely
          </Link>
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
            {side === "patient" ? "Patient · Ana Beridze" : "Doctor portal"}
          </span>
          <nav className="flex flex-wrap gap-1 md:ml-auto">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-2 font-medium text-muted-foreground hover:bg-muted"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to={side === "patient" ? "/doctor" : "/patient"}
              className="rounded-lg border px-3 py-2 font-medium text-primary hover:bg-secondary"
            >
              Switch to {side === "patient" ? "doctor" : "patient"} view
            </Link>
          </nav>
        </div>
      </header>
      <div className="bg-accent/40 px-5 py-1.5 text-center text-sm text-accent-foreground">
        Sample accounts only — not real patients. Medicines, diagnoses and messages are saved. No verified sign-in yet.
      </div>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}

export function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ai-soft px-2.5 py-0.5 text-xs font-semibold text-ai">
      AI-generated · informational
    </span>
  );
}
