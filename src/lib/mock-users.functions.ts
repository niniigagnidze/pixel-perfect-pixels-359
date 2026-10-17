import { createServerFn } from "@tanstack/react-start";
import { readMockDirectory, saveMockPatient } from "./mock-users.server";
import { savePatientSchema } from "./mock-users";

// Public read only: these tables contain fixed fictional fixtures, not clinical accounts.
export const getMockDirectory = createServerFn({ method: "GET" }).handler(() => readMockDirectory());

// Demo write: only the four fixed fictional sample patients, strictly validated and size-capped.
export const saveMockPatientRecord = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => savePatientSchema.parse(data))
  .handler(({ data }) => saveMockPatient(data));
