import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAVY } from '../theme';
import { useApp } from '../store/AppProvider';
import Logo from './Logo';
import { IBack, IMoon, IPen, IPlus, ISun } from './Icons';

/** Round amber-outlined back button. */
export const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Back"
    style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
      backgroundColor: pressed ? 'rgba(255,198,61,.28)' : 'rgba(255,198,61,.14)', borderWidth: 1.5, borderColor: 'rgba(255,198,61,.45)' })}>
    <IBack color="#FFC63D" />
  </Pressable>
);

/** Amber square action button (pen / plus) shown in the header. */
export const HeaderAction = ({ kind, onPress, label }: { kind: 'pen' | 'plus'; onPress: () => void; label: string }) => {
  const { c } = useApp();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ac, opacity: pressed ? 0.85 : 1 })}>
      {kind === 'pen' ? <IPen color={c.acink} /> : <IPlus color={c.acink} />}
    </Pressable>
  );
};

interface Props { title: string; subtitle: string; onBack?: () => void; right?: React.ReactNode; noTheme?: boolean }

export default function Header({ title, subtitle, onBack, right, noTheme }: Props) {
  const insets = useSafeAreaInsets();
  const { mode, toggleTheme, splashing } = useApp();
  return (
    <LinearGradient colors={NAVY} start={{ x: 0, y: 0 }} end={{ x: 0.45, y: 1 }}
      style={{ paddingTop: insets.top + 18, paddingBottom: 24, paddingHorizontal: 18, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, elevation: 8, zIndex: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {onBack ? <BackButton onPress={onBack} /> : <View style={{ opacity: splashing ? 0 : 1 }}><Logo size={42} /></View>}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24, letterSpacing: -0.2 }}>{title}</Text>
          <Text numberOfLines={1} style={{ color: '#9FB2CF', fontSize: 13, lineHeight: 16, letterSpacing: 0.2 }}>{subtitle}</Text>
        </View>
        {right}
        {!noTheme && (
          <Pressable onPress={toggleTheme} accessibilityRole="button" accessibilityLabel="Switch light or dark mode"
            style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)' }}>
            {mode === 'dark' ? <ISun color="#fff" size={18} /> : <IMoon color="#fff" size={18} />}
          </Pressable>
        )}
      </View>
    </LinearGradient>
  );
}
