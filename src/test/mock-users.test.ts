import { describe, expect, it } from "vitest";
import { mapMockPatients, mockUserSchema, mockPatientSchema } from "@/lib/mock-users";

const users = [{ id: "p1", display_name: "Ana Beridze", email: "ana@example.invalid", is_mock: true }];
const patient = {
  id: "p1", assigned_doctor_id: "d1", sample_ssn: "01024056789", dob: "14 Mar 1979",
  blood_type: "A+", allergies: ["Penicillin (severe)", "Pollen"], status: "pending",
  diagnoses: [], prescriptions: [], completed_at: null, is_mock: true,
};

describe("Saved mock users", () => {
  it("preserves SSN search identity in the doctor list", () => {
    expect(mapMockPatients(users, [patient])[0]).toMatchObject({ id: "p1", name: "Ana Beridze", ssn: "01024056789", status: "pending" });
  });
  it("loads patients from other hospital doctors into the shared record", () => {
    expect(mapMockPatients(users, [{ ...patient, assigned_doctor_id: "d2" }])[0]?.id).toBe("p1");
  });
  it("preserves the Done queue and completion time", () => {
    expect(mapMockPatients(users, [{ ...patient, status: "done", completed_at: "11 Oct 2026, 10:10" }])[0]).toMatchObject({ status: "done", completedAt: "11 Oct 2026, 10:10" });
  });
  it("rejects non-mock user identities", () => {
    expect(mockUserSchema.safeParse({ ...users[0], is_mock: false }).success).toBe(false);
  });
  it("rejects non-mock patient records", () => {
    expect(mockPatientSchema.safeParse({ ...patient, is_mock: false }).success).toBe(false);
  });
  it("rejects a deliverable email address", () => {
    expect(mockUserSchema.safeParse({ ...users[0], email: "ana@example.com" }).success).toBe(false);
  });
});