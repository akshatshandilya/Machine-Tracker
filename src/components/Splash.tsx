import React, { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAVY, NAVY_DARK } from '../theme';
import Logo from './Logo';

const AnimPath = Animated.createAnimatedComponent(Path);
const AnimCircle = Animated.createAnimatedComponent(Circle);

/** Orthogonal "route" that runs in from the left and ends at the logo (sampled so the dot can follow it exactly). */
function buildRoute(W: number, H: number, S: number, cx: number, cy: number) {
  const r = 14, x1 = Math.round(W * 0.2), y0 = cy + Math.round(H * 0.2), ex = cx - S / 2 - 8;
  const P: [number, number][] = [[-4, y0], [x1 - r, y0]];
  const curve = (a: [number, number], c: [number, number], b: [number, number]) => {
    for (let i = 1; i <= 8; i++) { const t = i / 8, u = 1 - t; P.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  };
  curve([x1 - r, y0], [x1, y0], [x1, y0 - r]);
  P.push([x1, cy + r]);
  curve([x1, cy + r], [x1, cy], [x1 + r, cy]);
  P.push([ex, cy]);
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = cum[cum.length - 1];
  return { d: 'M' + P.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L'), len, at: cum.map((x) => x / len), xs: P.map((p) => p[0]), ys: P.map((p) => p[1]) };
}

const tm = (v: Animated.Value, to: number, duration: number, delay = 0, easing?: (t: number) => number, native = true) =>
  Animated.timing(v, { toValue: to, duration, delay, easing, useNativeDriver: native });

export default function Splash({ onFinish }: { onFinish: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const S = Math.round(Math.min(W * 0.3, 140)), cx = W / 2, cy = Math.round(H * 0.44);
  const route = useMemo(() => buildRoute(W, H, S, cx, cy), [W, H, S, cx, cy]);

  const v = useRef({
    grid: new Animated.Value(0), p: new Animated.Value(0), line: new Animated.Value(0.55), dot: new Animated.Value(0),
    ring: new Animated.Value(0), reveal: new Animated.Value(0), settle: new Animated.Value(0), name: new Animated.Value(0),
    travel: new Animated.Value(0), bg: new Animated.Value(0), nameOut: new Animated.Value(0),
  }).current;
  const left = useRef(false);
  const main = useRef<Animated.CompositeAnimation | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leave = (reduced: boolean) => {
    if (left.current) return;
    left.current = true;
    if (timer.current) clearTimeout(timer.current);
    main.current?.stop();
    v.reveal.setValue(1); v.name.setValue(1); v.settle.setValue(0); v.ring.setValue(1); v.line.setValue(0); v.dot.setValue(0);
    if (reduced) { Animated.parallel([tm(v.bg, 1, 250), tm(v.nameOut, 1, 250), tm(v.travel, 2, 250)]).start(onFinish); return; }
    Animated.parallel([
      tm(v.travel, 1, 520, 0, Easing.bezier(0.65, 0, 0.25, 1)),
      tm(v.bg, 1, 420, 100, Easing.inOut(Easing.ease)),
      tm(v.nameOut, 1, 200),
    ]).start(onFinish);
  };

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!alive) return;
      if (reduced) {
        main.current = Animated.parallel([tm(v.reveal, 1, 300), tm(v.name, 1, 300, 100)]);
        main.current.start();
        timer.current = setTimeout(() => leave(true), 1000);
        return;
      }
      main.current = Animated.parallel([
        tm(v.grid, 1, 400, 0, Easing.out(Easing.ease)),
        tm(v.p, 1, 800, 300, Easing.inOut(Easing.quad), false),
        Animated.sequence([Animated.delay(300), tm(v.dot, 1, 1, 0, undefined, false), Animated.delay(799), tm(v.dot, 0, 150, 0, undefined, false)]),
        tm(v.line, 0, 450, 1100, undefined, false),
        tm(v.ring, 1, 700, 1100, Easing.out(Easing.ease)),
        tm(v.reveal, 1, 700, 800, Easing.bezier(0.22, 0.8, 0.24, 1)),
        Animated.sequence([Animated.delay(1500), tm(v.settle, 1, 225, 0, Easing.inOut(Easing.ease)), tm(v.settle, 0, 225, 0, Easing.inOut(Easing.ease))]),
        tm(v.name, 1, 500, 1250, Easing.out(Easing.ease)),
      ]);
      main.current.start();
      timer.current = setTimeout(() => leave(false), 2050);
    });
    return () => { alive = false; if (timer.current) clearTimeout(timer.current); main.current?.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dx = 39 - cx, dy = insets.top + 39 - cy, k = 42 / S;
  const grid = useMemo(() => {
    let d = '';
    for (let x = 0; x <= W; x += 32) d += `M${x} 0V${H}`;
    for (let y = 0; y <= H; y += 32) d += `M0 ${y}H${W}`;
    return d;
  }, [W, H]);
  const fill = StyleSheet.absoluteFill;
  const rect = { position: 'absolute' as const, width: S, height: S, left: cx - S / 2, top: cy - S / 2 };
  const stray = (a: Animated.Value, out: Animated.Value) => Animated.multiply(a, out.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }));

  return (
    <Pressable style={[fill, { zIndex: 50 }]} onPress={() => leave(false)} accessibilityLabel="Skip">
      <Animated.View style={[fill, { opacity: v.bg.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
        <LinearGradient colors={NAVY} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={fill} />
        <Animated.View style={[fill, { opacity: Animated.multiply(v.grid, 0.07) }]}>
          <Svg width={W} height={H}><Path d={grid} stroke="#9FB2CF" strokeWidth={1} fill="none" /></Svg>
        </Animated.View>
        <Svg width={W} height={H} style={fill}>
          <AnimPath d={route.d} fill="none" stroke="#FFC63D" strokeOpacity={v.line as any} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={[route.len, route.len]} strokeDashoffset={v.p.interpolate({ inputRange: [0, 1], outputRange: [route.len, 0] }) as any} />
          <AnimCircle r={4} fill="#FFC63D" opacity={v.dot as any}
            cx={v.p.interpolate({ inputRange: route.at, outputRange: route.xs }) as any} cy={v.p.interpolate({ inputRange: route.at, outputRange: route.ys }) as any} />
        </Svg>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[rect, { borderWidth: 1.5, borderColor: '#FFC63D', borderRadius: S * 0.24,
        opacity: v.ring.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 0.55, 0] }), transform: [{ scale: v.ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }] }]} />

      <Animated.View pointerEvents="none" style={[rect, { transform: [
        { translateX: v.travel.interpolate({ inputRange: [0, 1, 2], outputRange: [0, dx, 0] }) },
        { translateY: v.travel.interpolate({ inputRange: [0, 1, 2], outputRange: [0, dy, 0] }) },
        { scale: v.travel.interpolate({ inputRange: [0, 1, 2], outputRange: [1, k, 1] }) }] }]}>
        <Animated.View style={{ opacity: v.travel.interpolate({ inputRange: [0, 1.999, 2], outputRange: [1, 1, 0] }) }}>
          <Animated.View style={{ opacity: v.reveal, transform: [
            { translateY: v.reveal.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
            { scale: Animated.multiply(v.reveal.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }), v.settle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] })) }] }}>
            <View style={{ width: S, height: S, borderRadius: S * 0.233, backgroundColor: NAVY_DARK, elevation: 12, shadowColor: '#000' }}><Logo size={S} /></View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.Text pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: cy + S / 2 + 22, textAlign: 'center', color: '#EAF0FA', fontSize: 17, fontWeight: '700', letterSpacing: 0.5,
        opacity: stray(v.name, v.nameOut), transform: [{ translateY: v.name.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) }] }}>
        Machine Tracker
      </Animated.Text>
    </Pressable>
  );
}
