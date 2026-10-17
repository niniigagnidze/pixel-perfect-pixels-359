import { createServerFn } from "@tanstack/react-start";
import { appendMockMessage, markMockThreadRead, readMockDirectory, readMockThreads, saveMockPatient } from "./mock-users.server";
import { markReadSchema, savePatientSchema, sendMessageSchema } from "./mock-users";

// Public read only: these tables contain fixed fictional fixtures, not clinical accounts.
export const getMockDirectory = createServerFn({ method: "GET" }).handler(() => readMockDirectory());

// Demo write: only the four fixed fictional sample patients, strictly validated and size-capped.
export const saveMockPatientRecord = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => savePatientSchema.parse(data))
  .handler(({ data }) => saveMockPatient(data));


// Demo chat between sample doctor and sample patients: append-only, validated, fixed patient IDs.
export const getMockThreads = createServerFn({ method: "GET" }).handler(() => readMockThreads());
export const sendMockMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => sendMessageSchema.parse(data))
  .handler(({ data }) => appendMockMessage(data));
export const markMockRead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => markReadSchema.parse(data))
  .handler(({ data }) => markMockThreadRead(data));
