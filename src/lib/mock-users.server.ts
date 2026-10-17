import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { mapMockPatients, mockUserSchema, mockPersonaSchema } from "./mock-users";
import { CLINICIANS, FINDING_DOCTORS } from "./hospitals";

export async function readMockDirectory() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Sample user database is not configured");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(input instanceof Request ? input.headers : undefined);
      new Headers(init?.headers).forEach((value, name) => headers.set(name, value));
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const [users, patients, personas] = await Promise.all([
    client.from("mock_users").select("id,display_name,email,is_mock").eq("is_mock", true).order("id"),
    client.from("mock_patients").select("id,assigned_doctor_id,sample_ssn,dob,blood_type,allergies,status,diagnoses,prescriptions,completed_at,is_mock,finding_reviews,messages,doctor_statuses").eq("is_mock", true).order("id"),
    client.from("mock_personas").select("user_id,persona,is_mock").eq("is_mock", true).order("user_id"),
  ]);
  if (users.error || patients.error || personas.error) {
    console.error("Mock directory read failed", users.error?.code ?? patients.error?.code ?? personas.error?.code);
    throw new Error("Could not load saved sample users. Please try again.");
  }
  return {
    users: z.array(mockUserSchema).parse(users.data),
    personas: z.array(mockPersonaSchema).parse(personas.data),
    patients: mapMockPatients(users.data, patients.data),
  };
}

export async function saveMockPatient(input: import("./mock-users").SavePatientInput) {
  const doctor = CLINICIANS.find((d) => d.id === input.doctorId);
  if (!doctor) throw new Error("Unknown sample doctor");
  const { mockPatientSchema } = await import("./mock-users");
  return updateSample(input.patientId, (row) => {
    const current = mockPatientSchema.parse(row);
    const own = (entry: { by: string }) => entry.by === doctor.name;
    const reviews = Object.fromEntries(Object.entries(current.finding_reviews).filter(([id]) => FINDING_DOCTORS[id] !== input.doctorId));
    for (const [id, review] of Object.entries(input.findingReviews)) if (FINDING_DOCTORS[id] === input.doctorId) reviews[id] = review;
    return {
      ...(input.doctorId === "d1" ? { status: input.status, completed_at: input.completedAt } : {}),
      doctor_statuses: { ...current.doctor_statuses, [input.doctorId]: { status: input.status, completedAt: input.completedAt } },
      diagnoses: [...input.diagnoses.filter(own).map((d) => ({ ...d, hospital: doctor.hospital })), ...current.diagnoses.filter((d) => !own(d))],
      prescriptions: [...input.prescriptions.filter(own).map((r) => ({ ...r, hospital: doctor.hospital })), ...current.prescriptions.filter((r) => !own(r))],
      finding_reviews: reviews,
    };
  });
}


async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

type PatientRow = Database["public"]["Tables"]["mock_patients"]["Row"];
type PatientUpdate = Database["public"]["Tables"]["mock_patients"]["Update"];

// Optimistic row locking keeps simultaneous hospital updates and chat appends intact.
async function updateSample(patientId: string, change: (row: PatientRow) => PatientUpdate) {
  const db = await admin();
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await db.from("mock_patients").select("*").eq("id", patientId).eq("is_mock", true).single();
    if (error) throw new Error("Could not load the sample record.");
    const { data: saved, error: saveError } = await db.from("mock_patients").update({ ...change(data), revision: data.revision + 1 }).eq("id", patientId).eq("is_mock", true).eq("revision", data.revision).select("id");
    if (saveError) throw new Error("Could not save the change. Please try again.");
    if (saved?.length) return { ok: true };
  }
  throw new Error("Record is busy. Please try again.");
}

export async function readMockThreads() {
  const { patients } = await readMockDirectory();
  return Object.fromEntries(patients.map((p) => [p.id, p.messages ?? []]));
}

export async function appendMockMessage(input: import("./mock-users").SendMessageInput) {
  const { messageSchema } = await import("./mock-users");
  return updateSample(input.patientId, (row) => {
    const existing = z.array(messageSchema).parse(row.messages ?? []);
    if (existing.some((m) => m.id === input.message.id)) return {};
    if (existing.length >= 2000) throw new Error("This sample conversation is full.");
    return { messages: [...existing, { ...input.message, read: false }] };
  });
}

export async function markMockThreadRead(input: z.infer<typeof import("./mock-users").markReadSchema>) {
  const doctor = CLINICIANS.find((d) => d.id === input.doctorId);
  if (!doctor) throw new Error("Unknown sample doctor");
  const { messageSchema } = await import("./mock-users");
  return updateSample(input.patientId, (row) => ({ messages: z.array(messageSchema).parse(row.messages ?? []).map((m) => m.doctor === doctor.name && m.from !== input.viewer ? { ...m, read: true } : m) }));
}
