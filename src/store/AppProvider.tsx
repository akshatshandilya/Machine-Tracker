import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as db from '../db/database';
import { applyDetails, applyToggle } from '../lib/machinery';
import { uid } from '../lib/dates';
import { Colors, DARK, LIGHT, Mode } from '../theme';
import { DetailsInput, Machine, Project, Reading, ReadingInput } from '../types';

interface Toast { id: number; text: string }

interface AppCtx {
  ready: boolean; c: Colors; mode: Mode; toggleTheme: () => void;
  projects: Project[]; machines: Machine[]; readings: Reading[];
  splashing: boolean; endSplash: () => void;
  toast: (text: string) => void; toastMsg: Toast | null;
  addProject: (name: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  addMachine: (projectId: string, type: string) => Promise<boolean>;
  saveDetails: (id: string, v: DetailsInput) => Promise<boolean>;
  toggleActive: (id: string, v: DetailsInput) => Promise<boolean>;
  deleteMachine: (id: string) => Promise<boolean>;
  saveReading: (i: ReadingInput, id?: string) => Promise<boolean>;
  deleteReading: (id: string) => Promise<boolean>;
}

const Ctx = createContext<AppCtx>(null as unknown as AppCtx);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [ready, setReady] = useState(false);
  const [splashing, setSplashing] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [stored, setStored] = useState<Mode | null>(null);
  const [toastMsg, setToastMsg] = useState<Toast | null>(null);

  const toast = useCallback((text: string) => setToastMsg({ id: Date.now(), text }), []);

  useEffect(() => {
    db.loadAll()
      .then((d) => {
        setProjects(d.projects); setMachines(d.machines); setReadings(d.readings);
        if (d.theme === 'light' || d.theme === 'dark') setStored(d.theme);
      })
      .catch(() => toast('Something went wrong while loading your data. Please restart the app.'))
      .finally(() => setReady(true));
  }, [toast]);

  const mode: Mode = stored ?? (system === 'dark' ? 'dark' : 'light');

  const guard = async (fn: () => Promise<void>, error: string) => {
    try { await fn(); return true; } catch { toast(error); return false; }
  };

  const value: AppCtx = {
    ready, mode, c: mode === 'dark' ? DARK : LIGHT, projects, machines, readings, splashing, toast, toastMsg,
    endSplash: () => setSplashing(false),
    toggleTheme: () => {
      const next: Mode = mode === 'dark' ? 'light' : 'dark';
      setStored(next);
      db.setSetting('theme', next).catch(() => {});
    },
    addProject: (name) => guard(async () => {
      const p: Project = { id: uid(), name, createdAt: Date.now() };
      await db.insertProject(p);
      setProjects((x) => [p, ...x]);
    }, 'Something went wrong while saving the project. Please try again.'),
    deleteProject: (id) => guard(async () => {
      await db.deleteProject(id);
      const gone = new Set(machines.filter((m) => m.projectId === id).map((m) => m.id));
      setReadings((r) => r.filter((x) => !gone.has(x.machineId)));
      setMachines((m) => m.filter((x) => x.projectId !== id));
      setProjects((p) => p.filter((x) => x.id !== id));
    }, 'Something went wrong while deleting the project. Please try again.'),
    addMachine: (projectId, type) => guard(async () => {
      const now = Date.now();
      const m: Machine = {
        id: uid(), projectId, type, vehicleType: '', vehicleNo: '', owner: '', startDate: '', endDate: '',
        inactive: false, history: [], createdAt: now, updatedAt: now,
      };
      await db.saveMachine(m);
      setMachines((x) => [...x, m]);
    }, 'Something went wrong while saving the machinery. Please try again.'),
    saveDetails: (id, v) => guard(async () => {
      const cur = machines.find((x) => x.id === id)!;
      const next = { ...applyDetails(cur, v), updatedAt: Date.now() };
      await db.saveMachine(next);
      setMachines((x) => x.map((m) => (m.id === id ? next : m)));
    }, 'Something went wrong while saving the machinery details. Please try again.'),
    toggleActive: (id, v) => guard(async () => {
      const cur = machines.find((x) => x.id === id)!;
      const next = { ...applyToggle(applyDetails(cur, v)), updatedAt: Date.now() };
      await db.saveMachine(next);
      setMachines((x) => x.map((m) => (m.id === id ? next : m)));
    }, 'Something went wrong while updating the machine status. Please try again.'),
    deleteMachine: (id) => guard(async () => {
      await db.deleteMachine(id);
      setReadings((r) => r.filter((x) => x.machineId !== id));
      setMachines((m) => m.filter((x) => x.id !== id));
    }, 'Something went wrong while deleting the machine. Please try again.'),
    saveReading: (i, id) => guard(async () => {
      const now = Date.now();
      const old = id ? readings.find((x) => x.id === id) : undefined;
      const r: Reading = {
        ...i, id: old?.id ?? uid(), total: i.endReading - i.startReading, createdAt: old?.createdAt ?? now, updatedAt: now,
      };
      await db.saveReading(r);
      setReadings((x) => (old ? x.map((y) => (y.id === r.id ? r : y)) : [...x, r]));
    }, 'Something went wrong while saving the reading. Please try again.'),
    deleteReading: (id) => guard(async () => {
      await db.deleteReading(id);
      setReadings((r) => r.filter((x) => x.id !== id));
    }, 'Something went wrong while deleting the reading. Please try again.'),
  };

  return <Ctx.Provider value={useMemo(() => value, [value.mode, value.ready, value.splashing, value.toastMsg, projects, machines, readings])}>{children}</Ctx.Provider>;
}
