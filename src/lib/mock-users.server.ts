import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { mapMockPatients, mockUserSchema, mockPersonaSchema } from "./mock-users";

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
    client.from("mock_patients").select("id,assigned_doctor_id,sample_ssn,dob,blood_type,allergies,status,diagnoses,prescriptions,completed_at,is_mock,finding_reviews,messages").eq("is_mock", true).eq("assigned_doctor_id", "d1").order("id"),
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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("mock_patients")
    .update({
      status: input.status,
      completed_at: input.completedAt,
      diagnoses: input.diagnoses,
      prescriptions: input.prescriptions,
      finding_reviews: input.findingReviews,
      messages: input.messages,
    })
    .eq("id", input.patientId)
    .eq("is_mock", true);
  if (error) {
    console.error("Mock patient save failed", error.code);
    throw new Error("Could not save the change. Please try again.");
  }
  return { ok: true };
}
