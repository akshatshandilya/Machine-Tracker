import * as SQLite from 'expo-sqlite';
import { Machine, Project, Reading } from '../types';

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, vehicle_type TEXT NOT NULL DEFAULT '', vehicle_no TEXT NOT NULL DEFAULT '', owner TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '', end_date TEXT NOT NULL DEFAULT '', inactive INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS usage_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS readings (
  id TEXT PRIMARY KEY NOT NULL,
  machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  date TEXT NOT NULL, start_reading REAL NOT NULL, start_time TEXT NOT NULL, end_reading REAL NOT NULL, end_time TEXT NOT NULL,
  total REAL NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_machines_project ON machines(project_id);
CREATE INDEX IF NOT EXISTS idx_readings_machine ON readings(machine_id, date);
CREATE INDEX IF NOT EXISTS idx_periods_machine ON usage_periods(machine_id);
`;

let opened: Promise<SQLite.SQLiteDatabase> | null = null;
const open = async () => { const d = await SQLite.openDatabaseAsync('machine-tracker.db'); await d.execAsync(SCHEMA); return d; };
const db = () => (opened ??= open());

type Row = Record<string, any>;

export async function loadAll() {
  const d = await db();
  const periods = new Map<string, { start: string; end: string }[]>();
  for (const p of await d.getAllAsync<Row>('SELECT * FROM usage_periods ORDER BY seq')) {
    periods.set(p.machine_id, [...(periods.get(p.machine_id) ?? []), { start: p.start_date, end: p.end_date }]);
  }
  const projects: Project[] = (await d.getAllAsync<Row>('SELECT * FROM projects ORDER BY created_at DESC'))
    .map((r) => ({ id: r.id, name: r.name, createdAt: r.created_at }));
  const machines: Machine[] = (await d.getAllAsync<Row>('SELECT * FROM machines ORDER BY created_at')).map((r) => ({
    id: r.id, projectId: r.project_id, type: r.type, vehicleType: r.vehicle_type, vehicleNo: r.vehicle_no, owner: r.owner,
    startDate: r.start_date, endDate: r.end_date, inactive: !!r.inactive, history: periods.get(r.id) ?? [],
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
  const readings: Reading[] = (await d.getAllAsync<Row>('SELECT * FROM readings')).map((r) => ({
    id: r.id, machineId: r.machine_id, date: r.date, startReading: r.start_reading, startTime: r.start_time,
    endReading: r.end_reading, endTime: r.end_time, total: r.total, createdAt: r.created_at, updatedAt: r.updated_at,
  }));
  const theme = (await d.getFirstAsync<Row>("SELECT value FROM settings WHERE key='theme'"))?.value ?? null;
  return { projects, machines, readings, theme };
}

export async function insertProject(p: Project) {
  await (await db()).runAsync('INSERT INTO projects (id, name, created_at) VALUES (?, ?, ?)', p.id, p.name, p.createdAt);
}
export async function deleteProject(id: string) {
  await (await db()).runAsync('DELETE FROM projects WHERE id = ?', id); // machines, periods and readings cascade
}

export async function saveMachine(m: Machine) {
  const d = await db();
  await d.withTransactionAsync(async () => {
    await d.runAsync(
      `INSERT INTO machines (id, project_id, type, vehicle_type, vehicle_no, owner, start_date, end_date, inactive, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET vehicle_type=excluded.vehicle_type, vehicle_no=excluded.vehicle_no, owner=excluded.owner,
         start_date=excluded.start_date, end_date=excluded.end_date, inactive=excluded.inactive, updated_at=excluded.updated_at`,
      m.id, m.projectId, m.type, m.vehicleType, m.vehicleNo, m.owner, m.startDate, m.endDate, m.inactive ? 1 : 0, m.createdAt, m.updatedAt);
    await d.runAsync('DELETE FROM usage_periods WHERE machine_id = ?', m.id);
    for (let i = 0; i < m.history.length; i++) {
      await d.runAsync('INSERT INTO usage_periods (machine_id, seq, start_date, end_date) VALUES (?, ?, ?, ?)', m.id, i, m.history[i].start, m.history[i].end);
    }
  });
}
export async function deleteMachine(id: string) {
  await (await db()).runAsync('DELETE FROM machines WHERE id = ?', id);
}

export async function saveReading(r: Reading) {
  await (await db()).runAsync(
    `INSERT INTO readings (id, machine_id, date, start_reading, start_time, end_reading, end_time, total, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET date=excluded.date, start_reading=excluded.start_reading, start_time=excluded.start_time,
       end_reading=excluded.end_reading, end_time=excluded.end_time, total=excluded.total, updated_at=excluded.updated_at`,
    r.id, r.machineId, r.date, r.startReading, r.startTime, r.endReading, r.endTime, r.total, r.createdAt, r.updatedAt);
}
export async function deleteReading(id: string) {
  await (await db()).runAsync('DELETE FROM readings WHERE id = ?', id);
}

export async function setSetting(key: string, value: string) {
  await (await db()).runAsync('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, value);
}
