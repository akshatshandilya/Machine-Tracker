import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';

interface Ui {
  toast: (msg: string) => void;
  openSheet: (node: React.ReactNode) => void;
  closeSheet: () => void;
  hasSheet: () => boolean;
}
const Ctx = createContext<Ui>(null as unknown as Ui);
export const useUi = () => useContext(Ctx);

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const up = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    Animated.timing(up, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [fade, up]);
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 20, elevation: 20 }}>
      <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(8,14,26,.55)', opacity: fade }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={{
          maxHeight: '88%', backgroundColor: c.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 18,
          elevation: 24, shadowColor: '#000',
          transform: [{ translateY: up.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
        }}
      >
        <View style={{ width: 40, height: 5, borderRadius: 9, backgroundColor: c.line, alignSelf: 'center', marginBottom: 12 }} />
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function ToastView({ msg }: { msg: string }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [msg, v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 16, right: 16, bottom: 20 + insets.bottom, zIndex: 40, elevation: 40, backgroundColor: c.dk, borderRadius: 16,
        paddingVertical: 14, paddingLeft: 20, paddingRight: 18, flexDirection: 'row', alignItems: 'center', opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
        shadowColor: '#000',
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Text style={{ color: '#1A1200', fontSize: 13, fontWeight: '800' }}>✓</Text>
      </View>
      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16, flex: 1 }}>{msg}</Text>
    </Animated.View>
  );
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  const [sheet, setSheet] = useState<React.ReactNode>(null);
  const sheetRef = useRef<React.ReactNode>(null);
  const [toastMsg, setToastMsg] = useState<{ k: number; t: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [kb, setKb] = useState(0);
  const kbRef = useRef(0);
  const box = useRef<View>(null);

  const toast = useCallback((t: string) => {
    setToastMsg({ k: Date.now(), t });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);
  const openSheet = useCallback((n: React.ReactNode) => { sheetRef.current = n; setSheet(n); }, []);
  const closeSheet = useCallback(() => { sheetRef.current = null; setSheet(null); }, []);
  const hasSheet = useCallback(() => sheetRef.current != null, []);

  // Keep content above the soft keyboard (works with or without OS window resizing).
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      box.current?.measureInWindow((_x, y, _w, h) => {
        const overlap = Math.max(0, y + h + kbRef.current - e.endCoordinates.screenY);
        kbRef.current = overlap;
        setKb(overlap);
      });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => { kbRef.current = 0; setKb(0); });
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const value = useMemo(() => ({ toast, openSheet, closeSheet, hasSheet }), [toast, openSheet, closeSheet, hasSheet]);
  return (
    <Ctx.Provider value={value}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <View ref={box} collapsable={false} style={{ flex: 1 }}>
          {children}
          {sheet != null && <Sheet onClose={closeSheet}>{sheet}</Sheet>}
          {toastMsg && <ToastView key={toastMsg.k} msg={toastMsg.t} />}
        </View>
        <View style={{ height: kb }} />
      </View>
    </Ctx.Provider>
  );
}

/** Closes an open sheet on Android back press. Returns true if handled. */
export function useSheetBack(onBack: () => boolean) {
  useEffect(() => {
    const s = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => s.remove();
  }, [onBack]);
}
