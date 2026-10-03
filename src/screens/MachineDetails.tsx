import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useStore } from '../data/store';
import { useUi } from '../components/UiProvider';
import { Header } from '../components/Header';
import { Btn, Col, DateField, ErrMsg, Field, Hint, IconBtn, Label, Page, Two } from '../components/ui';
import { ClockIcon, PenIcon } from '../components/Icons';
import { ConfirmSheet, UsageHistorySheet } from '../sheets/Sheets';
import { hasD, isActive, saveDetails, toggleStatus } from '../data/logic';
import { Machine, MachineForm } from '../data/types';
import { today } from '../utils/format';
import { Nav } from '../nav';

const init = (m: Machine) => ({
  vt: m.vt,
  no: m.no,
  ow: m.owner,
  sd: m.sd || today(),
  ed: hasD(m) ? m.ed : m.ed || today(),
});

export function MachineDetails({ mid, nav }: { mid: string; nav: Nav }) {
  const { c } = useTheme();
  const { db, updateMachine, deleteMachine } = useStore();
  const ui = useUi();
  const insets = useSafeAreaInsets();
  const m = db.machines.find((x) => x.id === mid);
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState(() => (m ? init(m) : { vt: '', no: '', ow: '', sd: '', ed: '' }));
  const [err, setErr] = useState({ no: false, ow: false, sd: false, ed: false });
  if (!m) return null;

  const ro = hasD(m) && !edit;
  const act = isActive(m);
  const set = (k: keyof typeof f) => (v: string) => { setF((x) => ({ ...x, [k]: v })); setErr((e) => ({ ...e, [k]: false })); };

  const collect = (): MachineForm | null => {
    const no = f.no.trim().toUpperCase();
    const ow = f.ow.trim();
    const e = { no: !no, ow: !ow, sd: !f.sd, ed: !!(f.ed && f.sd && f.ed < f.sd) };
    setErr(e);
    if (e.sd) ui.toast('Start date is required');
    if (e.ed) ui.toast('End date cannot be before start date');
    if (e.no || e.ow || e.sd || e.ed) return null;
    return { vt: f.vt.trim(), no, owner: ow, sd: f.sd, ed: f.ed };
  };

  const save = () => {
    const v = collect();
    if (!v) return;
    updateMachine(saveDetails(m, v));
    nav.back();
    ui.toast('Machinery details saved');
  };
  const stat = () => {
    const v = collect();
    if (!v) return;
    const r = toggleStatus(m, v);
    updateMachine(r.machine);
    setF(init(r.machine));
    ui.toast(r.toast);
  };
  const nr = db.readings.filter((x) => x.mid === m.id).length;
  const del = () =>
    ui.openSheet(
      <ConfirmSheet
        title="Delete this machine?"
        body={`${m.type}${m.no ? ' · ' + m.no : ''} will be permanently deleted, along with its usage history and ${nr} ${nr === 1 ? 'reading' : 'readings'}. This cannot be undone.`}
        onConfirm={() => { deleteMachine(m.id); ui.closeSheet(); nav.back(); ui.toast('Machine deleted'); }}
      />,
    );

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Machine Details"
        sub={m.type}
        back
        onBack={nav.back}
        extra={ro ? <IconBtn label="Edit details" onPress={() => setEdit(true)} style={{ backgroundColor: c.ac }}><PenIcon color={c.acink} /></IconBtn> : undefined}
      />
      <Page bottomInset={insets.bottom} keyboard>
        <Label first>Vehicle Type</Label>
        <Field disabled={ro} value={f.vt} onChangeText={set('vt')} placeholder="Backhoe Loader" />
        <Label>Vehicle No. *</Label>
        <Field disabled={ro} value={f.no} onChangeText={set('no')} placeholder="MH 12 AB 1234" autoCapitalize="characters" error={err.no} />
        {err.no && <ErrMsg>Vehicle number is required.</ErrMsg>}
        <Label>Owner's Name *</Label>
        <Field disabled={ro} value={f.ow} onChangeText={set('ow')} placeholder="ABC Earth Movers" error={err.ow} />
        {err.ow && <ErrMsg>Owner's name is required.</ErrMsg>}
        <Two>
          <Col>
            <Label>Start Date *</Label>
            <DateField value={f.sd} onChange={set('sd')} disabled={ro} error={err.sd} />
          </Col>
          <Col>
            <Label>End Date{ro ? '' : ' (optional)'}</Label>
            <DateField value={f.ed} onChange={set('ed')} disabled={ro} clearable error={err.ed} />
          </Col>
        </Two>
        <Hint>
          {ro
            ? m.ed ? '' : 'Ongoing — no end date set.'
            : 'Clear the End Date if the machine is still deployed — it will show as Ongoing.'}
        </Hint>

        {hasD(m) && !ro && (
          <Btn w color={act ? c.bad : c.ok} style={{ marginTop: 22 }} onPress={stat}>
            {act ? 'Mark as Inactive' : 'Mark as Active'}
          </Btn>
        )}
        {hasD(m) && (
          <Btn w style={{ marginTop: ro ? 22 : 12 }} onPress={() => ui.openSheet(<UsageHistorySheet m={m} />)}>
            <ClockIcon color={c.ink} />
            <Text style={{ color: c.ink, fontSize: 16, fontWeight: '700' }}>Usage History</Text>
          </Btn>
        )}
        {!ro && <Btn kind="p" w style={{ marginTop: 22 }} onPress={save}>Save Details</Btn>}
        {!ro && hasD(m) && <Btn w color={c.bad} borderColor={c.bad} style={{ marginTop: 12 }} onPress={del}>Delete Machine</Btn>}
      </Page>
    </View>
  );
}

