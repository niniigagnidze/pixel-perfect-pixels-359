import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { Shell } from "@/components/Shell";
import { ChatThread } from "@/components/ChatThread";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Curely" },
      { name: "description", content: "Secure messages with your doctors." },
      { property: "og:title", content: "Messages — Curely" },
      { property: "og:description", content: "Secure messages with your doctors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Messages,
});

function Messages() {
  return (
    <Shell side="patient">
      <h1 className="text-4xl">Messages</h1>
      <p className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-destructive">
        <AlertTriangle className="h-5 w-5" /> Messaging is not for emergencies. In an emergency call <b>112</b>.
      </p>
      <div className="mt-6"><ChatThread patientId="p1" viewer="patient" otherName="Dr. Giorgi Kapanadze" /></div>
    </Shell>
  );
}
