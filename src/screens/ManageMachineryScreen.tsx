import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Header, { HeaderAction } from '../components/Header';
import { Badge, Card, Empty, Mut, SearchInput, Txt } from '../components/UI';
import { hasDetails } from '../lib/machinery';
import { useNav } from '../navigation/nav';
import { useApp } from '../store/AppProvider';

/** Second screen: every machine of the project (with details), grouped A–Z by type. */
export default function ManageMachineryScreen({ projectId }: { projectId: string }) {
  const { c, projects, machines } = useApp();
  const nav = useNav();
  const [q, setQ] = useState('');
  const p = projects.find((x) => x.id === projectId);
  const all = machines.filter((m) => m.projectId === projectId);
  const s = q.trim().toLowerCase();
  const list = all.filter((m) => hasDetails(m) && (!s || [m.vehicleNo, m.owner, m.type].some((v) => v.toLowerCase().includes(s))));
  const types = [...new Set(list.map((m) => m.type))].sort((a, b) => a.localeCompare(b));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={p?.name ?? ''} subtitle="Manage Machinery" onBack={nav.pop}
        right={<HeaderAction kind="plus" label="Machine listing and add machinery" onPress={() => nav.push({ name: 'pm', projectId })} />} />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <SearchInput value={q} onChangeText={setQ} placeholder="Search vehicle number or owner..." />
        {types.map((t) => (
          <View key={t}>
            <Mut style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginTop: 22, marginBottom: 10, marginLeft: 4 }}>{t}</Mut>
            {list.filter((m) => m.type === t).sort((a, b) => a.createdAt - b.createdAt).map((m, i) => (
              <Card key={m.id} i={i} onPress={() => nav.push({ name: 'rd', projectId, machineId: m.id })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Badge text={String(i + 1)} amber />
                  <View style={{ flex: 1 }}>
                    <Txt style={{ fontSize: 17, fontWeight: '700' }}>{m.vehicleNo}</Txt>
                    <Mut>{m.owner}</Mut>
                  </View>
                  <Txt style={{ fontSize: 24, color: c.mut }}>›</Txt>
                </View>
              </Card>
            ))}
          </View>
        ))}
        {!list.length && (all.length
          ? <Empty title="No machines found" text="Add details to a machine, or adjust your search." />
          : <Empty badge="+" title="No Machinery Added Yet" text="Tap the + button at the top to add your first machine." />)}
      </ScrollView>
    </View>
  );
}
