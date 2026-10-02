import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Header from '../components/Header';
import { Button, Card, Empty, Mut, StartEnd, Txt } from '../components/UI';
import { f1, fD } from '../lib/dates';
import { sortReadings } from '../lib/machinery';
import { useNav } from '../navigation/nav';
import ExportSheet from '../sheets/ExportSheet';
import ReadingFormSheet from '../sheets/ReadingFormSheet';
import { useApp } from '../store/AppProvider';
import { Reading } from '../types';

const COLS = [1.5, 1, 1, 1.25];

export default function ReadingsScreen({ machineId }: { machineId: string }) {
  const { c, machines, readings } = useApp();
  const nav = useNav();
  const m = machines.find((x) => x.id === machineId);
  const [form, setForm] = useState<{ reading?: Reading } | null>(null);
  const [exporting, setExporting] = useState(false);
  const rs = useMemo(() => sortReadings(readings.filter((x) => x.machineId === machineId)), [readings, machineId]);
  if (!m) return null;
  const total = rs.reduce((a, r) => a + (r.endReading - r.startReading), 0);

  const cell = (i: number, text: string, opts: { right?: boolean; bold?: boolean } = {}) => (
    <Text style={{ flex: COLS[i], textAlign: opts.right ? 'right' : 'left', color: c.ink, fontSize: 15, fontWeight: opts.bold ? '800' : '500' }}>{text}</Text>
  );

  const top = (
    <View>
      <Card>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}><Mut style={{ fontWeight: '600', width: 96 }}>Owner</Mut><Txt style={{ fontSize: 15, flex: 1 }}>{m.owner}</Txt></View>
          <View style={{ flexDirection: 'row', gap: 12 }}><Mut style={{ fontWeight: '600', width: 96 }}>Vehicle Type</Mut><Txt style={{ fontSize: 15, flex: 1 }}>{m.vehicleType || '—'}</Txt></View>
        </View>
        <StartEnd la="Start Date" lb="End Date" a={fD(m.startDate)} b={m.endDate ? fD(m.endDate) : 'Ongoing'} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.line }}>
          <Mut>Total Utilisation</Mut>
          <Txt style={{ fontSize: 26, fontWeight: '800' }}>{f1(total)}</Txt>
        </View>
      </Card>
      {rs.length > 0 && (
        <>
          <Button label="⬇  Export to Excel" variant="secondary" full onPress={() => setExporting(true)} style={{ marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 10, backgroundColor: c.bdg, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: c.line, borderBottomWidth: 0 }}>
            {['Date', 'Start', 'End', 'Total Utilisation'].map((h, i) => (
              <Text key={h} style={{ flex: COLS[i], textAlign: i === 0 ? 'left' : 'right', color: c.mut, fontSize: 11, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' }}>{h}</Text>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={m.type} subtitle={m.vehicleNo} onBack={nav.pop} noTheme
        right={<Button label="+ Add Reading" small onPress={() => setForm({})} />} />
      <FlatList
        data={rs}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
        ListHeaderComponent={top}
        ListEmptyComponent={
          <Empty badge="0" title="No Daily Readings" text="Add today's machinery reading to begin tracking usage.">
            <Button label="+ Add Reading" onPress={() => setForm({})} />
          </Empty>
        }
        ListFooterComponent={rs.length ? <Mut style={{ fontSize: 13, marginTop: 10 }}>Tap a row to view, edit or delete a reading</Mut> : undefined}
        renderItem={({ item: r, index }) => {
          const last = index === rs.length - 1;
          return (
            <Pressable onPress={() => setForm({ reading: r })}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, backgroundColor: pressed ? c.bdg : c.card,
                borderWidth: 1, borderBottomWidth: last ? 1 : 0, borderTopWidth: 1, borderColor: c.line, borderTopColor: c.line,
                borderBottomLeftRadius: last ? 20 : 0, borderBottomRightRadius: last ? 20 : 0 })}>
              {cell(0, fD(r.date), { bold: true })}
              {cell(1, String(r.startReading), { right: true })}
              {cell(2, String(r.endReading), { right: true })}
              {cell(3, f1(r.endReading - r.startReading), { right: true, bold: true })}
            </Pressable>
          );
        }}
      />
      {form && <ReadingFormSheet machine={m} reading={form.reading} onClose={() => setForm(null)} />}
      {exporting && <ExportSheet machine={m} onClose={() => setExporting(false)} />}
    </View>
  );
}
