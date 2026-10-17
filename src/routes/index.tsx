import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, User, Stethoscope, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curely — Your health, connected" },
      { name: "description", content: "Curely connects patients, family doctors, specialists and hospitals with real-time records and doctor-approved AI." },
      { property: "og:title", content: "Curely — Your health, connected" },
      { property: "og:description", content: "Patients, doctors and hospitals in one secure place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center gap-2 font-display text-3xl text-primary">
          <HeartPulse className="h-9 w-9" /> Curely
        </div>
        <h1 className="mt-10 max-w-3xl text-5xl leading-tight md:text-6xl">
          Your whole medical story, clear and in one place.
        </h1>
        <p className="mt-5 max-w-2xl text-xl text-muted-foreground">
          Patients see their records in plain language. Doctors review results with AI help — and nothing reaches the patient until a doctor approves it.
        </p>
        <p className="mt-10 font-semibold">Choose a demo view:</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <Link to="/patient" className="group rounded-2xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <User className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-2xl">I'm a patient</h2>
            <p className="mt-2 text-muted-foreground">See Ana's record, AI summaries, messages and family sharing.</p>
          </Link>
          <Link to="/doctor" className="group rounded-2xl border bg-card p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <Stethoscope className="h-10 w-10 text-ai" />
            <h2 className="mt-4 text-2xl">I'm a doctor</h2>
            <p className="mt-2 text-muted-foreground">Review AI pre-analysis of new results, approve diagnoses, set the plan.</p>
          </Link>
        </div>
        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Every view and approval is logged. Sample data only.
        </p>
      </div>
    </div>
  );
}
