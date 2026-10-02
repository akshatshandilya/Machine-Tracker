import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** The approved Machine Tracker logo (identical to assets/logo.svg). */
export default function Logo({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#1B3556" /><Stop offset="1" stopColor="#0F1B2D" /></LinearGradient>
        <LinearGradient id="am" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFC63D" /><Stop offset="1" stopColor="#FFA800" /></LinearGradient>
      </Defs>
      <Rect width="120" height="120" rx="28" fill="url(#bg)" />
      <G transform="translate(0 -6)">
        <Path d="M26 74a34 34 0 0 1 68 0" fill="none" stroke="url(#am)" strokeWidth={9} strokeLinecap="round" />
        <Path d="M60 47v5M41 55l3.5 3.5" stroke="#9FB2CF" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M60 74L77 57" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        <Circle cx="60" cy="74" r="8" fill="url(#am)" />
        <Rect x="30" y="90" width="60" height="9" rx="4.5" fill="#fff" opacity={0.92} />
      </G>
    </Svg>
  );
}
