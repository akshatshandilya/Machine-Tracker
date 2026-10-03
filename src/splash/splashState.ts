import { useSyncExternalStore } from 'react';

let active = true;
const subs = new Set<() => void>();
export const setSplashActive = (v: boolean) => {
  active = v;
  subs.forEach((f) => f());
};
export const useSplashActive = () =>
  useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => active);
