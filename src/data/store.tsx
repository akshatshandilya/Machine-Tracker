import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DB, Machine, Reading } from './types';
import { uid } from '../utils/format';

const KEY = 'mt_v2';
const EMPTY: DB = { projects: [], machines: [], readings: [] };

interface Store {
  db: DB;
  ready: boolean;
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  addMachine: (pid: string, type: string) => void;
  updateMachine: (m: Machine) => void;
  deleteMachine: (id: string) => void;
  addReading: (r: Omit<Reading, 'id' | 'uAt'>) => void;
  updateReading: (id: string, v: Partial<Reading>) => void;
  deleteReading: (id: string) => void;
  applyImport: (p: { machines: Machine[]; readings: Reading[]; removeIds: string[] }) => void;
}

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(EMPTY);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const p = JSON.parse(raw);
          setDb({
            projects: p.projects ?? [],
            machines: p.machines ?? [],
            readings: p.readings ?? [],
          });
        }
      } catch {
        // start empty if storage is unreadable
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  // Persist every change (never before the initial load has finished).
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(db)).catch(() => {});
  }, [db]);

  const addProject = useCallback((name: string) => {
    setDb((d) => ({ ...d, projects: [{ id: uid(), name, cAt: Date.now() }, ...d.projects] }));
  }, []);
  const deleteProject = useCallback((id: string) => {
    setDb((d) => {
      const ids = d.machines.filter((m) => m.pid === id).map((m) => m.id);
      return {
        projects: d.projects.filter((p) => p.id !== id),
        machines: d.machines.filter((m) => m.pid !== id),
        readings: d.readings.filter((r) => !ids.includes(r.mid)),
      };
    });
  }, []);
  const addMachine = useCallback((pid: string, type: string) => {
    setDb((d) => ({
      ...d,
      machines: [...d.machines, { id: uid(), pid, type, vt: '', no: '', owner: '', sd: '', ed: '', cAt: Date.now() }],
    }));
  }, []);
  const updateMachine = useCallback((m: Machine) => {
    setDb((d) => ({ ...d, machines: d.machines.map((x) => (x.id === m.id ? m : x)) }));
  }, []);
  const deleteMachine = useCallback((id: string) => {
    setDb((d) => ({
      ...d,
      machines: d.machines.filter((m) => m.id !== id),
      readings: d.readings.filter((r) => r.mid !== id),
    }));
  }, []);
  const addReading = useCallback((r: Omit<Reading, 'id' | 'uAt'>) => {
    setDb((d) => ({ ...d, readings: [...d.readings, { ...r, id: uid(), uAt: Date.now() }] }));
  }, []);
  const updateReading = useCallback((id: string, v: Partial<Reading>) => {
    setDb((d) => ({
      ...d,
      readings: d.readings.map((r) => (r.id === id ? { ...r, ...v, uAt: Date.now() } : r)),
    }));
  }, []);
  const deleteReading = useCallback((id: string) => {
    setDb((d) => ({ ...d, readings: d.readings.filter((r) => r.id !== id) }));
  }, []);

  const applyImport = useCallback((p: { machines: Machine[]; readings: Reading[]; removeIds: string[] }) => {
    setDb((d) => {
      const rm = new Set(p.removeIds);
      return {
        ...d,
        machines: [...d.machines, ...p.machines],
        readings: [...d.readings.filter((r) => !rm.has(r.id)), ...p.readings],
      };
    });
  }, []);

  const value = useMemo(
    () => ({ db, ready, addProject, deleteProject, addMachine, updateMachine, deleteMachine, addReading, updateReading, deleteReading, applyImport }),
    [db, ready, addProject, deleteProject, addMachine, updateMachine, deleteMachine, addReading, updateReading, deleteReading, applyImport],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
