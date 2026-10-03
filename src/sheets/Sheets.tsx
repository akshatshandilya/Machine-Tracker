import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/theme';
import { useUi } from '../components/UiProvider';
import { useStore } from '../data/store';
import { Badge, Btn, Card, Col, DateField, ErrMsg, Field, H2, H3, Hint, IconBtn, Label, Mut, Pill, StartEnd, TimeField, Two } from '../components/ui';
import { PenIcon } from '../components/Icons';
import { ab, f1, fD, today, TYPES, unit } from '../utils/format';
import { firstStart, getHist, prevEnd, toNum } from '../data/logic';
import { Machine, Reading } from '../data/types';
import { exportReadings } from '../utils/excel';
import { parseFuel } from '../import/parse';
import { Pressable } from 'react-native';

/* ---- Add Project ---- */
export function AddProjectSheet() {
  const { addProject } = useStore();
  const ui = useUi();
  const [name, setName] = useState('');
  const [err, setErr] = useState(false);
  const save = () => {
    const v = name.trim();
    if (!v) { setErr(true); return; }
    addProject(v);
    ui.closeSheet();
    ui.toast('Project saved');
  };
  return (
    <View>
      <H2>Add Project</H2>
      <Label>Project Name</Label>
      <Field value={name} onChangeText={(t) => { setName(t); setErr(false); }} placeholder="Mumbai–Pune Highway Package 4" error={err} />
      {err && <ErrMsg>Please enter a project name.</ErrMsg>}
      <Btn kind="p" w style={{ marginTop: 16 }} onPress={save}>Save Project</Btn>
    </View>
  );
}

