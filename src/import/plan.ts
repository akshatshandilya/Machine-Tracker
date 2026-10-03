import { Machine, Reading } from '../data/types';
import { saveDetails } from '../data/logic';
import { uid } from '../utils/format';
import { machineKey, ParsedMachine } from './parse';

/** The source sheet has no clock times, so imported readings get the app's usual working day. */
export const DEFAULT_START_TIME = '08:00';
export const DEFAULT_END_TIME = '18:00';

export interface Plan {
  machines: Machine[]; // brand-new machines to create
  readings: Reading[];
  removeIds: string[]; // existing readings replaced
  skippedExisting: number; // dates that already had a reading (kept as they were)
  newMachines: number;
}

export function buildPlan(
  parsed: ParsedMachine[],
  selected: Set<string>,
  pid: string,
  existing: Machine[],
  existingReadings: Reading[],
  replace: boolean,
): Plan {
  const plan: Plan = { machines: [], readings: [], removeIds: [], skippedExisting: 0, newMachines: 0 };
  const now = Date.now();
  let n = 0;
  for (const p of parsed) {
    if (!selected.has(p.key)) continue;
    let mid: string;
    const ex = existing.find((m) => machineKey(m.no, m.owner) === p.key);
    const byDate = new Map<string, Reading>();
    if (ex) {
      mid = ex.id;
      existingReadings.filter((r) => r.mid === ex.id).forEach((r) => byDate.set(r.date, r));
    } else {
      mid = uid();
      const sd = p.readings.reduce((a, r) => (r.date < a ? r.date : a), p.readings[0].date);
      const base: Machine = { id: mid, pid, type: p.type, vt: p.vt, no: p.no, owner: p.owner, sd, ed: '', cAt: now + plan.newMachines };
      plan.machines.push(saveDetails(base, { vt: p.vt, no: p.no, owner: p.owner, sd, ed: '' }));
      plan.newMachines++;
    }
    for (const r of p.readings) {
      const dup = byDate.get(r.date);
      if (dup) {
        if (!replace) { plan.skippedExisting++; continue; }
        plan.removeIds.push(dup.id);
      }
      plan.readings.push({
        id: uid() + (n++).toString(36),
        mid,
        date: r.date,
        sr: r.sr,
        st: DEFAULT_START_TIME,
        er: r.er,
        et: DEFAULT_END_TIME,
        fuel: r.fuel,
        uAt: now + n,
      });
    }
  }
  return plan;
}
