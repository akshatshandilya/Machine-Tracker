import { DetailsInput, Machine, Reading } from '../types';
import { today } from './dates';

export const TYPES = [
  'JCB', 'POKLAIN', 'HYWA', 'GRADER', 'ROLLER', 'HYDRA', 'TRACTOR', 'PAVER',
  'WATER TANKER', 'D GENERATOR', 'CAMPER', 'TRANSIT MIXER', 'OTHER VEHICLES',
];

const HOURLY = new Set(['JCB', 'POKLAIN', 'GRADER', 'ROLLER', 'HYDRA', 'PAVER', 'D GENERATOR']);
const ABBR: Record<string, string> = {
  'WATER TANKER': 'WT', 'D GENERATOR': 'DG', 'TRANSIT MIXER': 'TM', 'OTHER VEHICLES': 'OV', CAMPER: 'CP', HYDRA: 'HY',
};

export const abbr = (t: string) => ABBR[t] ?? t.slice(0, 3);
export const unitOf = (t: string) => (HOURLY.has(t) ? 'Hrs' : 'Kms');
export const hasDetails = (m: Machine) => !!(m.vehicleNo || m.owner);
/** Active unless marked inactive, or its End Date has passed. */
export const isActive = (m: Machine) => !m.inactive && !(m.endDate && m.endDate < today());
export const firstStart = (m: Machine) => m.history[0]?.start || m.startDate || today();

/** Latest date first; same date -> most recently updated first. */
export const sortReadings = (rs: Reading[]) =>
  [...rs].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt);

/** Most recent reading on or before `date` (used to carry the End Reading forward). */
export const prevEnd = (rs: Reading[], date: string, skipId?: string) =>
  rs.filter((x) => x.date <= date && x.id !== skipId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt)[0];

/** Save machine details; keeps the usage-history log in sync with the current period. */
export function applyDetails(m: Machine, v: DetailsInput, now = today()): Machine {
  const history = m.history.map((h) => ({ ...h }));
  const next: Machine = { ...m, ...v, vehicleNo: v.vehicleNo.toUpperCase() };
  if (next.inactive && !next.endDate) next.endDate = now;
  if (!history.length) history.push({ start: next.startDate, end: next.endDate });
  else { const l = history[history.length - 1]; l.start = next.startDate; l.end = next.endDate; }
  return { ...next, history };
}

/** Mark as Inactive (end today if no end date) or Active (start a new period today). */
export function applyToggle(m: Machine, now = today()): Machine {
  const history = m.history.map((h) => ({ ...h }));
  const last = history[history.length - 1];
  if (isActive(m)) {
    const next: Machine = { ...m, inactive: true };
    if (!next.endDate) { next.endDate = now; if (last) last.end = now; }
    return { ...next, history };
  }
  if (last && (!last.end || last.end > now)) last.end = now;
  history.push({ start: now, end: '' });
  return { ...m, inactive: false, startDate: now, endDate: '', history };
}
