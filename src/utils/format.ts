export const TYPES = [
  'JCB', 'POKLAIN', 'HYWA', 'GRADER', 'ROLLER', 'HYDRA', 'TRACTOR', 'PAVER',
  'WATER TANKER', 'D GENERATOR', 'CAMPER', 'TRANSIT MIXER', 'OTHER VEHICLES',
];
const HRS = new Set(['JCB', 'POKLAIN', 'GRADER', 'ROLLER', 'HYDRA', 'PAVER', 'D GENERATOR']);
const ABBR: Record<string, string> = {
  'WATER TANKER': 'WT', 'D GENERATOR': 'DG', 'TRANSIT MIXER': 'TM',
  'OTHER VEHICLES': 'OV', CAMPER: 'CP', HYDRA: 'HY',
};
export const ab = (t: string) => ABBR[t] || t.slice(0, 3);
export const unit = (t: string) => (HRS.has(t) ? 'Hrs' : 'Kms');

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2026-09-12" -> "12 Sep 2026" */
export const fD = (d?: string) => {
  if (!d) return '';
  const [y, m, x] = d.split('-');
  return `${+x} ${MO[+m - 1]} ${y}`;
};
/** "18:05" -> "06:05 PM" */
export const fT = (t?: string) => {
  if (!t) return '';
  let [h, m] = t.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
};
/** local date -> "YYYY-MM-DD" */
export const ld = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => ld(new Date());
export const f1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

export const dateFromStr = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const timeFromStr = (s: string) => {
  const [h, m] = s.split(':').map(Number);
  return new Date(2000, 0, 1, h, m);
};
export const strFromTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
