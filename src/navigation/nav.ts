import { createContext, useContext } from 'react';

export type Route =
  | { name: 'projects' }
  | { name: 'mg'; projectId: string }
  | { name: 'pm'; projectId: string }
  | { name: 'md'; projectId: string; machineId: string }
  | { name: 'rd'; projectId: string; machineId: string };

export interface Nav { push: (r: Route) => void; pop: () => void }
export const NavCtx = createContext<Nav>({ push: () => {}, pop: () => {} });
export const useNav = () => useContext(NavCtx);
