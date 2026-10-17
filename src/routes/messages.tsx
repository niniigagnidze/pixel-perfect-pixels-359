import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCheck, Send } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useDemo } from "@/lib/demo-store";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Curely" },
      { name: "description", content: "Secure messages with your doctors." },
      { property: "og:title", content: "Messages — Curely" },
      { property: "og:description", content: "Secure messages with your doctors." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { messages, send } = useDemo();
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  return (
    <Shell side="patient">
      <h1 className="text-4xl">Messages</h1>
      <p className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-destructive">
        <AlertTriangle className="h-5 w-5" /> Messaging is not for emergencies. In an emergency call <b>112</b>.
      </p>
      <div className="mt-6 space-y-3 rounded-2xl border bg-card p-5">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "patient" ? "justify-end" : ""}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${m.from === "patient" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m.from === "doctor" && <p className="text-sm font-semibold text-primary">{m.doctor}</p>}
              {m.urgent && <p className="text-sm font-bold">URGENT</p>}
              <p>{m.text}</p>
              <p className="mt-1 flex items-center gap-1 text-xs opacity-70">{m.time}{m.from === "patient" && <CheckCheck className="h-3 w-3" />}</p>
            </div>
          </div>
        ))}
      </div>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          send({ from: "patient", doctor: "Dr. Giorgi Kapanadze", text, urgent });
          setText(""); setUrgent(false);
        }}
      >
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write to Dr. Kapanadze…" />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2"><Switch checked={urgent} onCheckedChange={setUrgent} /> Mark as urgent</label>
          <Button type="submit"><Send className="h-4 w-4" /> Send</Button>
        </div>
      </form>
    </Shell>
  );
}
