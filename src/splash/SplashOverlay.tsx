import React, { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, G, Line, Mask, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Logo } from '../components/Logo';
import { headerLogoRef } from '../components/Header';
import { Tracker } from './Tracker';

const bez = (a: number, b: number, c: number, d: number) => Easing.bezier(a, b, c, d);

export function SplashOverlay({ onReady, onDone }: { onReady: () => void; onDone: () => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const S = Math.round(Math.min(W * 0.3, 140));
  const cx = W / 2;
  const cy = Math.round(H * 0.44);

  const v = useRef({
    grid: new Animated.Value(0),
    bg: new Animated.Value(1),
    all: new Animated.Value(1),
    logoO: new Animated.Value(0),
    logoY: new Animated.Value(10),
    logoS: new Animated.Value(0.95),
    shadow: new Animated.Value(0),
    pulse: new Animated.Value(1),
    nameO: new Animated.Value(0),
    nameY: new Animated.Value(6),
    ringS: new Animated.Value(1),
    ringO: new Animated.Value(0),
    flyX: new Animated.Value(0),
    flyY: new Animated.Value(0),
    flyS: new Animated.Value(1),
  }).current;

  const state = useRef({ left: false, reduced: false, timer: undefined as ReturnType<typeof setTimeout> | undefined, tracker: true });
  const [showTracker, setShowTracker] = React.useState(false);
  const run = (val: Animated.Value, to: number, duration: number, delay = 0, easing: (t: number) => number = Easing.linear) =>
    Animated.timing(val, { toValue: to, duration, delay, easing, useNativeDriver: true });

  const leave = () => {
    const s = state.current;
    if (s.left) return;
    s.left = true;
    if (s.timer) clearTimeout(s.timer);
    setShowTracker(false);
    // jump all intro animations to their end state
    Object.values(v).forEach((a) => a.stopAnimation());
    if (s.reduced) {
      v.logoO.setValue(1); v.nameO.setValue(1);
      run(v.all, 0, 250).start(() => onDone());
      return;
    }
    v.grid.setValue(1); v.logoO.setValue(1); v.logoY.setValue(0); v.logoS.setValue(1); v.pulse.setValue(1);
    v.shadow.setValue(1); v.nameO.setValue(1); v.nameY.setValue(0); v.ringO.setValue(0);

    const fade = [run(v.nameO, 0, 200), run(v.bg, 0, 420, 100, Easing.inOut(Easing.ease))];
    const target = headerLogoRef.current;
    const finish = (extra: Animated.CompositeAnimation) => Animated.parallel([...fade, extra]).start(() => onDone());
    if (!target) { finish(run(v.logoO, 0, 300)); return; }
    target.measureInWindow((x, y, w, h) => {
      if (!w) { finish(run(v.logoO, 0, 300)); return; }
      const dx = x + w / 2 - cx;
      const dy = y + h / 2 - cy;
      finish(Animated.parallel([
        run(v.flyX, dx, 520, 0, bez(0.65, 0, 0.25, 1)),
        run(v.flyY, dy, 520, 0, bez(0.65, 0, 0.25, 1)),
        run(v.flyS, w / S, 520, 0, bez(0.65, 0, 0.25, 1)),
      ]));
    });
  };

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((rm) => {
      if (cancelled) return;
      const s = state.current;
      s.reduced = rm;
      if (rm) {
        run(v.logoO, 1, 300).start();
        run(v.nameO, 1, 300, 100).start();
        s.timer = setTimeout(leave, 1000);
        return;
      }
      setShowTracker(true);
      const ease = Easing.out(Easing.quad);
      run(v.grid, 1, 400, 0, ease).start();
      Animated.parallel([
        run(v.logoO, 1, 700, 800, bez(0.22, 0.8, 0.24, 1)),
        run(v.logoY, 0, 700, 800, bez(0.22, 0.8, 0.24, 1)),
        run(v.logoS, 1, 700, 800, bez(0.22, 0.8, 0.24, 1)),
        run(v.shadow, 1, 800, 800),
      ]).start();
      Animated.sequence([
        Animated.delay(1500),
        run(v.pulse, 1.02, 225, 0, Easing.inOut(Easing.ease)),
        run(v.pulse, 1, 225, 0, Easing.inOut(Easing.ease)),
      ]).start();
      run(v.nameO, 1, 500, 1250, ease).start();
      run(v.nameY, 0, 500, 1250, ease).start();
      Animated.parallel([run(v.ringS, 1.55, 700, 1100, ease)]).start();
      Animated.sequence([Animated.delay(1100), run(v.ringO, 0.55, 0), run(v.ringO, 0, 700, 0, ease)]).start();
      s.timer = setTimeout(leave, 2050);
    });
    return () => { cancelled = true; if (state.current.timer) clearTimeout(state.current.timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grid = useMemo(() => {
    const lines: React.ReactNode[] = [];
    for (let x = 0; x <= W; x += 32) lines.push(<Line key={`x${x}`} x1={x} y1={0} x2={x} y2={H} stroke="rgb(159,178,207)" strokeOpacity={0.07} strokeWidth={1} />);
    for (let y = 0; y <= H; y += 32) lines.push(<Line key={`y${y}`} x1={0} y1={y} x2={W} y2={y} stroke="rgb(159,178,207)" strokeOpacity={0.07} strokeWidth={1} />);
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
    return (
      <Svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs>
          <RadialGradient id="gm" cx={cx} cy={cy} r={far * 0.72} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
          <Mask id="gk" x={0} y={0} width={W} height={H} maskUnits="userSpaceOnUse">
            <Rect x={0} y={0} width={W} height={H} fill="url(#gm)" />
          </Mask>
        </Defs>
        <G mask="url(#gk)">{lines}</G>
      </Svg>
    );
  }, [W, H, cx, cy]);

  const box = { position: 'absolute' as const, width: S, height: S, left: cx - S / 2, top: cy - S / 2 };
  return (
    <Animated.View
      onLayout={onReady}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, zIndex: 100, elevation: 100, opacity: v.all }}
    >
      <Pressable style={{ flex: 1 }} onPress={leave} accessibilityLabel="Skip intro">
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: v.bg }}>
          <LinearGradient colors={['#0F1B2D', '#1B3556']} start={{ x: 0.35, y: 0 }} end={{ x: 0.65, y: 1 }} style={{ flex: 1 }} />
          <Animated.View style={{ position: 'absolute', left: 0, top: 0, opacity: v.grid }} pointerEvents="none">{grid}</Animated.View>
          {showTracker && <Tracker W={W} H={H} cx={cx} cy={cy} S={S} />}
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[box, { borderWidth: 1.5, borderColor: '#FFC63D', borderRadius: S * 0.24, opacity: v.ringO, transform: [{ scale: v.ringS }] }]}
        />
        <Animated.View pointerEvents="none" style={[box, { transform: [{ translateX: v.flyX }, { translateY: v.flyY }, { scale: v.flyS }] }]}>
          <Animated.View
            style={{ flex: 1, opacity: v.logoO, transform: [{ translateY: v.logoY }, { scale: Animated.multiply(v.logoS, v.pulse) }] }}
          >
            <Animated.View
              style={{
                position: 'absolute', left: 0, top: 0, width: S, height: S, borderRadius: S * 0.233, backgroundColor: '#0F1B2D',
                elevation: 14, shadowColor: '#000', opacity: v.shadow,
              }}
            />
            <Logo size={S} id="spl" />
          </Animated.View>
        </Animated.View>

        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: cy + S / 2 + 22, alignItems: 'center', opacity: v.nameO, transform: [{ translateY: v.nameY }] }}>
          <Text style={{ color: '#EAF0FA', fontWeight: '700', fontSize: 17, letterSpacing: 0.51 }}>Machine Tracker</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
