import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DB, Machine } from '../data/types';
import { firstStart, sortedReadings } from '../data/logic';
import { fD, fT, ld, today } from './format';
import { Reading } from '../data/types';

/**
 * Same workbook layout as the approved preview: machine info, blank row, header row,
 * then one row per day in range (blank rows for days without a reading).
 */
export async function exportReadings(db: DB, m: Machine, from?: string, to?: string): Promise<'ok' | 'empty' | 'range' | 'nosharing' | 'cancelled'> {
  const f = from || firstStart(m);
  const t = to || today();
  if (f > t) return 'range';

  const by: Record<string, Reading[]> = {};
  sortedReadings(db, m.id)
    .filter((r) => r.date >= f && r.date <= t)
    .forEach((r) => (by[r.date] = by[r.date] || []).push(r));
  if (!Object.keys(by).length) return 'empty';

  const body: (string | number)[][] = [];
  const d = new Date(f + 'T12:00:00');
  const e = new Date(t + 'T12:00:00');
  for (let i = 0; d <= e && i < 3700; i++, d.setDate(d.getDate() + 1)) {
    const k = ld(d);
    const rs = by[k] ? by[k].slice().reverse() : [null];
    rs.forEach((r) =>
      body.push(r ? [fD(k), r.sr, fT(r.st), r.er, fT(r.et), typeof r.sr === 'number' && typeof r.er === 'number' ? Math.round((r.er - r.sr) * 10) / 10 : '', r.fuel ?? ''] : [fD(k)]),
    );
  }

  const rows = [
    ['Vehicle Type', m.vt],
    ['Vehicle Number', m.no],
    ["Owner's Name", m.owner],
    [],
    ['Date', 'Start Reading', 'Start Time', 'End Reading', 'End Time', 'Total Utilisation', 'Diesel/Petrol Quantity'],
    ...body,
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 22 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, m.no.replace(/[\s:\\/?*[\]]/g, '').slice(0, 31) || 'Sheet1');
  const buf: ArrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const name = `${m.type} ${m.no || 'machine'} readings.xlsx`.replace(/\s+/g, '_');
  if (Platform.OS === 'web') return saveOnWeb(name, buf);

  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(new Uint8Array(buf));

  if (!(await Sharing.isAvailableAsync())) return 'nosharing';
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Export to Excel',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
  });
  return 'ok';
}

/**
 * Web only (used by the HTML preview, never on Android): hands the file to the hosting page, which
 * offers it as a download; falls back to a plain browser download when opened standalone.
 */
function saveOnWeb(name: string, buf: ArrayBuffer): Promise<'ok' | 'nosharing' | 'cancelled'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = globalThis as any;
  if (w.parent && w.parent !== w) {
    return new Promise((resolve) => {
      const on = (e: { data?: { mtDownloadResult?: string } }) => {
        if (!e.data || !e.data.mtDownloadResult) return;
        w.removeEventListener('message', on);
        const r = e.data.mtDownloadResult;
        resolve(r === 'ok' ? 'ok' : r === 'declined' ? 'cancelled' : 'nosharing');
      };
      w.addEventListener('message', on);
      w.parent.postMessage({ mtDownload: true, filename: name, data: buf.slice(0) }, '*');
      setTimeout(() => { w.removeEventListener('message', on); resolve('nosharing'); }, 180000);
    });
  }
  const url = w.URL.createObjectURL(new w.Blob([buf]));
  const a = w.document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  return Promise.resolve('ok');
}
