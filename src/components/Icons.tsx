import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

interface P { size?: number; color: string }
const Base = ({ size = 22, color, children }: P & { children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);
export const BackIcon = (p: P) => <Base {...p}><Path d="M15 5l-7 7 7 7" /></Base>;
export const PenIcon = (p: P) => (
  <Base {...p}>
    <G transform="translate(24 0) scale(-1 1)">
      <Path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <Path d="m15 5 4 4" />
    </G>
  </Base>
);
export const ClockIcon = (p: P) => <Base {...p} size={p.size ?? 20}><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></Base>;
export const TrashIcon = (p: P) => <Base {...p}><Path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" /></Base>;
export const InfoIcon = (p: P) => <Base {...p}><Circle cx="12" cy="12" r="9" /><Path d="M12 11v5M12 8h.01" /></Base>;
export const PlusIcon = (p: P) => <Base {...p}><Path d="M12 5v14M5 12h14" /></Base>;
export const MoonIcon = (p: P) => <Base {...p}><Path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" /></Base>;
export const SunIcon = (p: P) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="4" />
    <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Base>
);
