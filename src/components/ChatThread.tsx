import { useEffect, useRef, useState } from "react";
import { CheckCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useDemo } from "@/lib/demo-store";
import { CLINICIANS, conversation, type DoctorId } from "@/lib/hospitals";

export function ChatThread({ patientId, viewer, otherName, doctorId }: { patientId: string; viewer: "patient" | "doctor"; otherName: string; doctorId: DoctorId }) {
  const { threads, sendMessage, markRead } = useDemo();
  const doctorName = CLINICIANS.find((d) => d.id === doctorId)?.name ?? "";
  const list = conversation(threads[patientId] ?? [], doctorName);
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(patientId, viewer, doctorId);
    end.current?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, list.filter((m) => !m.read).length, patientId, viewer, doctorId]);

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(patientId, { from: viewer, doctor: doctorName, text: t, urgent: viewer === "patient" ? urgent : undefined });
    setText("");
    setUrgent(false);
  };

  return (
    <div>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl border bg-card p-4" aria-live="polite">
        {list.length === 0 && <p className="py-6 text-center text-muted-foreground">No messages yet. Say hello to {otherName}.</p>}
        {list.map((m) => {
          const mine = m.from === viewer;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {!mine && <p className="text-sm font-semibold text-primary">{m.from === "doctor" ? m.doctor : otherName}</p>}
                {m.urgent && <p className="text-sm font-bold">URGENT</p>}
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className="mt-1 flex items-center gap-1 text-xs opacity-70">{m.time}{mine && <CheckCheck className="h-3 w-3" />}</p>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={`Write to ${otherName}…`}
          maxLength={4000}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          {viewer === "patient" ? (
            <label className="flex items-center gap-2"><Switch checked={urgent} onCheckedChange={setUrgent} /> Mark as urgent</label>
          ) : <span className="text-sm text-muted-foreground">Enter to send · Shift+Enter for a new line</span>}
          <Button type="submit" disabled={!text.trim()}><Send className="h-4 w-4" /> Send</Button>
        </div>
      </form>
    </div>
  );
}