/* ---- Select Machinery ---- */
export function SelectMachinerySheet({ pid }: { pid: string }) {
  const { addMachine } = useStore();
  const ui = useUi();
  const [q, setQ] = useState('');
  const list = [...TYPES].sort((a, b) => a.localeCompare(b)).filter((t) => t.toLowerCase().includes(q.toLowerCase()));
  return (
    <View>
      <H2>Select Machinery</H2>
      <View style={{ marginVertical: 10 }}>
        <Field value={q} onChangeText={setQ} placeholder="Search machinery..." returnKeyType="search" />
      </View>
      {list.map((t) => (
        <Card
          key={t}
          style={{ marginBottom: 8 }}
          onPress={() => { addMachine(pid, t); ui.closeSheet(); ui.toast(`${t} added — tap Add Details`); }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Badge>{ab(t)}</Badge>
            <View style={{ flex: 1 }}><H3>{t}</H3></View>
            <Mut>{unit(t)}</Mut>
          </View>
        </Card>
      ))}
    </View>
  );
}

/* ---- Confirm (delete) ---- */
export function ConfirmSheet({ title, body, onConfirm }: { title: string; body: string; onConfirm: () => void }) {
  const ui = useUi();
  return (
    <View>
      <H2>{title}</H2>
      <Mut style={{ marginTop: 6, marginBottom: 14, lineHeight: 20 }}>{body}</Mut>
      <Two>
        <Col><Btn w onPress={ui.closeSheet}>Cancel</Btn></Col>
        <Col><Btn kind="d" w onPress={onConfirm}>Delete</Btn></Col>
      </Two>
    </View>
  );
}

/* ---- Usage history ---- */
export function UsageHistorySheet({ m }: { m: Machine }) {
  const ui = useUi();
  const hs = getHist(m).map((h, i) => ({ h, i })).reverse();
  return (
    <View>
      <H2>Usage History</H2>
      <Mut style={{ marginBottom: 14 }}>{m.type} · {m.no}</Mut>
      {hs.map(({ h, i }) => {
        const n = Math.round((new Date((h.e || today()) + 'T12:00:00').getTime() - new Date(h.s + 'T12:00:00').getTime()) / 864e5) + 1;
        const dd = n + (n === 1 ? ' day' : ' days');
        return (
          <Card key={h.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <H3>Period {i + 1}</H3>
              <Pill active={!h.e}>{h.e ? dd : 'Ongoing · ' + dd}</Pill>
            </View>
            <StartEnd start={fD(h.s)} end={h.e ? fD(h.e) : 'Ongoing'} />
          </Card>
        );
      })}
      <Btn w onPress={ui.closeSheet}>Close</Btn>
    </View>
  );
}

/* ---- Export to Excel ---- */
export function ExportSheet({ m }: { m: Machine }) {
  const { db } = useStore();
  const ui = useUi();
  const [f, setF] = useState(firstStart(m));
  const [t, setT] = useState(today());
  const go = async () => {
    if (f && t && f > t) { ui.toast('The From date must be on or before the To date'); return; }
    ui.closeSheet();
    try {
      const r = await exportReadings(db, m, f, t);
      if (r === 'range') ui.toast('The From date must be on or before the To date');
      else if (r === 'empty') ui.toast('No readings in this date range');
      else if (r === 'nosharing') ui.toast('Sharing is not available on this device');
      else if (r === 'cancelled') return;
      else ui.toast('Excel file ready');
    } catch {
      ui.toast('Something went wrong while exporting. Please try again.');
    }
  };
  return (
    <View>
      <H2>Export to Excel</H2>
      <Mut>Select the date range to export</Mut>
      <Two>
        <Col><Label>From</Label><DateField value={f} onChange={setF} /></Col>
        <Col><Label>To</Label><DateField value={t} onChange={setT} /></Col>
      </Two>
      <Hint>Defaults: machine start date to today. Days with no reading appear as blank rows.</Hint>
      <Two style={{ marginTop: 16 }}>
        <Col><Btn w onPress={ui.closeSheet}>Cancel</Btn></Col>
        <Col><Btn kind="p" w onPress={go}>Download</Btn></Col>
      </Two>
    </View>
  );
}

/* ---- Add / view / edit reading ---- */
export function ReadingSheet({ m, reading }: { m: Machine; reading?: Reading }) {
  const { c } = useTheme();
  const { db, addReading, updateReading, deleteReading } = useStore();
  const ui = useUi();
  const [ro, setRo] = useState(!!reading);
  const pv0 = reading ? undefined : prevEnd(db, m.id, today());
  const [date, setDate] = useState(reading?.date ?? today());
  const [sr, setSr] = useState(reading ? String(reading.sr) : pv0 ? String(pv0.er) : '');
  const [st, setSt] = useState(reading?.st ?? '08:00');
  const [er, setEr] = useState(reading ? String(reading.er) : pv0 ? String(pv0.er) : '');
  const [et, setEt] = useState(reading?.et ?? '18:00');
  const [fuel, setFuel] = useState(reading?.fuel != null ? String(reading.fuel) : '');
  const [txt, setTxt] = useState({ sr: typeof reading?.sr === 'string' && reading.sr !== '', er: typeof reading?.er === 'string' && reading.er !== '' });
  const [hint, setHint] = useState(pv0 ? `Carried from ${fD(pv0.date)}` : '');
  const [touched, setTouched] = useState({ sr: false, er: false });
  const [err, setErr] = useState('');

  const a = toNum(sr);
  const b = toNum(er);
  const total = a === null || b === null ? '—' : f1(Math.max(0, b - a));
  // numeric keyboard by default; normal keyboard when the value is text (e.g. "Working")
  const kb = (v: string, on: boolean) => (on || /[a-z]/i.test(v) ? 'default' : 'decimal-pad');
  const toggle = (k: 'sr' | 'er') =>
    ro ? undefined : (
      <Pressable accessibilityLabel={txt[k] ? 'Number keyboard' : 'Text keyboard'} onPress={() => setTxt((x) => ({ ...x, [k]: !x[k] }))} style={{ minWidth: 44, height: 40, borderRadius: 10, backgroundColor: c.bdg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.mut, fontWeight: '800', fontSize: 13 }}>{txt[k] ? '123' : 'Aa'}</Text>
      </Pressable>
    );

  const onDate = (d: string) => {
    setDate(d);
    if (reading) return;
    const pv = prevEnd(db, m.id, d);
    const v = pv ? String(pv.er) : '';
    if (!touched.sr) { setSr(v); setHint(pv ? `Carried from ${fD(pv.date)}` : ''); }
    if (!touched.er) setEr(v);
  };

  const save = () => {
    let msg = '';
    const sv = sr.trim();
    const ev = er.trim();
    const fp = parseFuel(fuel.trim());
    const fv = fp === 'bad' ? null : fp;
    if (!date || !st || !et) msg = 'Please fill in all fields.';
    else if (!sv && !ev && !fuel.trim()) msg = 'Enter a start or end reading, or a diesel/petrol quantity.';
    else if (fp === 'bad') msg = 'Diesel/Petrol quantity must be a number.';
    else if (a !== null && b !== null && b < a) msg = 'End reading cannot be less than start reading.';
    else if (a !== null && b !== null && et <= st) msg = 'End time must be after start time.';
    if (msg) { setErr(msg); return; }
    const v = { date, sr: a !== null ? a : sv, st, er: b !== null ? b : ev, et, fuel: fv };
    if (reading) updateReading(reading.id, v);
    else addReading({ mid: m.id, ...v });
    ui.closeSheet();
    ui.toast(reading ? 'Reading updated' : 'Daily reading added');
  };

  const askDelete = () =>
    ui.openSheet(
      <ConfirmSheet
        title="Delete this reading?"
        body="This cannot be undone."
        onConfirm={() => { deleteReading(reading!.id); ui.closeSheet(); ui.toast('Reading deleted'); }}
      />,
    );

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <H2>{reading ? (ro ? 'Reading Details' : 'Edit Reading') : 'Add Reading'}</H2>
        {ro && (
          <IconBtn label="Edit reading" onPress={() => setRo(false)} style={{ backgroundColor: c.ac }}>
            <PenIcon color={c.acink} />
          </IconBtn>
        )}
      </View>
      <Mut>{m.type} · {m.no}</Mut>
      <Label>Date</Label>
      <DateField value={date} onChange={onDate} disabled={ro} />
      <Two>
        <Col>
          <Label>Start Reading</Label>
          <Field disabled={ro} right={toggle('sr')} keyboardType={kb(sr, txt.sr)} value={sr} placeholder="1250" onChangeText={(t) => { setSr(t); setTouched((x) => ({ ...x, sr: true })); }} />
          <Hint>{hint}</Hint>
        </Col>
        <Col><Label>Start Time</Label><TimeField value={st} onChange={setSt} disabled={ro} /></Col>
      </Two>
      <Two>
        <Col>
          <Label>End Reading</Label>
          <Field disabled={ro} right={toggle('er')} keyboardType={kb(er, txt.er)} value={er} placeholder="1268" onChangeText={(t) => { setEr(t); setTouched((x) => ({ ...x, er: true })); }} />
        </Col>
        <Col><Label>End Time</Label><TimeField value={et} onChange={setEt} disabled={ro} /></Col>
      </Two>
      <Label>Diesel/Petrol Quantity <Text style={{ fontWeight: '400' }}>(optional)</Text></Label>
      <Field disabled={ro} keyboardType="decimal-pad" value={fuel} placeholder="50" onChangeText={setFuel} />
      <Card style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Mut>Total Utilisation:</Mut>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.ink }}>{total}</Text>
        </View>
      </Card>
      {err ? <ErrMsg>{err}</ErrMsg> : null}
      {ro ? (
        <Btn w style={{ marginTop: 12 }} onPress={ui.closeSheet}>Close</Btn>
      ) : (
        <Two style={{ marginTop: 12 }}>
          <Col><Btn w onPress={ui.closeSheet}>Cancel</Btn></Col>
          <Col><Btn kind="p" w onPress={save}>Save Reading</Btn></Col>
        </Two>
      )}
      {reading && !ro && <Btn kind="g" w color={c.bad} style={{ marginTop: 6 }} onPress={askDelete}>Delete Reading</Btn>}
    </View>
  );
}
