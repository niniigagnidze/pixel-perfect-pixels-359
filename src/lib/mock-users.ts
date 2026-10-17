import { z } from "zod";
import type { DoctorPatient } from "./demo-store";

const text = (max: number) => z.string().max(max);
export const diagnosisSchema = z.object({ name: text(200), note: text(2000), date: text(40), by: text(120) });
export const prescriptionSchema = z.object({ name: text(200), dose: text(300), date: text(40), by: text(120) });
export const findingReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  doctorNote: text(4000).optional(),
  plan: z.enum(["No visit needed", "Book follow-up visit", "Order more tests"]).optional(),
  reviewedAt: text(40).optional(),
  aiSuggestion: text(8000).optional(),
});
export const messageSchema = z.object({
  id: text(64), from: z.enum(["patient", "doctor"]), doctor: text(120), text: text(4000),
  time: text(40), urgent: z.boolean().optional(), read: z.boolean().optional(),
});
export const patientIdSchema = z.enum(["p1", "p2", "p3", "p4"]);

export const savePatientSchema = z.object({
  patientId: patientIdSchema,
  status: z.enum(["pending", "done"]),
  completedAt: text(40).nullable(),
  diagnoses: z.array(diagnosisSchema).max(200),
  prescriptions: z.array(prescriptionSchema).max(200),
  findingReviews: z.record(text(16), findingReviewSchema),
  messages: z.array(messageSchema).max(500).nullable(),
});
export type SavePatientInput = z.infer<typeof savePatientSchema>;

export const mockUserSchema = z.object({
  id: z.string(), display_name: z.string(), email: z.string().endsWith("@example.invalid"), is_mock: z.literal(true),
});
export const mockPatientSchema = z.object({
  id: patientIdSchema, assigned_doctor_id: z.string(),
  sample_ssn: z.string(), dob: z.string(), blood_type: z.string(),
  allergies: z.array(z.string()), status: z.enum(["pending", "done"]),
  diagnoses: z.array(diagnosisSchema), prescriptions: z.array(prescriptionSchema),
  completed_at: z.string().nullable(), is_mock: z.literal(true),
  finding_reviews: z.record(z.string(), findingReviewSchema).optional().default({}),
  messages: z.array(messageSchema).nullable().optional().default(null),
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
      findingReviews: p.finding_reviews,
      messages: p.messages ?? undefined,
    };
  });
}
