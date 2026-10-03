export interface Project {
  id: string;
  name: string;
  cAt: number;
}
export interface Period {
  id: string;
  s: string;
  e: string;
}
export interface Machine {
  id: string;
  pid: string;
  type: string;
  vt: string;
  no: string;
  owner: string;
  sd: string;
  ed: string;
  cAt: number;
  inactive?: boolean;
  hist?: Period[];
}
export interface Reading {
  id: string;
  mid: string;
  date: string;
  /** number, or text exactly as written in the source sheet (e.g. "Working"); '' when empty */
  sr: number | string;
  st: string;
  er: number | string;
  et: string;
  /** Diesel / petrol quantity (optional) */
  fuel?: number | null;
  uAt: number;
}
export interface DB {
  projects: Project[];
  machines: Machine[];
  readings: Reading[];
}
export interface MachineForm {
  vt: string;
  no: string;
  owner: string;
  sd: string;
  ed: string;
}
