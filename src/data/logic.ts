import { DB, Machine, MachineForm, Period, Reading } from './types';
import { today, uid } from '../utils/format';

export const hasD = (m: Machine) => !!(m.no || m.owner);
export const isActive = (m: Machine) => !m.inactive && !(m.ed && m.ed < today());

/** Usage periods (lazily derived for machines saved before history existed). */
export const getHist = (m: Machine): Period[] =>
  m.hist ?? (hasD(m) ? [{ id: uid(), s: m.sd, e: m.ed }] : []);

export const firstStart = (m: Machine) => {
  const h = getHist(m);
  return (h[0] && h[0].s) || m.sd || today();
};

export function saveDetails(m: Machine, v: MachineForm): Machine {
  const h = getHist(m).map((p) => ({ ...p }));
  const n: Machine = { ...m, ...v };
  if (n.inactive && !n.ed) n.ed = today();
  if (!h.length) h.push({ id: uid(), s: n.sd, e: n.ed });
  else {
    const l = h[h.length - 1];
    l.s = n.sd;
    l.e = n.ed;
  }
  n.hist = h;
  return n;
}

/** Saves the form then flips Active/Inactive. Returns machine + toast text. */
export function toggleStatus(m: Machine, v: MachineForm): { machine: Machine; toast: string } {
  const n = saveDetails(m, v);
  const h = n.hist!.map((p) => ({ ...p }));
  const l = h[h.length - 1];
  const t = today();
  let msg: string;
  if (isActive(n)) {
    n.inactive = true;
    if (!n.ed) {
      n.ed = t;
      l.e = t;
    }
    msg = 'Machine marked as inactive';
  } else {
    n.inactive = false;
    if (!l.e || l.e > t) l.e = t;
    h.push({ id: uid(), s: t, e: '' });
    n.sd = t;
    n.ed = '';
    msg = 'Machine marked as active';
  }
  n.hist = h;
  return { machine: n, toast: msg };
}

/** Readings of one machine, newest date first, then most recently updated. */
export const sortedReadings = (db: DB, mid: string): Reading[] =>
  db.readings
    .filter((r) => r.mid === mid)
    .sort((a, b) => b.date.localeCompare(a.date) || b.uAt - a.uAt);

export const isNum = (v: unknown): v is number => typeof v === 'number' && isFinite(v);
/** strict number parse for form input; null when empty or not a number */
export const toNum = (s: string): number | null => {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return isFinite(n) ? n : null;
};

export const prevEnd = (db: DB, mid: string, date: string, skip?: string): Reading | undefined =>
  db.readings
    .filter((x) => x.mid === mid && x.date <= date && x.id !== skip && typeof x.er === 'number')
    .sort((a, b) => b.date.localeCompare(a.date) || b.uAt - a.uAt)[0];
