import { createContext, useContext, useState, type ReactNode } from "react";

export type FindingStatus = "pending" | "approved" | "rejected";
export type Plan = "No visit needed" | "Book follow-up visit" | "Order more tests";

export interface Finding {
  id: string;
  specialty: string;
  doctor: string;
  source: string;
  date: string;
  study: string;
  aiSuggestion: string;
  confidence: number;
  flags: string[];
  status: FindingStatus;
  doctorNote?: string;
  plan?: Plan;
  reviewedAt?: string;
}

export interface Message {
  id: string;
  from: "patient" | "doctor";
  doctor: string;
  text: string;
  time: string;
  urgent?: boolean;
  read?: boolean;
}

export interface AuditEntry {
  who: string;
  what: string;
  when: string;
}

export const patient = {
  name: "Ana Beridze",
  dob: "14 Mar 1979",
  bloodType: "A+",
  gp: "Dr. Giorgi Kapanadze",
  emergency: "Levan Beridze (spouse) · +995 555 12 34 56",
  allergies: [
    { name: "Penicillin", severity: "Severe" },
    { name: "Pollen", severity: "Mild" },
  ],
  medications: [
    { name: "Atorvastatin 10 mg", dose: "Once daily, evening", by: "Dr. Kapanadze", since: "Feb 2026" },
    { name: "Vitamin D3 2000 IU", dose: "Once daily", by: "Dr. Kapanadze", since: "Nov 2025" },
  ],
  conditions: [
    { name: "Mild hypercholesterolemia", status: "Active", by: "Dr. Kapanadze", date: "Feb 2026" },
    { name: "Appendectomy", status: "Past", by: "Tbilisi Central Hospital", date: "Jun 2011" },
  ],
  vaccinations: [
    { name: "Influenza", date: "Oct 2025" },
    { name: "COVID-19 booster", date: "Apr 2025" },
    { name: "Tetanus (Td)", date: "Jan 2021" },
  ],
  visits: [
    { date: "02 Oct 2026", doctor: "Dr. Kapanadze", note: "Recurring lower-back pain for 3 months. Ordered spine X-ray and ECG." },
    { date: "12 Feb 2026", doctor: "Dr. Kapanadze", note: "Cholesterol elevated. Started atorvastatin, diet advice." },
  ],
};

export const cholesterol = [
  { date: "Feb 25", value: 6.4 },
  { date: "Aug 25", value: 6.1 },
  { date: "Feb 26", value: 6.3 },
  { date: "May 26", value: 5.7 },
  { date: "Oct 26", value: 5.4 },
];

export const labs = [
  { name: "Total cholesterol", value: "5.4 mmol/L", range: "< 5.2", status: "High" },
  { name: "LDL", value: "3.3 mmol/L", range: "< 3.0", status: "High" },
  { name: "HbA1c", value: "5.4 %", range: "4.0 – 5.6", status: "Normal" },
  { name: "Vitamin D", value: "34 ng/mL", range: "30 – 100", status: "Normal" },
  { name: "Hemoglobin", value: "13.2 g/dL", range: "12 – 15.5", status: "Normal" },
];

const initialFindings: Finding[] = [
  {
    id: "f1",
    specialty: "Orthopedics · Spine",
    doctor: "Dr. Nika Tsiklauri",
    source: "Tbilisi Central Hospital · Radiology",
    date: "15 Oct 2026",
    study: "Spine X-ray (PA + lateral)",
    aiSuggestion:
      "Findings consistent with mild right thoracolumbar scoliosis, estimated Cobb angle ~14°. No vertebral fractures. Mild disc-space narrowing at L4–L5.",
    confidence: 0.82,
    flags: [],
    status: "pending",
  },
  {
    id: "f2",
    specialty: "Cardiology",
    doctor: "Dr. Mariam Lomidze",
    source: "Curely Partner Lab",
    date: "16 Oct 2026",
    study: "12-lead ECG",
    aiSuggestion: "Normal sinus rhythm, 72 bpm. No ST changes. QTc 421 ms (normal).",
    confidence: 0.91,
    flags: ["Patient on atorvastatin — avoid adding clarithromycin (interaction)."],
    status: "pending",
  },
  {
    id: "f3",
    specialty: "Family medicine",
    doctor: "Dr. Giorgi Kapanadze",
    source: "Curely Partner Lab",
    date: "14 Oct 2026",
    study: "Lipid panel",
    aiSuggestion: "LDL 3.3 mmol/L, down from 4.1 in Feb. Treatment responding; still above target.",
    confidence: 0.95,
    flags: ["LDL above target range"],
    status: "approved",
    doctorNote: "Good progress. Continue atorvastatin and diet; recheck in 6 months.",
    plan: "No visit needed",
    reviewedAt: "14 Oct 2026, 16:20",
  },
];

