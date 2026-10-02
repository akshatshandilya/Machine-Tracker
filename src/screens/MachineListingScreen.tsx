import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Header from '../components/Header';
import { Badge, Button, Card, Empty, Mut, Pill, StartEnd, Txt } from '../components/UI';
import { fD } from '../lib/dates';
import { abbr, hasDetails, isActive } from '../lib/machinery';
import { useNav } from '../navigation/nav';
import SelectMachinerySheet from '../sheets/SelectMachinerySheet';
import { useApp } from '../store/AppProvider';
import { Machine } from '../types';

function MachineCard({ m, i, onOpen }: { m: Machine; i: number; onOpen: () => void }) {
  const has = hasDetails(m);
  return (
    <Card i={i} onPress={onOpen}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Badge text={abbr(m.type)} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 17, fontWeight: '700' }}>{m.type}</Txt>
          <Mut>{has ? m.vehicleNo : 'Vehicle details not added'}</Mut>
        </View>
        {has && <Pill text={isActive(m) ? 'Active' : 'Inactive'} active={isActive(m)} />}
      </View>
      {has ? (
        <>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <Mut style={{ fontWeight: '600' }}>Owner</Mut><Txt style={{ fontSize: 15 }}>{m.owner}</Txt>
          </View>
          <StartEnd a={fD(m.startDate)} b={m.endDate ? fD(m.endDate) : 'Ongoing'} />
        </>
      ) : (
        <Button label="Add Details" variant="secondary" small full onPress={onOpen} style={{ marginTop: 12 }} />
      )}
    </Card>
  );
}

/** Third screen: all machines of the project, with the Add + button. */
export default function MachineListingScreen({ projectId }: { projectId: string }) {
  const { c, projects, machines, addMachine, toast } = useApp();
  const nav = useNav();
  const [picking, setPicking] = useState(false);
  const p = projects.find((x) => x.id === projectId);
  const ms = machines.filter((m) => m.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={p?.name ?? ''} subtitle="Machine Listing" onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Mut>{ms.length} {ms.length === 1 ? 'machine' : 'machines'}</Mut>
          <Button label="Add +" small onPress={() => setPicking(true)} />
        </View>
        {ms.map((m, i) => <MachineCard key={m.id} m={m} i={i} onOpen={() => nav.push({ name: 'md', projectId, machineId: m.id })} />)}
        {!ms.length && <Empty badge="JCB" title="No Machinery Added Yet" text="Tap Add + to add your first machine and start tracking project equipment." />}
      </ScrollView>
      {picking && (
        <SelectMachinerySheet onClose={() => setPicking(false)}
          onPick={async (type) => { if (await addMachine(projectId, type)) toast(`${type} added — tap Add Details`); }} />
      )}
    </View>
  );
}
