import React from 'react';
import Svg, { Defs, G, LinearGradient, Path, Circle, Rect, Stop } from 'react-native-svg';

/** The approved Machine Tracker logo (verbatim from logo.svg). Unique gradient ids per usage. */
export function Logo({ size = 42, id = 'lg' }: { size?: number; id?: string }) {
  const b = `${id}b`;
  const a = `${id}a`;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={b} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1B3556" />
          <Stop offset="1" stopColor="#0F1B2D" />
        </LinearGradient>
        <LinearGradient id={a} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFC63D" />
          <Stop offset="1" stopColor="#FFA800" />
        </LinearGradient>
      </Defs>
      <Rect width="120" height="120" rx="28" fill={`url(#${b})`} />
      <G transform="translate(0 -6)">
        <Path d="M26 74a34 34 0 0 1 68 0" fill="none" stroke={`url(#${a})`} strokeWidth="9" strokeLinecap="round" />
        <Path d="M60 47v5M41 55l3.5 3.5" stroke="#9FB2CF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M60 74L77 57" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <Circle cx="60" cy="74" r="8" fill={`url(#${a})`} />
        <Rect x="30" y="90" width="60" height="9" rx="4.5" fill="#fff" opacity={0.92} />
      </G>
    </Svg>
  );
}
