import * as XLSX from 'xlsx';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Machine, Reading } from '../types';
import { addDays, fD, fT } from './dates';

type Cell = string | number | null;

/** Every date from `from` to `to` (oldest first). Days without a reading keep only the date. */
export function buildRows(m: Machine, all: Reading[], from: string, to: string): Cell[][] | null {
  const by = new Map<string, Reading[]>();
  all.filter((r) => r.date >= from && r.date <= to)
    .sort((a, b) => a.updatedAt - b.updatedAt)
    .forEach((r) => by.set(r.date, [...(by.get(r.date) ?? []), r]));
  if (!by.size) return null;
  const body: Cell[][] = [];
  for (let d = from, i = 0; d <= to && i < 3700; d = addDays(d, 1), i++) {
    const rs = by.get(d);
    if (!rs) { body.push([fD(d)]); continue; }
    rs.forEach((r) => body.push([fD(d), r.startReading, fT(r.startTime), r.endReading, fT(r.endTime), Math.round((r.endReading - r.startReading) * 10) / 10]));
  }
  return [
    ['Vehicle Type', m.vehicleType], ['Vehicle Number', m.vehicleNo], ["Owner's Name", m.owner], [],
    ['Date', 'Start Reading', 'Start Time', 'End Reading', 'End Time', 'Total Utilisation'],
    ...body,
  ];
}

export const sheetName = (no: string) => no.replace(/[\s:\\/?*[\]]/g, '').slice(0, 31) || 'Sheet1';

/** Builds the workbook and opens the share sheet. Returns false when there is nothing to export. */
export async function exportReadings(m: Machine, all: Reading[], from: string, to: string): Promise<boolean> {
  const rows = buildRows(m, all, from, to);
  if (!rows) return false;
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName(m.vehicleNo));
  const bytes = new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }));
  const name = `${m.type} ${m.vehicleNo || 'machine'} readings.xlsx`.replace(/[^\w.-]+/g, '_');
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Export readings',
    UTI: 'org.openxmlformats.spreadsheetml.sheet',
  });
  return true;
}
