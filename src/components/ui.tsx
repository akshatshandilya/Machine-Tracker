import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleProp, Text, TextInput, TextInputProps, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/theme';
import { dateFromStr, fD, fT, ld, strFromTime, timeFromStr } from '../utils/format';
import { ClockIcon } from './Icons';

/* ---------- Text ---------- */
export const Mut = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => {
  const { c } = useTheme();
  return <Text style={[{ color: c.mut, fontSize: 14 }, style]}>{children}</Text>;
};
export const H2 = ({ children }: { children: React.ReactNode }) => {
  const { c } = useTheme();
  return <Text style={{ fontSize: 24, fontWeight: '700', letterSpacing: -0.48, color: c.ink, marginBottom: 4 }}>{children}</Text>;
};
export const H3 = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => {
  const { c } = useTheme();
  return <Text numberOfLines={2} style={[{ fontSize: 17, fontWeight: '700', color: c.ink }, style]}>{children}</Text>;
};
export const Bold = ({ children }: { children: React.ReactNode }) => <Text style={{ fontWeight: '700' }}>{children}</Text>;
export const Label = ({ children, first, style }: { children: React.ReactNode; first?: boolean; style?: StyleProp<TextStyle> }) => {
  const { c } = useTheme();
  return <Text style={[{ color: c.mut, fontSize: 13, fontWeight: '700', letterSpacing: 0.39, marginTop: first ? 0 : 16, marginBottom: 7 }, style]}>{children}</Text>;
};
export const Grp = ({ children }: { children: React.ReactNode }) => {
  const { c } = useTheme();
  return <Text style={{ color: c.mut, fontSize: 12, fontWeight: '800', letterSpacing: 1.44, marginTop: 22, marginHorizontal: 4, marginBottom: 10 }}>{children}</Text>;
};
export const ErrMsg = ({ children }: { children: React.ReactNode }) => {
  const { c } = useTheme();
  return <Text style={{ fontSize: 13, color: c.bad, marginTop: 4, fontWeight: '600' }}>{children}</Text>;
};
export const Hint = ({ children }: { children: React.ReactNode }) => {
  const { c } = useTheme();
  return <Text style={{ fontSize: 13, color: c.mut, marginTop: 4 }}>{children}</Text>;
};

/* ---------- Enter animation (page + card) ---------- */
export function Enter({ children, delay = 0, duration = 220, style }: { children: React.ReactNode; delay?: number; duration?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [v, delay, duration]);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

/* ---------- Buttons ---------- */
type Kind = 'p' | 's' | 'd' | 'g';
export function Btn({ kind = 's', sm, xs, w, onPress, children, style, color, borderColor }: {
  kind?: Kind; sm?: boolean; xs?: boolean; w?: boolean; onPress?: () => void; children: React.ReactNode;
  style?: StyleProp<ViewStyle>; color?: string; borderColor?: string;
}) {
  const { c } = useTheme();
  const fg = color ?? (kind === 'p' ? c.acink : kind === 'd' ? '#fff' : kind === 'g' ? c.mut : c.ink);
  const inner: ViewStyle = {
    minHeight: xs ? 36 : sm ? 44 : 52, paddingHorizontal: xs ? 12 : sm ? 14 : 18, borderRadius: xs ? 12 : 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: xs ? 6 : 8, overflow: 'hidden',
  };
  if (kind === 'p') Object.assign(inner, { backgroundColor: '#FFB920', elevation: 5, shadowColor: '#FFA800' });
  if (kind === 's') Object.assign(inner, { backgroundColor: c.card, borderWidth: 1.5, borderColor: borderColor ?? c.line });
  if (kind === 'd') Object.assign(inner, { backgroundColor: c.bad, borderWidth: 2, borderColor: 'transparent' });
  const content = typeof children === 'string' ? (
    <Text style={{ color: fg, fontSize: xs ? 14 : sm ? 15 : 16, fontWeight: '700' }}>{children}</Text>
  ) : children;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ borderRadius: 14, alignSelf: w ? 'stretch' : 'auto', transform: [{ scale: pressed ? 0.97 : 1 }] }, style]}
    >
      <View style={inner}>
        {kind === 'p' && (
          <LinearGradient colors={['#FFC63D', '#FFA800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        )}
        {content}
      </View>
    </Pressable>
  );
}

/** Square icon button (.ib) */
export function IconBtn({ onPress, children, style, label }: { onPress: () => void; children: React.ReactNode; style?: StyleProp<ViewStyle>; label: string }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, style, pressed && { opacity: 0.75 }]}
    >
      {children}
    </Pressable>
  );
}

