import { createServerFn } from "@tanstack/react-start";
import { readMockDirectory } from "./mock-users.server";

// Public read only: these tables contain fixed fictional fixtures, not clinical accounts.
export const getMockDirectory = createServerFn({ method: "GET" }).handler(() => readMockDirectory());