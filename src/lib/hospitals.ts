export interface Clinician { id: string; name: string; hospital: string; specialty: string }

export const CLINICIANS: Clinician[] = [
  { id: "d1", name: "Dr. Giorgi Kapanadze", hospital: "Vake Family Clinic", specialty: "Family medicine" },
  { id: "d2", name: "Dr. Nika Tsiklauri", hospital: "Tbilisi Central Hospital", specialty: "Orthopedics · Spine" },
  { id: "d3", name: "Dr. Mariam Lomidze", hospital: "Batumi Heart Center", specialty: "Cardiology" },
];

export const HOSPITALS = [...new Set(CLINICIANS.map((c) => c.hospital))];

export type DoctorId = "d1" | "d2" | "d3";
export interface CareStatus { status: "pending" | "done"; completedAt?: string | undefined }
export const FINDING_DOCTORS: Record<string, DoctorId> = { f1: "d2", f2: "d3", f3: "d1", f4: "d1", f5: "d1", f6: "d1", f7: "d1" };

export function careStatus(patient: { status: "pending" | "done"; completedAt?: string | undefined; doctorStatuses?: Partial<Record<DoctorId, CareStatus>> | undefined }, doctorId: string): CareStatus {
  return patient.doctorStatuses?.[doctorId as DoctorId] ?? (doctorId === "d1" ? { status: patient.status, completedAt: patient.completedAt } : { status: "pending" });
}

export function conversation<T extends { doctor: string }>(messages: T[], doctorName: string): T[] {
  return messages.filter((m) => m.doctor === doctorName);
}

/** Hospital for a record: explicit value first, otherwise the author's hospital. */
export function hospitalOf(by: string, explicit?: string): string {
  return explicit || CLINICIANS.find((c) => c.name === by)?.hospital || "Other provider";
}

export interface TimelineItem { kind: "Diagnosis" | "Medicine" | "Result"; title: string; detail: string; date: string; by: string; hospital: string }

function time(d: string) {
  const t = Date.parse(d.split(",")[0] ?? d);
  return Number.isNaN(t) ? 0 : t;
}

export function buildTimeline(input: {
  diagnoses: { name: string; note: string; date: string; by: string; hospital?: string | undefined }[];
  prescriptions: { name: string; dose: string; date: string; by: string; hospital?: string | undefined }[];
  results: { study: string; note: string; date: string; doctor: string; hospital: string }[];
}): TimelineItem[] {
  return [
    ...input.diagnoses.map((d) => ({ kind: "Diagnosis" as const, title: d.name, detail: d.note, date: d.date, by: d.by, hospital: hospitalOf(d.by, d.hospital) })),
    ...input.prescriptions.map((r) => ({ kind: "Medicine" as const, title: r.name, detail: r.dose, date: r.date, by: r.by, hospital: hospitalOf(r.by, r.hospital) })),
    ...input.results.map((f) => ({ kind: "Result" as const, title: f.study, detail: f.note, date: f.date, by: f.doctor, hospital: f.hospital })),
  ].sort((a, b) => time(b.date) - time(a.date));
}
