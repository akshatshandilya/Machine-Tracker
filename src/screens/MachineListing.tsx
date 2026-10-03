import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../data/store';
import { useUi } from '../components/UiProvider';
import { Header } from '../components/Header';
import { Btn, Empty, Field, Mut, Page } from '../components/ui';
import { MachineCard } from '../components/MachineCard';
import { SelectMachinerySheet } from '../sheets/Sheets';
import { ImportSheet } from '../sheets/ImportSheet';
import { Nav } from '../nav';

export function MachineListing({ pid, nav }: { pid: string; nav: Nav }) {
  const { db } = useStore();
  const ui = useUi();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const p = db.projects.find((x) => x.id === pid);
  if (!p) return null;
  const all = db.machines.filter((m) => m.pid === pid).sort((a, b) => b.cAt - a.cAt);
  const s = q.trim().toLowerCase();
  const bySearch = s ? all.filter((m) => m.type.toLowerCase().includes(s) || m.no.toLowerCase().includes(s) || m.owner.toLowerCase().includes(s) || m.vt.toLowerCase().includes(s)) : all;
  const ms = bySearch;
  const add = () => ui.openSheet(<SelectMachinerySheet pid={pid} />);
  const imp = () => ui.openSheet(<ImportSheet pid={pid} />);
  return (
    <View style={{ flex: 1 }}>
      <Header title={p.name} sub="Machine Listing" back onBack={nav.back} />
      <Page bottomInset={insets.bottom} keyboard>
        {all.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Field value={q} onChangeText={setQ} placeholder="Search type, vehicle number or owner..." returnKeyType="search" />
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <Mut>{ms.length} machine{ms.length === 1 ? '' : 's'}</Mut>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Btn xs onPress={imp}>⬆ Import Data</Btn>
            <Btn kind="p" sm onPress={add}>Add +</Btn>
          </View>
        </View>
        {ms.length === 0 && all.length > 0 ? (
          <Empty title="No machines found" text="Try a different search." />
        ) : ms.length === 0 ? (
          <Empty badge="JCB" title="No Machinery Added Yet" text="Tap Add + to add your first machine and start tracking project equipment." />
        ) : (
          ms.map((m, i) => <MachineCard key={m.id} m={m} index={i} onOpen={() => nav.go({ n: 'md', pid, mid: m.id })} />)
        )}
      </Page>
    </View>
  );
}
