import { describe, expect, it } from "vitest";
import { buildTimeline, hospitalOf } from "@/lib/hospitals";

describe("Multi-hospital record", () => {
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
