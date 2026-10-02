import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Header, { HeaderAction } from '../components/Header';
import { IClock } from '../components/Icons';
import { DateField } from '../components/PickerFields';
import { Button, Field, Mut } from '../components/UI';
import { today } from '../lib/dates';
import { hasDetails, isActive } from '../lib/machinery';
import { useNav } from '../navigation/nav';
import { ConfirmSheet, Col, Row2, plural } from '../sheets/common';
import UsageHistorySheet from '../sheets/UsageHistorySheet';
import { useApp } from '../store/AppProvider';
import { DetailsInput } from '../types';

export default function MachineDetailsScreen({ machineId }: { machineId: string }) {
  const { c, machines, readings, saveDetails, toggleActive, deleteMachine, toast } = useApp();
  const nav = useNav();
  const m = machines.find((x) => x.id === machineId);

  // New machines default Start and End date to today (device clock).
  const startOf = () => m?.startDate || today();
  const endOf = () => (m && hasDetails(m) ? m.endDate : m?.endDate || today());
  const [vt, setVt] = useState(m?.vehicleType ?? '');
  const [no, setNo] = useState(m?.vehicleNo ?? '');
  const [ow, setOw] = useState(m?.owner ?? '');
  const [sd, setSd] = useState(startOf);
  const [ed, setEd] = useState(endOf);
  const [edit, setEdit] = useState(m ? !hasDetails(m) : false);
  const [errs, setErrs] = useState<{ no?: string; ow?: string }>({});
  const [hist, setHist] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => { setSd(startOf()); setEd(endOf()); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [m?.startDate, m?.endDate, m?.inactive]);
  if (!m) return null;

  const ro = hasDetails(m) && !edit;
  const act = isActive(m);

  const collect = (): DetailsInput | null => {
    const e: { no?: string; ow?: string } = {};
    if (!no.trim()) e.no = 'Vehicle number is required';
    if (!ow.trim()) e.ow = "Owner's name is required";
    setErrs(e);
    let bad = !!(e.no || e.ow);
    if (!sd) { toast('Start date is required'); bad = true; }
    if (ed && sd && ed < sd) { toast('End date cannot be before start date'); bad = true; }
    return bad ? null : { vehicleType: vt.trim(), vehicleNo: no.trim(), owner: ow.trim(), startDate: sd, endDate: ed };
  };
  const save = async () => { const v = collect(); if (v && await saveDetails(m.id, v)) { nav.pop(); toast('Machinery details saved'); } };
  const toggle = async () => { const v = collect(); if (v && await toggleActive(m.id, v)) toast(act ? 'Machine marked as inactive' : 'Machine marked as active'); };
  const nRead = readings.filter((r) => r.machineId === m.id).length;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Machine Details" subtitle={m.type} onBack={nav.pop}
        right={ro ? <HeaderAction kind="pen" label="Edit details" onPress={() => setEdit(true)} /> : undefined} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Field label="Vehicle Type" value={vt} onChangeText={setVt} editable={!ro} placeholder="Backhoe Loader" />
        <Field label="Vehicle No. *" value={no} onChangeText={(t) => { setNo(t); setErrs((x) => ({ ...x, no: undefined })); }} editable={!ro} placeholder="MH 12 AB 1234" autoCapitalize="characters" error={errs.no} />
        <Field label="Owner's Name *" value={ow} onChangeText={(t) => { setOw(t); setErrs((x) => ({ ...x, ow: undefined })); }} editable={!ro} placeholder="ABC Earth Movers" error={errs.ow} />
        <Row2>
          <Col><DateField label="Start Date *" value={sd} onChange={setSd} disabled={ro} /></Col>
          <Col><DateField label={ro ? 'End Date' : 'End Date (optional)'} value={ed} onChange={setEd} onClear={() => setEd('')} disabled={ro} /></Col>
        </Row2>
        <Mut style={{ fontSize: 13, marginTop: 4 }}>
          {ro ? (m.endDate ? '' : 'Ongoing — no end date set.') : 'Clear the End Date if the machine is still deployed — it will show as Ongoing.'}
        </Mut>
        <View style={{ marginTop: 10, gap: 12 }}>
          {hasDetails(m) && !ro && <Button label={act ? 'Mark as Inactive' : 'Mark as Active'} variant="secondary" tint={act ? c.bad : c.ok} full onPress={toggle} style={{ marginTop: 12 }} />}
          {hasDetails(m) && <Button label="Usage History" variant="secondary" full icon={<IClock color={c.ink} size={20} />} onPress={() => setHist(true)} style={ro ? { marginTop: 12 } : undefined} />}
          {!ro && <Button label="Save Details" full onPress={save} style={{ marginTop: 10 }} />}
          {!ro && <Button label="Delete Machine" variant="secondary" tint={c.bad} full onPress={() => setConfirmDel(true)} />}
        </View>
      </ScrollView>
      {hist && <UsageHistorySheet machine={m} onClose={() => setHist(false)} />}
      {confirmDel && (
        <ConfirmSheet title="Delete this machine?" onClose={() => setConfirmDel(false)}
          message={`${m.type}${m.vehicleNo ? ' · ' + m.vehicleNo : ''} will be permanently deleted, along with its usage history and ${plural(nRead, 'reading', 'readings')}. This cannot be undone.`}
          onConfirm={async () => { nav.pop(); if (await deleteMachine(m.id)) toast('Machine deleted'); }} />
      )}
    </View>
  );
}
