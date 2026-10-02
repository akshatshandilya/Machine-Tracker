import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Field, Mut, Txt } from '../components/UI';
import { DateField, TimeField } from '../components/PickerFields';
import { IPen } from '../components/Icons';
import Sheet, { useSheet } from '../components/Sheet';
import { f1, fD, num, today } from '../lib/dates';
import { prevEnd } from '../lib/machinery';
import { useApp } from '../store/AppProvider';
import { Machine, Reading } from '../types';
import { Col, ConfirmBody, H2, Row2 } from './common';

type Mode = 'add' | 'view' | 'edit' | 'confirm';

function Body({ machine, reading }: { machine: Machine; reading?: Reading }) {
  const { c, readings, saveReading, deleteReading, toast } = useApp();
  const { close } = useSheet();
  const mine = readings.filter((r) => r.machineId === machine.id);
  const carry = (date: string) => { const p = prevEnd(mine, date, reading?.id); return { v: p ? String(p.endReading) : '', hint: p ? `Carried from ${fD(p.date)}` : '' }; };

  const [mode, setMode] = useState<Mode>(reading ? 'view' : 'add');
  const [f, setF] = useState(() => {
    if (reading) return { date: reading.date, sr: String(reading.startReading), st: reading.startTime, er: String(reading.endReading), et: reading.endTime, hint: '' };
    const d = today(), k = carry(d);
    return { date: d, sr: k.v, st: '08:00', er: k.v, et: '18:00', hint: k.hint };
  });
  const [err, setErr] = useState('');
  const touched = useRef({ sr: false, er: false });
  const ro = mode === 'view';
  const set = (p: Partial<typeof f>) => { setF((x) => ({ ...x, ...p })); setErr(''); };

  const onDate = (date: string) => {
    if (mode !== 'add') { set({ date }); return; }
    const k = carry(date);
    set({ date, ...(touched.current.sr ? {} : { sr: k.v, hint: k.hint }), ...(touched.current.er ? {} : { er: k.v }) });
  };

  const a = num(f.sr), b = num(f.er);
  const total = isNaN(a) || isNaN(b) ? '—' : f1(Math.max(0, b - a));

  const save = async () => {
    let m = '';
    if (!f.date || !f.st || !f.et || isNaN(a) || isNaN(b)) m = 'Please fill in all fields.';
    else if (b < a) m = 'End reading cannot be less than start reading.';
    else if (f.et <= f.st) m = 'End time must be after start time.';
    if (m) { setErr(m); return; }
    const ok = await saveReading({ machineId: machine.id, date: f.date, startReading: a, startTime: f.st, endReading: b, endTime: f.et }, reading?.id);
    if (ok) { close(); toast(reading ? 'Reading updated' : 'Daily reading added'); }
  };

  if (mode === 'confirm' && reading) {
    return <ConfirmBody title="Delete this reading?" message="This cannot be undone."
      onCancel={() => setMode('edit')} onConfirm={async () => { close(); if (await deleteReading(reading.id)) toast('Reading deleted'); }} />;
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <H2>{reading ? (ro ? 'Reading Details' : 'Edit Reading') : 'Add Reading'}</H2>
        {ro && (
          <Pressable onPress={() => setMode('edit')} accessibilityRole="button" accessibilityLabel="Edit reading"
            style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
            <IPen color={c.acink} />
          </Pressable>
        )}
      </View>
      <Mut>{machine.type} · {machine.vehicleNo}</Mut>
      <DateField label="Date" value={f.date} onChange={onDate} disabled={ro} />
      <Row2>
        <Col>
          <Field label="Start Reading" value={f.sr} editable={!ro} keyboardType="decimal-pad" placeholder="1250" hint={f.hint}
            onChangeText={(t) => { touched.current.sr = true; set({ sr: t }); }} />
        </Col>
        <Col><TimeField label="Start Time" value={f.st} onChange={(st) => set({ st })} disabled={ro} /></Col>
      </Row2>
      <Row2>
        <Col>
          <Field label="End Reading" value={f.er} editable={!ro} keyboardType="decimal-pad" placeholder="1268"
            onChangeText={(t) => { touched.current.er = true; set({ er: t }); }} />
        </Col>
        <Col><TimeField label="End Time" value={f.et} onChange={(et) => set({ et })} disabled={ro} /></Col>
      </Row2>
      <View style={{ marginTop: 16, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Mut>Total Utilisation:</Mut>
        <Txt style={{ fontSize: 22, fontWeight: '800' }}>{total}</Txt>
      </View>
      {err ? <Text style={{ color: c.bad, fontSize: 13, fontWeight: '600', marginTop: 8 }}>{err}</Text> : null}
      {ro ? (
        <Button label="Close" variant="secondary" full onPress={close} style={{ marginTop: 12 }} />
      ) : (
        <>
          <Row2>
            <Col><Button label="Cancel" variant="secondary" full onPress={close} style={{ marginTop: 12 }} /></Col>
            <Col><Button label="Save Reading" full onPress={save} style={{ marginTop: 12 }} /></Col>
          </Row2>
          {reading && <Button label="Delete Reading" variant="ghost" tint={c.bad} full onPress={() => setMode('confirm')} style={{ marginTop: 6 }} />}
        </>
      )}
    </View>
  );
}

export default function ReadingFormSheet({ machine, reading, onClose }: { machine: Machine; reading?: Reading; onClose: () => void }) {
  return <Sheet onClose={onClose}><Body machine={machine} reading={reading} /></Sheet>;
}
