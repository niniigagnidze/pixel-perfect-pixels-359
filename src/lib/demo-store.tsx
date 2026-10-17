import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { getMockDirectory, markMockRead, saveMockPatientRecord, sendMockMessage } from "./mock-users.functions";
import type { SavePatientInput } from "./mock-users";
import { careStatus, CLINICIANS, type Clinician, type DoctorId, type CareStatus } from "./hospitals";

export const CURRENT_DOCTOR = "Dr. Giorgi Kapanadze";

export type FindingStatus = "pending" | "approved" | "rejected";
export type Plan = "No visit needed" | "Book follow-up visit" | "Order more tests";

export interface Finding {
  id: string;
  patientId: string;
  specialty: string;
  doctor: string;
  source: string;
  hospital: string;
  date: string;
  study: string;
  aiSuggestion: string;
  confidence: number;
  flags: string[];
  status: FindingStatus;
  doctorNote?: string | undefined;
  plan?: Plan | undefined;
  reviewedAt?: string | undefined;
}

export interface Message {
  id: string;
  from: "patient" | "doctor";
  doctor: string;
  text: string;
  time: string;
  urgent?: boolean | undefined;
  read?: boolean | undefined;
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

export const initialFindings: Finding[] = [
  {
    id: "f1",
    patientId: "p1",
    specialty: "Orthopedics · Spine",
    doctor: "Dr. Nika Tsiklauri",
    hospital: "Tbilisi Central Hospital",
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
    patientId: "p1",
    specialty: "Cardiology",
    doctor: "Dr. Mariam Lomidze",
    hospital: "Batumi Heart Center",
    source: "Batumi Heart Center · Cardiology lab",
    date: "16 Oct 2026",
    study: "12-lead ECG",
    aiSuggestion: "Normal sinus rhythm, 72 bpm. No ST changes. QTc 421 ms (normal).",
    confidence: 0.91,
    flags: ["Patient on atorvastatin — avoid adding clarithromycin (interaction)."],
    status: "pending",
  },
  {
    id: "f3",
    patientId: "p1",
    specialty: "Family medicine",
    doctor: "Dr. Giorgi Kapanadze",
    hospital: "Vake Family Clinic",
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
  {
    id: "f4", patientId: "p2", specialty: "Family medicine", doctor: CURRENT_DOCTOR, hospital: "Vake Family Clinic", source: "Curely Partner Lab", date: "16 Oct 2026",
    study: "Complete blood count", aiSuggestion: "Hemoglobin 10.9 g/dL (low), MCV 76 fL (low). Pattern suggests iron-deficiency anemia.",
    confidence: 0.87, flags: ["Hemoglobin below normal range"], status: "pending",
  },
  {
    id: "f5", patientId: "p2", specialty: "Family medicine", doctor: CURRENT_DOCTOR, hospital: "Vake Family Clinic", source: "Curely Partner Lab", date: "16 Oct 2026",
    study: "Ferritin", aiSuggestion: "Ferritin 8 ng/mL (low). Consistent with depleted iron stores.",
    confidence: 0.93, flags: [], status: "pending",
  },
  {
    id: "f6", patientId: "p3", specialty: "Family medicine", doctor: CURRENT_DOCTOR, hospital: "Vake Family Clinic", source: "Tbilisi Central Hospital", date: "15 Oct 2026",
    study: "Fasting glucose & HbA1c", aiSuggestion: "Fasting glucose 7.4 mmol/L, HbA1c 6.9 %. Meets criteria for type 2 diabetes.",
    confidence: 0.9, flags: ["Patient reports sulfa allergy"], status: "pending",
  },
  {
    id: "f7", patientId: "p4", specialty: "Family medicine", doctor: CURRENT_DOCTOR, hospital: "Vake Family Clinic", source: "Curely Partner Lab", date: "10 Oct 2026",
    study: "Thyroid panel (TSH)", aiSuggestion: "TSH 2.1 mIU/L, within normal range.",
    confidence: 0.96, flags: [], status: "approved", doctorNote: "Thyroid normal.", plan: "No visit needed", reviewedAt: "11 Oct 2026, 10:05",
  },
];

export interface Diagnosis { name: string; note: string; date: string; by: string; hospital?: string | undefined }
export interface Prescription { name: string; dose: string; date: string; by: string; hospital?: string | undefined }
export interface DoctorPatient {
  id: string;
  name: string;
  ssn: string;
  dob: string;
  bloodType: string;
  allergies: string[];
  status: "pending" | "done";
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  completedAt?: string | undefined;
  doctorStatuses?: Partial<Record<DoctorId, CareStatus>> | undefined;
  findingReviews?: Record<string, { status: FindingStatus; doctorNote?: string | undefined; plan?: Plan | undefined; reviewedAt?: string | undefined; aiSuggestion?: string | undefined }> | undefined;
  messages?: Message[] | undefined;
}

export const initialPatients: DoctorPatient[] = [
  { id: "p1", name: "Ana Beridze", ssn: "01024056789", dob: "14 Mar 1979", bloodType: "A+", allergies: ["Penicillin (severe)", "Pollen"], status: "pending",
    diagnoses: [{ name: "Mild hypercholesterolemia", note: "Diet + statin.", date: "12 Feb 2026", by: CURRENT_DOCTOR }],
    prescriptions: [{ name: "Atorvastatin 10 mg", dose: "Once daily, evening", date: "12 Feb 2026", by: CURRENT_DOCTOR }] },
  { id: "p2", name: "Davit Javakhishvili", ssn: "01017033412", dob: "02 Jul 1990", bloodType: "O+", allergies: [], status: "pending", diagnoses: [], prescriptions: [] },
  { id: "p3", name: "Nino Chkheidze", ssn: "01008022987", dob: "21 Nov 1965", bloodType: "B-", allergies: ["Sulfonamides"], status: "pending", diagnoses: [], prescriptions: [] },
  { id: "p4", name: "Irakli Maisuradze", ssn: "01030011245", dob: "09 Jan 1984", bloodType: "AB+", allergies: [], status: "done",
    diagnoses: [{ name: "No thyroid disease", note: "Routine check normal.", date: "11 Oct 2026", by: CURRENT_DOCTOR }], prescriptions: [], completedAt: "11 Oct 2026, 10:10" },
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
  doctor: Clinician;
  setDoctorId: (id: string) => void;
  findings: Finding[];
  patients: DoctorPatient[];
  addDiagnosis: (pid: string, name: string, note: string) => void;
  addPrescription: (pid: string, name: string, dose: string) => void;
  setPatientStatus: (pid: string, status: "pending" | "done") => void;
  removeDiagnosis: (pid: string, index: number) => void;
  removePrescription: (pid: string, index: number) => void;
  undoReview: (id: string) => void;
  messages: Message[];
  threads: Record<string, Message[]>;
  sendMessage: (pid: string, m: Omit<Message, "id" | "time">) => void;
  markRead: (pid: string, viewer: "patient" | "doctor", doctorId: DoctorId) => void;
  audit: AuditEntry[];
  sharing: Record<string, Record<string, boolean>>;
  review: (id: string, status: FindingStatus, note: string, plan: Plan, editedText?: string) => void;
  send: (m: Omit<Message, "id" | "time">) => void;
  toggleShare: (person: string, cat: string) => void;
  confidential: boolean;
  setConfidential: (v: boolean) => void;
  privateCats: Record<string, boolean>;
  togglePrivate: (cat: string) => void;
  twoStep: boolean;
  setTwoStep: (v: boolean) => void;
  canSee: (person: string, cat: string) => boolean;
}

const DemoCtx = createContext<Ctx | null>(null);

function now() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function DemoProvider({ children, savedPatients = initialPatients }: { children: ReactNode; savedPatients?: DoctorPatient[] }) {
  const [findings, setFindings] = useState<Finding[]>(() =>
    initialFindings.map((f) => {
      const r = savedPatients.find((p) => p.id === f.patientId)?.findingReviews?.[f.id];
      return r ? { ...f, status: r.status, doctorNote: r.doctorNote, plan: r.plan, reviewedAt: r.reviewedAt, aiSuggestion: r.aiSuggestion ?? f.aiSuggestion } : f;
    }),
  );
  const [threads, setThreads] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(savedPatients.map((p) => [p.id, p.messages ?? (p.id === "p1" ? initialMessages : [])])),
  );
  const messages = threads["p1"] ?? [];
  const mergeThreads = (incoming: Record<string, Message[]>) =>
    setThreads((cur) => {
      let changed = false;
      const next = { ...cur };
      for (const [pid, list] of Object.entries(incoming)) {
        const server = new Map(list.map((m) => [m.id, m]));
        const have = new Set((cur[pid] ?? []).map((m) => m.id));
        const extra = list.filter((m) => !have.has(m.id));
        const updated = (cur[pid] ?? []).map((m) => (server.get(m.id)?.read && !m.read ? { ...m, read: true } : m));
        const readChanged = updated.some((m, i) => m !== (cur[pid] ?? [])[i]);
        if (extra.length || readChanged) { changed = true; next[pid] = [...updated, ...extra]; }
      }
      return changed ? next : cur;
    });
  useEffect(() => {
    let stop = false;
    const tick = () => getMockDirectory().then(({ patients: incoming }) => {
      if (stop) return;
      mergeThreads(Object.fromEntries(incoming.map((p) => [p.id, p.messages ?? []])));
      const available = incoming.filter((p) => !dirty.current.has(p.id) && ![...queue.current.entries()].some(([key, q]) => key.startsWith(`${p.id}:`) && (q.inFlight || q.next)));
      setPatients((current) => current.map((p) => available.find((row) => row.id === p.id) ?? p));
      setFindings((current) => current.map((f) => {
        const p = available.find((row) => row.id === f.patientId);
        if (!p) return f;
        const base = initialFindings.find((row) => row.id === f.id);
        const r = p.findingReviews?.[f.id];
        return r ? { ...f, ...r, aiSuggestion: r.aiSuggestion ?? f.aiSuggestion } : { ...f, status: base?.status ?? "pending", doctorNote: base?.doctorNote, plan: base?.plan, reviewedAt: base?.reviewedAt };
      }));
    }).catch(() => {});
    const id = setInterval(tick, 4000);
    return () => { stop = true; clearInterval(id); };
  }, []);
  const sendMessage: Ctx["sendMessage"] = (pid, m) => {
    const msg: Message = { ...m, id: crypto.randomUUID(), time: now(), read: false };
    setThreads((t) => ({ ...t, [pid]: [...(t[pid] ?? []), msg] }));
    const attempt = (n: number) =>
      sendMockMessage({ data: { patientId: pid as SavePatientInput["patientId"], message: msg } }).catch(() => {
        if (n < 4) setTimeout(() => attempt(n + 1), 1000 * 2 ** n);
        else import("sonner").then(({ toast }) => toast.error("Message could not be sent. Please try again."));
      });
    attempt(0);
  };
  const markRead: Ctx["markRead"] = (pid, viewer, targetId) => {
    const name = CLINICIANS.find((c) => c.id === targetId)?.name;
    if (!(threads[pid] ?? []).some((m) => m.doctor === name && m.from !== viewer && !m.read)) return;
    setThreads((t) => ({ ...t, [pid]: (t[pid] ?? []).map((m) => (m.doctor === name && m.from !== viewer ? { ...m, read: true } : m)) }));
    markMockRead({ data: { patientId: pid as SavePatientInput["patientId"], viewer, doctorId: targetId } }).catch(() => {});
  };
  const [doctorId, setDoctorIdState] = useState("d1");
  useEffect(() => { const v = localStorage.getItem("curely-doctor"); if (v && CLINICIANS.some((c) => c.id === v)) setDoctorIdState(v); }, []);
  const setDoctorId = (id: string) => { setDoctorIdState(id); localStorage.setItem("curely-doctor", id); };
  const doctor = CLINICIANS.find((c) => c.id === doctorId) ?? { id: "d1", name: CURRENT_DOCTOR, hospital: "Vake Family Clinic", specialty: "Family medicine" };
  const [patients, setPatients] = useState(savedPatients);
  const dirty = useRef(new Set<string>());
  const touch = (pid: string) => dirty.current.add(pid);
  // Per-patient save queue: one request in flight, newest snapshot wins, failed saves retry.
  const queue = useRef(new Map<string, { inFlight: boolean; next: SavePatientInput | null; attempts: number }>());
  const flush = (pid: string) => {
    const q = queue.current.get(pid);
    if (!q || q.inFlight || !q.next) return;
    const snapshot = q.next;
    q.next = null;
    q.inFlight = true;
    saveMockPatientRecord({ data: snapshot })
      .then(() => { q.attempts = 0; })
      .catch(() => {
        if (!q.next) q.next = snapshot;
        q.attempts += 1;
        if (q.attempts === 1) import("sonner").then(({ toast }) => toast.error("Couldn't save — retrying…"));
      })
      .finally(() => {
        q.inFlight = false;
        if (q.next) setTimeout(() => flush(pid), q.attempts ? Math.min(1000 * 2 ** q.attempts, 15000) : 0);
      });
  };
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if ([...queue.current.values()].some((q) => q.inFlight || q.next)) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  useEffect(() => {
    const ids = [...dirty.current];
    dirty.current.clear();
    for (const pid of ids) {
      const p = patients.find((x) => x.id === pid);
      if (!p) continue;
      const findingReviews = Object.fromEntries(
        findings.filter((f) => f.patientId === pid).map((f) => [f.id, { status: f.status, doctorNote: f.doctorNote, plan: f.plan, reviewedAt: f.reviewedAt, aiSuggestion: f.aiSuggestion }]),
      );
      const key = `${pid}:${doctor.id}`;
      const q = queue.current.get(key) ?? { inFlight: false, next: null, attempts: 0 };
      queue.current.set(key, q);
      const status = careStatus(p, doctor.id);
      q.next = {
        patientId: pid as SavePatientInput["patientId"], doctorId: doctor.id as DoctorId, status: status.status, completedAt: status.completedAt ?? null,
        diagnoses: p.diagnoses, prescriptions: p.prescriptions, findingReviews,
      };
      flush(key);
    }
  }, [patients, findings]);
  const pname = (pid: string) => patients.find((p) => p.id === pid)?.name ?? "patient";
  const today = () => new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const addDiagnosis: Ctx["addDiagnosis"] = (pid, name, note) => {
    touch(pid);
    setPatients((ps) => ps.map((p) => (p.id === pid ? { ...p, diagnoses: [{ name, note, date: today(), by: doctor.name, hospital: doctor.hospital }, ...p.diagnoses] } : p)));
    setAudit((a) => [{ who: `${doctor.name} (${doctor.hospital})`, what: `Diagnosed ${pname(pid)}: ${name}`, when: now() }, ...a]);
  };
  const addPrescription: Ctx["addPrescription"] = (pid, name, dose) => {
    touch(pid);
    setPatients((ps) => ps.map((p) => (p.id === pid ? { ...p, prescriptions: [{ name, dose, date: today(), by: doctor.name, hospital: doctor.hospital }, ...p.prescriptions] } : p)));
    setAudit((a) => [{ who: `${doctor.name} (${doctor.hospital})`, what: `Prescribed ${name} to ${pname(pid)}`, when: now() }, ...a]);
  };
  const setPatientStatus: Ctx["setPatientStatus"] = (pid, status) => {
    touch(pid);
    setPatients((ps) => ps.map((p) => (p.id === pid ? { ...p, ...(doctor.id === "d1" ? { status, completedAt: status === "done" ? now() : undefined } : {}), doctorStatuses: { ...p.doctorStatuses, [doctor.id]: { status, completedAt: status === "done" ? now() : undefined } } } : p)));
    setAudit((a) => [{ who: `${doctor.name} (${doctor.hospital})`, what: `${status === "done" ? "Marked done" : "Reopened"}: ${pname(pid)}`, when: now() }, ...a]);
  };
  const removeDiagnosis: Ctx["removeDiagnosis"] = (pid, index) => {
    const d = patients.find((p) => p.id === pid)?.diagnoses[index];
    if (!d || d.by !== doctor.name) return;
    touch(pid);
    setPatients((ps) => ps.map((p) => (p.id === pid ? { ...p, diagnoses: p.diagnoses.filter((_, i) => i !== index) } : p)));
    setAudit((a) => [{ who: `${doctor.name} (${doctor.hospital})`, what: `Removed diagnosis for ${pname(pid)}: ${d.name}`, when: now() }, ...a]);
  };
  const removePrescription: Ctx["removePrescription"] = (pid, index) => {
    const r = patients.find((p) => p.id === pid)?.prescriptions[index];
    if (!r || r.by !== doctor.name) return;
    touch(pid);
    setPatients((ps) => ps.map((p) => (p.id === pid ? { ...p, prescriptions: p.prescriptions.filter((_, i) => i !== index) } : p)));
    setAudit((a) => [{ who: `${doctor.name} (${doctor.hospital})`, what: `Removed prescription ${r.name} for ${pname(pid)}`, when: now() }, ...a]);
  };
  const undoReview: Ctx["undoReview"] = (id) => {
    const f = findings.find((x) => x.id === id);
    if (!f || f.status === "pending" || f.doctor !== doctor.name) return;
    touch(f.patientId);
    setFindings((fs) => fs.map((x) => (x.id === id ? { ...x, status: "pending", doctorNote: undefined, plan: undefined, reviewedAt: undefined } : x)));
    setAudit((a) => [{ who: f.doctor, what: `Withdrew review of ${f.study} (back to pending)`, when: now() }, ...a]);
    if (f.status === "approved")
      sendMessage(f.patientId, { from: "doctor", doctor: f.doctor, text: `Correction: my earlier review of your ${f.study} was withdrawn and is being reviewed again.` });
  };
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
    if (!f || f.doctor !== doctor.name) return;
    if (f) touch(f.patientId);
    setFindings((fs) =>
      fs.map((x) =>
        x.id === id ? { ...x, status, doctorNote: note, plan, reviewedAt: now(), aiSuggestion: editedText ?? x.aiSuggestion } : x,
      ),
    );
    if (f) {
      setAudit((a) => [{ who: f.doctor, what: `${status === "approved" ? "Approved" : "Rejected"} AI finding: ${f.study}`, when: now() }, ...a]);
      if (status === "approved")
        sendMessage(f.patientId, { from: "doctor", doctor: f.doctor, text: `I've reviewed your ${f.study}. ${note} Plan: ${plan}.` });
    }
  };