const initialMessages: Message[] = [
  { id: "m1", from: "doctor", doctor: "Dr. Giorgi Kapanadze", text: "Hi Ana, your cholesterol results look better. I've added a note to your record.", time: "Oct 14, 16:22", read: true },
  { id: "m2", from: "patient", doctor: "Dr. Giorgi Kapanadze", text: "Thank you! Do I need to come in about my back X-ray?", time: "Oct 15, 09:10", read: true },
  { id: "m3", from: "doctor", doctor: "Dr. Giorgi Kapanadze", text: "Dr. Tsiklauri (spine) is reviewing it now. You'll be notified as soon as she confirms.", time: "Oct 15, 10:02", read: true },
];

export const familyMembers = [
  { name: "Levan Beridze", relation: "Spouse", access: "Emergency info only" },
  { name: "Mari Beridze", relation: "Daughter (14)", access: "You manage her record" },
  { name: "Tamar Gelashvili", relation: "Mother", access: "Caregiver access granted by her" },
];

export const shareCategories = ["Allergies", "Medications", "Conditions", "Lab results", "Imaging", "Family history"];

interface Ctx {
  findings: Finding[];
  messages: Message[];
  audit: AuditEntry[];
  sharing: Record<string, Record<string, boolean>>;
  review: (id: string, status: FindingStatus, note: string, plan: Plan, editedText?: string) => void;
  send: (m: Omit<Message, "id" | "time">) => void;
  toggleShare: (person: string, cat: string) => void;
}

const DemoCtx = createContext<Ctx | null>(null);

function now() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [findings, setFindings] = useState(initialFindings);
  const [messages, setMessages] = useState(initialMessages);
  const [audit, setAudit] = useState<AuditEntry[]>([
    { who: "Dr. Giorgi Kapanadze", what: "Approved lipid panel summary", when: "14 Oct, 16:20" },
    { who: "Curely AI (Spine)", what: "Pre-analyzed spine X-ray", when: "15 Oct, 08:02" },
    { who: "Dr. Nika Tsiklauri", what: "Viewed imaging record", when: "15 Oct, 11:40" },
  ]);
  const [sharing, setSharing] = useState<Record<string, Record<string, boolean>>>({
    "Levan Beridze": { Allergies: true, Medications: true },
    "Tamar Gelashvili": { "Family history": true },
  });

  const review: Ctx["review"] = (id, status, note, plan, editedText) => {
    const f = findings.find((x) => x.id === id);
    setFindings((fs) =>
      fs.map((x) =>
        x.id === id ? { ...x, status, doctorNote: note, plan, reviewedAt: now(), aiSuggestion: editedText ?? x.aiSuggestion } : x,
      ),
    );
    if (f) {
      setAudit((a) => [{ who: f.doctor, what: `${status === "approved" ? "Approved" : "Rejected"} AI finding: ${f.study}`, when: now() }, ...a]);
      if (status === "approved")
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), from: "doctor", doctor: f.doctor, text: `I've reviewed your ${f.study}. ${note} Plan: ${plan}.`, time: now() },
        ]);
    }
  };

  const send: Ctx["send"] = (m) => setMessages((ms) => [...ms, { ...m, id: crypto.randomUUID(), time: now() }]);

  const toggleShare = (person: string, cat: string) => {
    setSharing((s) => ({ ...s, [person]: { ...s[person], [cat]: !s[person]?.[cat] } }));
    setAudit((a) => [{ who: patient.name, what: `Changed sharing of ${cat} with ${person}`, when: now() }, ...a]);
  };

  return <DemoCtx.Provider value={{ findings, messages, audit, sharing, review, send, toggleShare }}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const c = useContext(DemoCtx);
  if (!c) throw new Error("useDemo outside provider");
  return c;
}
