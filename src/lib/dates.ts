const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
/** Today's date from the device clock, as YYYY-MM-DD in local time. */
export const today = () => toISO(new Date());
export const addDays = (s: string, n: number) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); };
export const daysBetween = (a: string, b: string) => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 864e5);

/** 30 Sep 2026 */
export const fD = (s: string) => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return `${d} ${MO[m - 1]} ${y}`; };
/** 08:00 AM */
export const fT = (t: string) => {
  if (!t) return '';
  const [h0, m] = t.split(':').map(Number);
  const h = h0 % 12 || 12;
  return `${pad(h)}:${pad(m)} ${h0 >= 12 ? 'PM' : 'AM'}`;
};
export const timeToDate = (t: string) => { const [h, m] = t.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); return d; };
export const dateToTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
/** One decimal place, e.g. 18.0 */
export const f1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
export const num = (s: string) => parseFloat(s.replace(',', '.'));
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
