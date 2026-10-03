import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Colors {
  bg: string; card: string; ink: string; mut: string; line: string; ac: string; acink: string;
  dk: string; ok: string; okbg: string; bad: string; badbg: string; bdg: string;
}
// Values copied 1:1 from the approved preview ("Midnight & Amber")
export const LIGHT: Colors = {
  bg: '#F1EEE8', card: '#FBFAF7', ink: '#1F2733', mut: '#6B7380', line: '#E1DCD0', ac: '#FFB020',
  acink: '#1A1200', dk: '#0F1B2D', ok: '#0F7F5A', okbg: '#DDEFE3', bad: '#C7352B', badbg: '#F8E1DE', bdg: '#EAE5DA',
};
export const DARK: Colors = {
  bg: '#0B1220', card: '#131C2E', ink: '#EAF0FA', mut: '#93A0B8', line: '#22304A', ac: '#FFB020',
  acink: '#1A1200', dk: '#070D18', ok: '#4ADE9B', okbg: '#0F3326', bad: '#FF8A80', badbg: '#3B1A1D', bdg: '#1B2740',
};

interface ThemeCtx { c: Colors; isDark: boolean; toggle: () => void; ready: boolean }
const Ctx = createContext<ThemeCtx>(null as unknown as ThemeCtx);
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPref] = useState<'light' | 'dark' | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('mt_theme')
      .then((t) => { if (t === 'light' || t === 'dark') setPref(t); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const isDark = pref ? pref === 'dark' : system === 'dark';
  const value = useMemo<ThemeCtx>(
    () => ({
      c: isDark ? DARK : LIGHT,
      isDark,
      ready,
      toggle: () => {
        const t = isDark ? 'light' : 'dark';
        setPref(t);
        AsyncStorage.setItem('mt_theme', t).catch(() => {});
      },
    }),
    [isDark, ready],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
