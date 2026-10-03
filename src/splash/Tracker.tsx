import React, { useEffect, useMemo, useState } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface Props { W: number; H: number; cx: number; cy: number; S: number }

/** Polyline approximation of the tracking route so the dot can follow it (no getPointAtLength in RN). */
function buildRoute({ W, H, cx, cy, S }: Props) {
  const r = 14;
  const x1 = Math.round(W * 0.2);
  const y0 = cy + Math.round(H * 0.2);
  const ex = cx - S / 2 - 8;
  const d = `M-4 ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 - r}V${cy + r}Q${x1} ${cy} ${x1 + r} ${cy}H${ex}`;
  const pts: [number, number][] = [[-4, y0], [x1 - r, y0]];
  const quad = (p0: [number, number], c: [number, number], p1: [number, number]) => {
    for (let i = 1; i <= 14; i++) {
      const t = i / 14, u = 1 - t;
      pts.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]]);
    }
  };
  quad([x1 - r, y0], [x1, y0], [x1, y0 - r]);
  pts.push([x1, cy + r]);
  quad([x1, cy + r], [x1, cy], [x1 + r, cy]);
  pts.push([ex, cy]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { d, pts, cum, len: cum[cum.length - 1] };
}
const at = (route: ReturnType<typeof buildRoute>, dist: number): [number, number] => {
  const { pts, cum } = route;
  for (let i = 1; i < cum.length; i++) {
    if (dist <= cum[i]) {
      const k = (dist - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
    }
  }
  return pts[pts.length - 1];
};
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Thin amber route line + moving dot. Timings identical to the approved preview. */
export function Tracker(props: Props) {
  const route = useMemo(() => buildRoute(props), [props.W, props.H, props.cx, props.cy, props.S]); // eslint-disable-line react-hooks/exhaustive-deps
  const [st, setSt] = useState({ e: 0, dot: [0, 0] as [number, number], dotO: 0, pathO: 1 });

  useEffect(() => {
    let dead = false;
    const t0 = Date.now();
    const f = () => {
      if (dead) return;
      const t = Date.now() - t0;
      let p = (t - 300) / 800;
      if (p > 0) {
        p = Math.min(p, 1);
        const e = ease(p);
        setSt({
          e,
          dot: at(route, route.len * e),
          dotO: t < 1100 ? 1 : Math.max(0, 1 - (t - 1100) / 150),
          pathO: t < 1100 ? 1 : Math.max(0, 1 - (t - 1100) / 450),
        });
      }
      if (t < 1600) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
    return () => { dead = true; };
  }, [route]);

  return (
    <Svg width={props.W} height={props.H} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      <Path
        d={route.d}
        fill="none"
        stroke="#FFC63D"
        strokeOpacity={0.55 * st.pathO}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${route.len}`}
        strokeDashoffset={route.len * (1 - st.e)}
      />
      <Circle cx={st.dot[0]} cy={st.dot[1]} r={4} fill="#FFC63D" opacity={st.dotO} />
    </Svg>
  );
}
