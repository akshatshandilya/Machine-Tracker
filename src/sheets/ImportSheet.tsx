import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/theme';
import { useUi } from '../components/UiProvider';
import { useStore } from '../data/store';
import { Btn, Card, Col, ErrMsg, H2, Mut, Pill, Two } from '../components/ui';
import { parseWorkbook, ParseResult, machineKey } from '../import/parse';
import { buildPlan } from '../import/plan';
import { pickWorkbook } from '../import/pick';

type Stage = 'idle' | 'busy' | 'review' | 'error';

export function ImportSheet({ pid }: { pid: string }) {
  const { c } = useTheme();
  const { db, applyImport } = useStore();
  const ui = useUi();
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState('');
  const [res, setRes] = useState<ParseResult | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [replace, setReplace] = useState(false);
  const [err, setErr] = useState('');

  const existing = useMemo(() => db.machines.filter((m) => m.pid === pid), [db.machines, pid]);
  const plan = useMemo(
    () => (res ? buildPlan(res.machines, sel, pid, existing, db.readings, replace) : null),
    [res, sel, pid, existing, db.readings, replace],
  );
  const existingKeys = useMemo(() => new Set(existing.map((m) => machineKey(m.no, m.owner))), [existing]);
  // dates that already have a reading, among the selected machines (shown only when it matters)
  const conflicts = useMemo(
    () => (res ? buildPlan(res.machines, sel, pid, existing, db.readings, false).skippedExisting : 0),
    [res, sel, pid, existing, db.readings],
  );

  const fail = (m: string) => { setErr(m); setStage('error'); };
  const choose = async () => {
    try {
      const f = await pickWorkbook();
      if (!f) return;
      setFileName(f.name);
      setStage('busy');
      // let the loading state paint before the (synchronous) parse starts
      setTimeout(() => {
        try {
          const r = parseWorkbook(f.data);
          if (!r.machines.length) { fail('No readings were found in this file. Check that it is the machinery records workbook.'); return; }
          setRes(r);
          setSel(new Set(r.machines.map((m) => m.key)));
          setStage('review');
        } catch {
          fail('This file could not be read. Please choose an Excel (.xlsx) file.');
        }
      }, 80);
    } catch {
      fail('Something went wrong while opening the file. Please try again.');
    }
  };

  const toggle = (k: string) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });

  const run = () => {
    if (!plan || plan.readings.length === 0) return;
    applyImport(plan);
    ui.closeSheet();
    ui.toast(`${plan.readings.length} reading${plan.readings.length === 1 ? '' : 's'} imported`);
  };

  if (stage === 'idle' || stage === 'error') {
    return (
      <View>
        <H2>Import from Excel</H2>
        <Mut style={{ marginTop: 4, marginBottom: 16, lineHeight: 20 }}>
          Choose your machinery records workbook (.xlsx). You will see a summary and can pick machines before anything is saved.
        </Mut>
        {stage === 'error' && <View style={{ marginBottom: 12 }}><ErrMsg>{err}</ErrMsg></View>}
        <Two>
          <Col><Btn w onPress={ui.closeSheet}>Cancel</Btn></Col>
          <Col><Btn kind="p" w onPress={choose}>Choose File</Btn></Col>
        </Two>
      </View>
    );
  }
  if (stage === 'busy') {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 36 }}>
        <ActivityIndicator size="large" color={c.ac} />
        <Text style={{ color: c.ink, fontSize: 16, fontWeight: '700', marginTop: 16 }}>Reading Excel…</Text>
        <Mut style={{ marginTop: 4 }} >{fileName}</Mut>
      </View>
    );
  }

  const r = res!;
  const p = plan!;
  const nReadings = p.readings.length;
  return (
    <View>
      <H2>Import from Excel</H2>
      <Mut>{fileName}</Mut>

      <Card style={{ marginTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Mut>Readings ready to import</Mut>
          <Text style={{ fontSize: 26, fontWeight: '800', color: c.ink }}>{nReadings}</Text>
        </View>
        <Mut style={{ marginTop: 6 }}>
          {sel.size} of {r.machines.length} machines selected · {p.newMachines} new
        </Mut>
        <Mut style={{ marginTop: 4 }}>Times are not in the file, so 08:00 AM – 06:00 PM is used.</Mut>
        {r.skipped.repeated > 0 && <Mut style={{ marginTop: 4 }}>{r.skipped.repeated} repeated dates in the file were ignored.</Mut>}
      </Card>

      {conflicts > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Mut style={{ marginBottom: 8 }}>{conflicts} date{conflicts === 1 ? '' : 's'} already have a reading in the app:</Mut>
          <Two>
            <Col><Btn sm w kind={replace ? 's' : 'p'} onPress={() => setReplace(false)}>Keep existing</Btn></Col>
            <Col><Btn sm w kind={replace ? 'p' : 's'} onPress={() => setReplace(true)}>Replace</Btn></Col>
          </Two>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginHorizontal: 4 }}>
        <Text style={{ color: c.mut, fontSize: 12, fontWeight: '800', letterSpacing: 1.44 }}>MACHINES</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable onPress={() => setSel(new Set(r.machines.map((m) => m.key)))} hitSlop={8}><Text style={{ color: c.ink, fontWeight: '700', fontSize: 13 }}>All</Text></Pressable>
          <Pressable onPress={() => setSel(new Set())} hitSlop={8}><Text style={{ color: c.ink, fontWeight: '700', fontSize: 13 }}>None</Text></Pressable>
        </View>
      </View>

      {r.machines.map((m) => {
        const on = sel.has(m.key);
        const isNew = !existingKeys.has(m.key);
        return (
          <Pressable
            key={m.key}
            onPress={() => toggle(m.key)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8, opacity: on ? 1 : 0.55 }}
          >
            <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: on ? c.ac : c.line, backgroundColor: on ? c.ac : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {on && <Text style={{ color: c.acink, fontWeight: '800', fontSize: 14 }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: c.ink, fontSize: 15, fontWeight: '700' }}>{m.no}</Text>
              <Text numberOfLines={1} style={{ color: c.mut, fontSize: 13 }}>{m.type}{m.owner ? ' · ' + m.owner : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ color: c.ink, fontSize: 15, fontWeight: '800' }}>{m.readings.length}</Text>
              <Pill active={!isNew}>{isNew ? 'New' : 'Existing'}</Pill>
            </View>
          </Pressable>
        );
      })}

      <Two style={{ marginTop: 8 }}>
        <Col><Btn w onPress={ui.closeSheet}>Cancel</Btn></Col>
        <Col><Btn kind="p" w onPress={run}>{nReadings ? `Import ${nReadings}` : 'Nothing to import'}</Btn></Col>
      </Two>
    </View>
  );
}
