import React, { createRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { Logo } from './Logo';
import { BackIcon, MoonIcon, SunIcon } from './Icons';
import { useSplashActive } from '../splash/splashState';

/** Target the splash logo flies to. */
export const headerLogoRef = createRef<View>();

export function Header({ title, sub, back, extra, noTheme, onBack, wrapSub }: {
  title: string; sub?: string; back?: boolean; extra?: React.ReactNode; noTheme?: boolean; onBack?: () => void; wrapSub?: boolean;
}) {
  const { isDark, toggle } = useTheme();
  const insets = useSafeAreaInsets();
  const splash = useSplashActive();
  return (
    <View style={{ zIndex: 2, elevation: 6, shadowColor: '#0F1B2D', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, backgroundColor: '#0F1B2D' }}>
      <LinearGradient
        colors={['#0F1B2D', '#1B3556']}
        start={{ x: 0.35, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: insets.top + 18, paddingBottom: 24,
          minHeight: 76 + insets.top, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        }}
      >
        {back ? (
          <Pressable
            accessibilityLabel="Back"
            onPress={onBack}
            style={({ pressed }) => ({
              width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(255,198,61,.28)' : 'rgba(255,198,61,.14)', borderWidth: 1.5, borderColor: 'rgba(255,198,61,.45)',
            })}
          >
            <BackIcon color="#FFC63D" />
          </Pressable>
        ) : (
          <View ref={headerLogoRef} collapsable={false} style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', opacity: splash ? 0 : 1 }}>
            <Logo size={42} id="hdr" />
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.2 }}>{title}</Text>
          {sub ? <Text numberOfLines={wrapSub ? 2 : 1} style={{ color: '#9FB2CF', fontSize: 13, letterSpacing: 0.26 }}>{sub}</Text> : null}
        </View>
        {extra}
        {!noTheme && (
          <Pressable
            accessibilityLabel="Switch light or dark mode"
            onPress={toggle}
            style={({ pressed }) => ({
              width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)',
            })}
          >
            {isDark ? <SunIcon size={18} color="#fff" /> : <MoonIcon size={18} color="#fff" />}
          </Pressable>
        )}
      </LinearGradient>
    </View>
  );
}
