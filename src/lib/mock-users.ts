import { z } from "zod";
import type { DoctorPatient } from "./demo-store";

const diagnosis = z.object({ name: z.string(), note: z.string(), date: z.string(), by: z.string() });
const prescription = z.object({ name: z.string(), dose: z.string(), date: z.string(), by: z.string() });
export const mockUserSchema = z.object({
  id: z.string(), display_name: z.string(), email: z.string().endsWith("@example.invalid"), is_mock: z.literal(true),
});
export const mockPatientSchema = z.object({
  id: z.enum(["p1", "p2", "p3", "p4"]), assigned_doctor_id: z.string(),
  sample_ssn: z.string(), dob: z.string(), blood_type: z.string(),
  allergies: z.array(z.string()), status: z.enum(["pending", "done"]),
  diagnoses: z.array(diagnosis), prescriptions: z.array(prescription),
  completed_at: z.string().nullable(), is_mock: z.literal(true),
});
export const mockPersonaSchema = z.object({
  user_id: z.string(), persona: z.enum(["patient", "doctor", "family"]), is_mock: z.literal(true),
});

export function mapMockPatients(usersInput: unknown, patientsInput: unknown): DoctorPatient[] {
  const users = z.array(mockUserSchema).parse(usersInput);
  const patients = z.array(mockPatientSchema).parse(patientsInput);
  return patients.filter((p) => p.assigned_doctor_id === "d1").map((p) => {
    const user = users.find((u) => u.id === p.id);
    if (!user) throw new Error("Sample patient identity missing");
    return {
      id: p.id, name: user.display_name, ssn: p.sample_ssn, dob: p.dob,
      bloodType: p.blood_type, allergies: p.allergies, status: p.status,
      diagnoses: p.diagnoses, prescriptions: p.prescriptions,
      completedAt: p.completed_at ?? undefined,
    };
  });
}