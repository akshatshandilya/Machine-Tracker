import * as XLSX from 'xlsx';

/** One reading row found in the workbook (times are not in the source; the app applies defaults). */
export interface ParsedReading {
  date: string; // YYYY-MM-DD
  sr: number | string; // number, text as written (e.g. "Working") or ''
  er: number | string;
  fuel: number | null;
}
export interface ParsedMachine {
  key: string;
  type: string; // one of the app's machinery types
  vt: string; // vehicle type text from the heading
  no: string;
  owner: string;
  readings: ParsedReading[];
}
export interface ParseResult {
  machines: ParsedMachine[];
  skipped: { range: number; repeated: number; badFuel: number };
  sheets: number;
}

const PLATE = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{3,4}$/;
const norm = (s: unknown) => String(s ?? '').trim().toUpperCase();
const alnum = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Same key for sheet headings and for machines already in the app. */
export function machineKey(no: string, owner: string): string {
  const a = alnum(no);
  return PLATE.test(a) || /^\d{4}$/.test(a) ? a : 'NP:' + a + alnum(owner);
}
const prettyPlate = (a: string) => {
  const m = a.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{3,4})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : a;
};

export function typeFromHeading(first: string): string {
  const t = first.toUpperCase();
  if (/POCLAIN|POCAIN|POKLAIN|PROKLAIN/.test(t)) return 'POKLAIN';
  if (/\bJCB\b/.test(t)) return 'JCB';
  if (/HYWA/.test(t)) return 'HYWA';
  if (/GRADER/.test(t)) return 'GRADER';
  if (/ROLLER/.test(t)) return 'ROLLER';
  if (/HYDRA/.test(t)) return 'HYDRA';
  if (/^TRACTOR/.test(t)) return 'TRACTOR';
  if (/PAVER/.test(t)) return 'PAVER';
  if (/WATER TANKER/.test(t)) return 'WATER TANKER';
  if (/^DG$|GENERATOR/.test(t)) return 'D GENERATOR';
  if (/CAMPER/.test(t)) return 'CAMPER';
  if (/^TM$|T MIXER|TRANSIT|RMC TM/.test(t)) return 'TRANSIT MIXER';
  return 'OTHER VEHICLES';
}

/** "JCB - MH15AG5396 - Dapse" -> type / vehicle no. / owner. Headings without a number keep their text as the identifier. */
export function parseHeading(raw: string, ownerExtra = ''): Omit<ParsedMachine, 'readings'> {
  const tokens = raw.split('-').map((t) => t.trim()).filter(Boolean);
  const first = tokens[0] ?? raw.trim();
  const type = typeFromHeading(first);
  let plateIdx = -1;
  for (let i = 1; i < tokens.length; i++) {
    const a = alnum(tokens[i]);
    if (PLATE.test(a) || /^\d{4}$/.test(a)) { plateIdx = i; break; }
  }
  let no: string;
  let owner: string;
  if (plateIdx >= 0) {
    no = prettyPlate(alnum(tokens[plateIdx]));
    owner = tokens.filter((_, i) => i !== 0 && i !== plateIdx).join(' - ');
  } else {
    no = tokens.join(' - ');
    owner = tokens.slice(1).join(' - ');
  }
  if (ownerExtra) owner = owner ? owner + ' - ' + ownerExtra : ownerExtra;
  return { key: machineKey(no, owner), type, vt: first, no, owner };
}

const cell = (v: unknown): number | string => {
  if (typeof v === 'number') return isFinite(v) ? v : '';
  if (typeof v === 'string') {
    const t = v.trim();
    return t.startsWith('#') ? '' : t;
  }
  return '';
};

const MON: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
export function toIsoDate(v: unknown): string | null {
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 864e5);
    return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  if (v instanceof Date && !isNaN(v.getTime())) return iso(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === 'string') {
    const s = v.trim();
    let m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (m) return iso(+m[3], +m[2], +m[1]);
    m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*\.?,?\s+(\d{4})$/);
    if (m && MON[m[2].toLowerCase()]) return iso(+m[3], MON[m[2].toLowerCase()], +m[1]);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return iso(+m[1], +m[2], +m[3]);
  }
  return null;
}

