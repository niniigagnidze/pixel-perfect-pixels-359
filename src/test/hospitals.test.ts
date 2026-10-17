import { describe, expect, it } from "vitest";
import { buildTimeline, careStatus, CLINICIANS, conversation, hospitalOf } from "@/lib/hospitals";

describe("Multi-hospital record", () => {
  it("keeps messages isolated for each of the three doctors", () => {
    const messages = CLINICIANS.flatMap((d) => [{ doctor: d.name, from: "patient", text: d.id }, { doctor: d.name, from: "doctor", text: `reply-${d.id}` }]);
    for (const d of CLINICIANS) expect(conversation(messages, d.name).map((m) => m.text)).toEqual([d.id, `reply-${d.id}`]);
  });
  it("completing care at one hospital does not complete another doctor's queue", () => {
    const patient = { status: "done" as const, doctorStatuses: { d2: { status: "done" as const } } };
    expect(careStatus(patient, "d1").status).toBe("done");
    expect(careStatus(patient, "d2").status).toBe("done");
    expect(careStatus(patient, "d3").status).toBe("pending");
  });
  it("labels legacy entries with the author's hospital", () => {
    expect(hospitalOf("Dr. Nika Tsiklauri")).toBe("Tbilisi Central Hospital");
  });
  it("keeps an explicitly saved hospital", () => {
    expect(hospitalOf("Dr. Giorgi Kapanadze", "Batumi Heart Center")).toBe("Batumi Heart Center");
  });
  it("merges every hospital's entries newest first", () => {
    const t = buildTimeline({
      diagnoses: [{ name: "A", note: "", date: "12 Feb 2026", by: "Dr. Giorgi Kapanadze" }],
      prescriptions: [{ name: "B", dose: "", date: "20 Oct 2026", by: "Dr. Mariam Lomidze" }],
      results: [{ study: "C", note: "", date: "14 Oct 2026, 16:20", doctor: "Dr. Nika Tsiklauri", hospital: "Tbilisi Central Hospital" }],
    });
    expect(t.map((x) => [x.title, x.hospital])).toEqual([["B", "Batumi Heart Center"], ["C", "Tbilisi Central Hospital"], ["A", "Vake Family Clinic"]]);
  });
});