  const send: Ctx["send"] = (m) => sendMessage("p1", m);

  const toggleShare = (person: string, cat: string) => {
    setSharing((s) => ({ ...s, [person]: { ...s[person], [cat]: !s[person]?.[cat] } }));
    setAudit((a) => [{ who: patient.name, what: `Changed sharing of ${cat} with ${person}`, when: now() }, ...a]);
  };

  const [confidential, setConf] = useState(false);
  const [privateCats, setPrivateCats] = useState<Record<string, boolean>>({ "Family history": false });
  const [twoStep, setTwo] = useState(true);
  const log = (what: string) => setAudit((a) => [{ who: patient.name, what, when: now() }, ...a]);
  const setConfidential = (v: boolean) => { setConf(v); log(v ? "Turned on confidential mode (hidden from family)" : "Turned off confidential mode"); };
  const togglePrivate = (cat: string) => { setPrivateCats((s) => ({ ...s, [cat]: !s[cat] })); log(`Set ${cat} to ${privateCats[cat] ? "shareable" : "private"}`); };
  const setTwoStep = (v: boolean) => { setTwo(v); log(`${v ? "Enabled" : "Disabled"} 2-step verification`); };
  const canSee = (person: string, cat: string) => !confidential && !privateCats[cat] && !!sharing[person]?.[cat];

  return <DemoCtx.Provider value={{ doctor, setDoctorId, confidential, setConfidential, privateCats, togglePrivate, twoStep, setTwoStep, canSee, findings, patients, addDiagnosis, addPrescription, setPatientStatus, removeDiagnosis, removePrescription, undoReview, messages, threads, sendMessage, markRead, audit, sharing, review, send, toggleShare }}>{children}</DemoCtx.Provider>;
}

export function useDemo() {
  const c = useContext(DemoCtx);
  if (!c) throw new Error("useDemo outside provider");
  return c;
}
