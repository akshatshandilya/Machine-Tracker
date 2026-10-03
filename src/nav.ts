export type Route =
  | { n: 'proj' }
  | { n: 'pm'; pid: string }
  | { n: 'mg'; pid: string }
  | { n: 'md'; pid: string; mid: string }
  | { n: 'rd'; pid: string; mid: string }
  | { n: 'about' };

export interface Nav {
  go: (r: Route) => void;
  back: () => void;
}
