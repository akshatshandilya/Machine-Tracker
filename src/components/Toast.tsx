import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store/AppProvider';

export default function Toast() {
  const { toastMsg } = useApp();
  const insets = useSafeAreaInsets();
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toastMsg) return;
    v.setValue(0);
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(v, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [toastMsg, v]);

  if (!toastMsg) return null;
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 20, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
      <View style={{ backgroundColor: '#0F1B2D', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 12 }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFC63D', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#1A1200', fontSize: 13, fontWeight: '800' }}>✓</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 }}>{toastMsg.text}</Text>
      </View>
    </Animated.View>
  );
}
