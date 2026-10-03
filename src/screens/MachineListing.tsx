import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../data/store';
import { useTheme } from '../theme/theme';
import { hasD, isActive } from '../data/logic';
import { useUi } from '../components/UiProvider';
import { Header } from '../components/Header';
import { Btn, Empty, Field, Mut, Page } from '../components/ui';
import { MachineCard } from '../components/MachineCard';
import { SelectMachinerySheet } from '../sheets/Sheets';
import { Nav } from '../nav';

export function MachineListing({ pid, nav }: { pid: string; nav: Nav }) {
  const { db } = useStore();
  const ui = useUi();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | 'active' | 'inactive'>('all');
  const p = db.projects.find((x) => x.id === pid);
  if (!p) return null;
  const all = db.machines.filter((m) => m.pid === pid).sort((a, b) => b.cAt - a.cAt);
  const s = q.trim().toLowerCase();
  const bySearch = s ? all.filter((m) => m.type.toLowerCase().includes(s) || m.no.toLowerCase().includes(s) || m.owner.toLowerCase().includes(s) || m.vt.toLowerCase().includes(s)) : all;
  // machines without details have no status yet, so they only appear when no status filter is on
  const ms = f === 'all' ? bySearch : bySearch.filter((m) => hasD(m) && (f === 'active' ? isActive(m) : !isActive(m)));
  const add = () => ui.openSheet(<SelectMachinerySheet pid={pid} />);
  return (
    <View style={{ flex: 1 }}>
      <Header title={p.name} sub="Machine Listing" back onBack={nav.back} />
      <Page bottomInset={insets.bottom} keyboard>
        {all.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Field value={q} onChangeText={setQ} placeholder="Search type, vehicle number or owner..." returnKeyType="search" />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {(['active', 'inactive'] as const).map((k) => {
                const on = f === k;
                const act = k === 'active';
                return (
                  <Pressable
                    key={k}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => setF(on ? 'all' : k)}
                    style={({ pressed }) => ({
                      minHeight: 40, paddingHorizontal: 18, borderRadius: 99, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 7,
                      borderColor: on ? (act ? c.ok : c.bad) : c.line,
                      backgroundColor: on ? (act ? c.okbg : c.badbg) : c.card,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}
                  >
                    {act && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: on ? c.ok : c.mut }} />}
                    <Text style={{ fontSize: 15, fontWeight: '700', color: on ? (act ? c.ok : c.bad) : c.mut }}>{act ? 'Active' : 'Inactive'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <Mut>{ms.length} machine{ms.length === 1 ? '' : 's'}</Mut>
          <Btn kind="p" sm onPress={add}>Add +</Btn>
        </View>
        {ms.length === 0 && all.length > 0 ? (
          <Empty title="No machines found" text="Try a different search or filter." />
        ) : ms.length === 0 ? (
          <Empty badge="JCB" title="No Machinery Added Yet" text="Tap Add + to add your first machine and start tracking project equipment." />
        ) : (
          ms.map((m, i) => <MachineCard key={m.id} m={m} index={i} onOpen={() => nav.go({ n: 'md', pid, mid: m.id })} />)
        )}
      </Page>
    </View>
  );
}