/* ---------- Cards & small parts ---------- */
export function Card({ children, onPress, index = 0, style }: { children: React.ReactNode; onPress?: () => void; index?: number; style?: StyleProp<ViewStyle> }) {
  const { c, isDark } = useTheme();
  const box: ViewStyle = {
    backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 16, marginBottom: 12,
    elevation: isDark ? 3 : 2, shadowColor: isDark ? '#000' : '#3C321E',
  };
  const delay = index > 0 && index < 5 ? index * 40 : 0;
  return (
    <Enter duration={250} delay={delay}>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [box, style, pressed && { transform: [{ scale: 0.985 }] }]}>{children}</Pressable>
      ) : (
        <View style={[box, style]}>{children}</View>
      )}
    </Enter>
  );
}

export function Badge({ children, big, amber }: { children: React.ReactNode; big?: boolean; amber?: boolean }) {
  const { c } = useTheme();
  const s = big ? 72 : 48;
  return (
    <View style={{ width: s, height: s, borderRadius: big ? 22 : 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: amber ? c.ac : '#1B3556' }}>
      {!amber && <LinearGradient colors={['#1B3556', '#0F1B2D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />}
      {!amber && <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: big ? 22 : 15, borderWidth: 1, borderColor: 'rgba(255,255,255,.08)' }} />}
      <Text style={{ color: amber ? '#14181F' : '#FFC63D', fontWeight: '800', fontSize: big ? 22 : 13 }}>{children}</Text>
    </View>
  );
}

export function Pill({ active, children }: { active?: boolean; children: React.ReactNode }) {
  const { c } = useTheme();
  const fg = active ? c.ok : c.mut;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 99, backgroundColor: active ? c.okbg : c.bdg }}>
      {active && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: fg }} />}
      <Text style={{ fontSize: 13, fontWeight: '700', color: fg }}>{children}</Text>
    </View>
  );
}

export function KV({ rows, labelWidth }: { rows: [string, string][]; labelWidth?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ color: c.mut, fontWeight: '600', fontSize: 15, width: labelWidth }}>{k}</Text>
          <Text style={{ color: c.ink, fontSize: 15, flex: 1 }}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

export function StartEnd({ start, end, labels = ['Start', 'End'] }: { start: string; end: string; labels?: [string, string] }) {
  const { c } = useTheme();
  const cell = (label: string, val: string) => (
    <View style={{ flex: 1 }}>
      <Text style={{ color: c.mut, fontWeight: '600', fontSize: 13, marginBottom: 2 }}>{label}</Text>
      <Text style={{ color: c.ink, fontSize: 15, fontWeight: '600' }}>{val}</Text>
    </View>
  );
  return <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>{cell(labels[0], start)}{cell(labels[1], end)}</View>;
}

export function Empty({ badge, title, text, action }: { badge?: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 }}>
      {badge ? <View style={{ marginBottom: 14 }}><Badge big>{badge}</Badge></View> : null}
      <H3>{title}</H3>
      <Mut style={{ textAlign: 'center', marginTop: 6, marginBottom: action ? 16 : 0 }}>{text}</Mut>
      {action}
    </View>
  );
}

export function Page({ children, bottomInset, keyboard }: { children: React.ReactNode; bottomInset: number; keyboard?: boolean }) {
  return (
    <Enter style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 22, paddingHorizontal: 18, paddingBottom: 28 + bottomInset, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={keyboard ? 'on-drag' : 'none'}
      >
        {children}
      </ScrollView>
    </Enter>
  );
}

