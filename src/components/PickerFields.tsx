import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { dateToTime, fD, fT, parseISO, timeToDate, toISO, today } from '../lib/dates';
import { useApp } from '../store/AppProvider';
import { labelStyle } from './UI';

interface Base { label: string; disabled?: boolean; error?: boolean }

function Shell({ label, text, placeholder, disabled, error, onPress, onClear }: Base & { text: string; placeholder: string; onPress: () => void; onClear?: () => void }) {
  const { c } = useApp();
  return (
    <View>
      <Text style={labelStyle(c)}>{label}</Text>
      <Pressable onPress={disabled ? undefined : onPress} accessibilityRole="button" accessibilityLabel={label}
        style={{ minHeight: 52, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: disabled ? c.bdg : c.card, borderColor: error ? c.bad : disabled ? 'transparent' : c.line }}>
        <Text style={{ fontSize: 16, color: text ? c.ink : c.mut }}>{text || placeholder}</Text>
        {onClear && text && !disabled ? <Pressable hitSlop={12} onPress={onClear}><Text style={{ color: c.mut, fontSize: 18, fontWeight: '700' }}>✕</Text></Pressable> : null}
      </Pressable>
    </View>
  );
}

export function DateField({ label, value, onChange, onClear, disabled, error }: Base & { value: string; onChange: (v: string) => void; onClear?: () => void }) {
  const [ios, setIos] = useState(false);
  const open = () => {
    const v = parseISO(value || today());
    if (Platform.OS === 'android') DateTimePickerAndroid.open({ value: v, mode: 'date', onChange: (e, d) => { if (e.type === 'set' && d) onChange(toISO(d)); } });
    else setIos(true);
  };
  return (
    <View>
      <Shell label={label} text={value ? fD(value) : ''} placeholder="Select date" disabled={disabled} error={error} onPress={open} onClear={onClear} />
      {ios && <DateTimePicker value={parseISO(value || today())} mode="date" display="inline" onChange={(e, d) => { setIos(false); if (e.type === 'set' && d) onChange(toISO(d)); }} />}
    </View>
  );
}

export function TimeField({ label, value, onChange, disabled }: Base & { value: string; onChange: (v: string) => void }) {
  const [ios, setIos] = useState(false);
  const open = () => {
    if (Platform.OS === 'android') DateTimePickerAndroid.open({ value: timeToDate(value || '08:00'), mode: 'time', is24Hour: false, onChange: (e, d) => { if (e.type === 'set' && d) onChange(dateToTime(d)); } });
    else setIos(true);
  };
  return (
    <View>
      <Shell label={label} text={value ? fT(value) : ''} placeholder="Select time" disabled={disabled} onPress={open} />
      {ios && <DateTimePicker value={timeToDate(value || '08:00')} mode="time" display="spinner" onChange={(e, d) => { setIos(false); if (e.type === 'set' && d) onChange(dateToTime(d)); }} />}
    </View>
  );
}
