import { useDemo } from "@/lib/demo-store";
import { CLINICIANS } from "@/lib/hospitals";

export function DoctorSwitcher() {
  const { doctor, setDoctorId } = useDemo();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Working as</span>
      <select className="rounded-md border bg-card px-2 py-1" value={doctor.id} onChange={(e) => setDoctorId(e.target.value)}>
        {CLINICIANS.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.hospital}</option>)}
      </select>
    </label>
  );
}