/* ---------- Inputs ---------- */
export function Field({ error, disabled, style, right, ...rest }: TextInputProps & { error?: boolean; disabled?: boolean; right?: React.ReactNode }) {
  const { c } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ margin: -4, borderWidth: 4, borderRadius: 18, borderColor: focus && !disabled ? 'rgba(255,176,32,.22)' : 'transparent' }}>
      <TextInput
        {...rest}
        editable={!disabled}
        onFocus={(e) => { setFocus(true); rest.onFocus?.(e); }}
        onBlur={(e) => { setFocus(false); rest.onBlur?.(e); }}
        placeholderTextColor={c.mut}
        style={[{
          minHeight: 52, paddingLeft: 14, paddingRight: right ? 56 : 14, borderWidth: 1.5, borderRadius: 14, fontSize: 16,
          borderColor: disabled ? 'transparent' : error ? c.bad : focus ? c.ac : c.line,
          backgroundColor: disabled ? c.bdg : c.card, color: c.ink,
        }, style]}
      />
      {right ? <View style={{ position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center' }}>{right}</View> : null}
    </View>
  );
}

function PickBox({ text, placeholder, onPress, disabled, error, right }: { text: string; placeholder: string; onPress: () => void; disabled?: boolean; error?: boolean; right?: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        minHeight: 52, paddingLeft: 14, paddingRight: right ? 6 : 14, borderWidth: 1.5, borderRadius: 14, flexDirection: 'row', alignItems: 'center',
        borderColor: disabled ? 'transparent' : error ? c.bad : c.line, backgroundColor: disabled ? c.bdg : c.card,
      }}
    >
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 16, color: text ? c.ink : c.mut }}>{text || placeholder}</Text>
      {right}
    </Pressable>
  );
}

function webInput(type: 'date' | 'time', value: string, onChange: (v: string) => void, disabled: boolean | undefined, error: boolean | undefined, c: ReturnType<typeof useTheme>['c']) {
  return React.createElement('input', {
    type, value, disabled, 'aria-label': type,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    style: {
      width: '100%', boxSizing: 'border-box', minHeight: 52, padding: '0 14px', fontSize: 16, fontFamily: 'inherit', borderRadius: 14,
      border: `1.5px solid ${disabled ? 'transparent' : error ? c.bad : c.line}`, background: disabled ? c.bdg : c.card, color: c.ink, colorScheme: 'auto',
    },
  });
}

export function DateField({ value, onChange, disabled, clearable, error }: { value: string; onChange: (v: string) => void; disabled?: boolean; clearable?: boolean; error?: boolean }) {
  const { c } = useTheme();
  if (Platform.OS === 'web') return webInput('date', value, onChange, disabled, error, c);
  const open = () =>
    DateTimePickerAndroid.open({
      value: value ? dateFromStr(value) : new Date(),
      mode: 'date',
      onChange: (e, d) => { if (e.type === 'set' && d) onChange(ld(d)); },
    });
  return (
    <PickBox
      text={value ? fD(value) : ''}
      placeholder="Select date"
      onPress={open}
      disabled={disabled}
      error={error}
      right={clearable && value && !disabled ? (
        <Pressable accessibilityLabel="Clear date" onPress={() => onChange('')} hitSlop={6} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: c.mut, fontSize: 18, fontWeight: '700' }}>✕</Text>
        </Pressable>
      ) : undefined}
    />
  );
}

export function TimeField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const { c } = useTheme();
  if (Platform.OS === 'web') return webInput('time', value, onChange, disabled, false, c);
  const open = () =>
    DateTimePickerAndroid.open({
      value: timeFromStr(value || '08:00'),
      mode: 'time',
      is24Hour: false,
      onChange: (e, d) => { if (e.type === 'set' && d) onChange(strFromTime(d)); },
    });
  return <PickBox text={fT(value)} placeholder="Select time" onPress={open} disabled={disabled} />;
}

export const Two = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ flexDirection: 'row', gap: 10 }, style]}>{children}</View>
);
export const Col = ({ children }: { children: React.ReactNode }) => <View style={{ flex: 1 }}>{children}</View>;
export { ClockIcon };