/** Fuel cells: a number, or typed sums such as "50+50" (added up). null = nothing / not a number. */
export function parseFuel(v: unknown): number | null | 'bad' {
  if (typeof v === 'number') return v > 0 && isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  const parts = t.split('+').map((p) => p.trim());
  let sum = 0;
  for (const p of parts) {
    const n = Number(p);
    if (!p || !isFinite(n)) return 'bad';
    sum += n;
  }
  return sum > 0 ? Math.round(sum * 100) / 100 : null;
}

const UNITS = new Set(['HOURS', 'HRS', 'KMS', 'KM']);
const FUELS = new Set(['DIESEL', 'PETROL']);

interface Block { heading: string; ownerExtra: string; s: number; c: number; f: number }

function findBlocks(hdr: unknown[], sub: unknown[]): Block[] {
  const blocks: Block[] = [];
  const used = new Set<number>();
  for (let j = 1; j < sub.length; j++) {
    if (used.has(j)) continue;
    const s = norm(sub[j]);
    const heading = String(hdr[j] ?? '').trim();
    if (s === 'START' && norm(sub[j + 1]) === 'CLOSE') {
      let f = -1;
      for (const k of [j + 2, j + 3]) {
        // a column with its own heading belongs to another machine, not to this block
        if (FUELS.has(norm(sub[k])) && !String(hdr[k] ?? '').trim()) { f = k; break; }
        if (k === j + 2 && !UNITS.has(norm(sub[k]))) break;
      }
      for (let k = j; k <= (f >= 0 ? f : j + 2); k++) used.add(k);
      if (heading) blocks.push({ heading, ownerExtra: '', s: j, c: j + 1, f });
    } else if (heading && FUELS.has(s)) {
      used.add(j);
      blocks.push({ heading, ownerExtra: '', s: -1, c: -1, f: j });
    } else if (heading && s && !UNITS.has(s) && s !== 'START' && s !== 'CLOSE') {
      // fuel-only column whose sub-heading is a driver / person name
      used.add(j);
      blocks.push({ heading, ownerExtra: String(sub[j]).trim(), s: -1, c: -1, f: j });
    }
  }
  return blocks;
}

export function parseWorkbook(data: ArrayBuffer | Uint8Array): ParseResult {
  const wb = XLSX.read(data, { type: 'array', dense: true, cellFormula: false, cellStyles: false, cellHTML: false, cellText: false });
  const map = new Map<string, ParsedMachine>();
  const seen = new Map<string, Set<string>>();
  const skipped = { range: 0, repeated: 0, badFuel: 0 };
  let sheets = 0;

  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], { header: 1, raw: true, defval: null });
    let h = -1;
    for (let i = 0; i < Math.min(rows.length, 12); i++) if (norm(rows[i]?.[0]) === 'DATE') { h = i; break; }
    if (h < 0 || h + 1 >= rows.length) continue;
    const blocks = findBlocks(rows[h], rows[h + 1]);
    if (!blocks.length) continue;
    sheets++;

    for (const b of blocks) {
      const info = parseHeading(b.heading, b.ownerExtra);
      let m = map.get(info.key);
      if (!m) { m = { ...info, readings: [] }; map.set(info.key, m); seen.set(info.key, new Set()); }
      const got = seen.get(info.key)!;
      for (let i = h + 2; i < rows.length; i++) {
        const r = rows[i];
        if (!r) continue;
        const date = toIsoDate(r[0]);
        if (!date) continue;
        let sr = b.s >= 0 ? cell(r[b.s]) : '';
        const er = b.c >= 0 ? cell(r[b.c]) : '';
        let fuel: number | null = null;
        if (b.f >= 0) {
          const f = parseFuel(r[b.f]);
          if (f === 'bad') {
            // person-named columns (tractors) hold daily status words such as "Working": show them as the Start text
            if (b.ownerExtra && sr === '') sr = cell(r[b.f]);
            else skipped.badFuel++;
          } else fuel = f;
        }
        if (sr === '' && er === '' && fuel === null) continue;
        if (sr === 0 && er === 0 && fuel === null) continue;
        if (typeof sr === 'number' && typeof er === 'number' && er < sr) { skipped.range++; continue; }
        if (got.has(date)) { skipped.repeated++; continue; }
        got.add(date);
        m.readings.push({ date, sr, er, fuel });
      }
    }
  }
  const machines = [...map.values()].filter((m) => m.readings.length);
  return { machines, skipped, sheets };
}
