import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleProp, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AMBER, NAVY } from '../theme';
import { useApp } from '../store/AppProvider';

export const Txt = ({ style, ...p }: React.ComponentProps<typeof Text>) => {
  const { c } = useApp();
  return <Text {...p} style={[{ color: c.ink, fontSize: 16 }, style]} />;
};
export const Mut = ({ style, ...p }: React.ComponentProps<typeof Text>) => {
  const { c } = useApp();
  return <Text {...p} style={[{ color: c.mut, fontSize: 14 }, style]} />;
};

interface BtnProps {
  label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  small?: boolean; large?: boolean; full?: boolean; icon?: React.ReactNode; tint?: string; style?: StyleProp<ViewStyle>; disabled?: boolean;
}
export function Button({ label, onPress, variant = 'primary', small, large, full, icon, tint, style, disabled }: BtnProps) {
  const { c } = useApp();
  const color = tint ?? (variant === 'danger' ? '#fff' : variant === 'primary' ? c.acink : variant === 'ghost' ? c.mut : c.ink);
  const box: ViewStyle = { minHeight: large ? 60 : small ? 44 : 52, paddingHorizontal: large ? 30 : small ? 14 : 18, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 };
  const content = (<>{icon}<Text style={{ color, fontSize: large ? 18 : small ? 15 : 16, fontWeight: '700' }}>{label}</Text></>);
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [{ borderRadius: 14, alignSelf: full ? 'stretch' : 'auto', opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        variant === 'primary' && { elevation: 5, shadowColor: '#FFA800', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, style]}>
      {variant === 'primary'
        ? <LinearGradient colors={AMBER} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={box}>{content}</LinearGradient>
        : <View style={[box, variant === 'secondary' && { backgroundColor: c.card, borderWidth: 1.5, borderColor: tint ?? c.line },
            variant === 'danger' && { backgroundColor: c.bad }]}>{content}</View>}
    </Pressable>
  );
}

/** Fade + slide-up used for cards appearing. */
export function Enter({ i = 0, children, style }: { i?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 250, delay: Math.min(i, 5) * 40, useNativeDriver: true }).start(); }, [v, i]);
  return <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }, style]}>{children}</Animated.View>;
}

export function Card({ children, onPress, i = 0, style }: { children: React.ReactNode; onPress?: () => void; i?: number; style?: StyleProp<ViewStyle> }) {
  const { c } = useApp();
  const base: ViewStyle = { backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 20, padding: 16, elevation: 2, shadowColor: '#3C321E', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } };
  return (
    <Enter i={i} style={{ marginBottom: 12 }}>
      {onPress
        ? <Pressable onPress={onPress} style={({ pressed }) => [base, style, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}>{children}</Pressable>
        : <View style={[base, style]}>{children}</View>}
    </Enter>
  );
}

export function Badge({ text, amber, size = 48 }: { text: string; amber?: boolean; size?: number }) {
  const { c } = useApp();
  return (
    <LinearGradient colors={amber ? AMBER : [NAVY[1], NAVY[0]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.31, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: amber ? '#14181F' : '#FFC63D', fontWeight: '800', fontSize: size > 50 ? 22 : 13 }}>{text}</Text>
    </LinearGradient>
  );
}

export function Pill({ text, active }: { text: string; active?: boolean }) {
  const { c } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: active ? c.okbg : c.bdg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}>
      {active && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.ok }} />}
      <Text style={{ color: active ? c.ok : c.mut, fontSize: 13, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

/** Start / End shown side by side. */
export function StartEnd({ a, b, la = 'Start', lb = 'End' }: { a: string; b: string; la?: string; lb?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
      {[[la, a], [lb, b]].map(([l, v]) => (
        <View key={l} style={{ flex: 1 }}><Mut style={{ fontWeight: '600', fontSize: 13, marginBottom: 2 }}>{l}</Mut><Txt style={{ fontSize: 15, fontWeight: '600' }}>{v}</Txt></View>
      ))}
    </View>
  );
}

export function Empty({ title, text, badge, children }: { title: string; text: string; badge?: string; children?: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16, gap: 8 }}>
      {badge ? <Badge text={badge} size={72} /> : null}
      <Txt style={{ fontSize: 17, fontWeight: '700', marginTop: 6 }}>{title}</Txt>
      <Mut style={{ textAlign: 'center', marginBottom: 8 }}>{text}</Mut>
      {children}
    </View>
  );
}

export const labelStyle = (c: { mut: string }): TextStyle => ({ color: c.mut, fontSize: 13, fontWeight: '700', letterSpacing: 0.4, marginTop: 16, marginBottom: 7 });

interface FieldProps extends TextInputProps { label: string; error?: string; hint?: string }
export function Field({ label, error, hint, editable = true, style, ...p }: FieldProps) {
  const { c } = useApp();
  const [focus, setFocus] = useState(false);
  return (
    <View>
      <Text style={labelStyle(c)}>{label}</Text>
      <TextInput {...p} editable={editable} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholderTextColor={c.mut}
        style={[{ minHeight: 52, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 16, color: c.ink,
          backgroundColor: editable ? c.card : c.bdg, borderColor: error ? c.bad : focus ? c.ac : editable ? c.line : 'transparent' }, style]} />
      {error ? <Text style={{ color: c.bad, fontSize: 13, fontWeight: '600', marginTop: 4 }}>{error}</Text> : null}
      {hint ? <Mut style={{ fontSize: 13, marginTop: 4 }}>{hint}</Mut> : null}
    </View>
  );
}

export function SearchInput(p: TextInputProps) {
  const { c } = useApp();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput {...p} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} placeholderTextColor={c.mut}
      style={{ minHeight: 52, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, fontSize: 16, color: c.ink, backgroundColor: c.card, borderColor: focus ? c.ac : c.line }} />
  );
}
