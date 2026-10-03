import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useStore } from '../data/store';
import { Header } from '../components/Header';
import { Card, Empty, Field, Grp, H3, IconBtn, Mut, Page } from '../components/ui';
import { PlusIcon } from '../components/Icons';
import { hasD, isActive } from '../data/logic';
import { Nav } from '../nav';

export function ManageMachinery({ pid, nav }: { pid: string; nav: Nav }) {
  const { c } = useTheme();
  const { db } = useStore();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [f, setF] = useState<'all' | 'active' | 'inactive'>('all');
  const p = db.projects.find((x) => x.id === pid);
  if (!p) return null;

  const all = db.machines.filter((m) => m.pid === pid);
  const s = q.toLowerCase();
  const ms = all.filter(
    (m) =>
      hasD(m) &&
      (!s || m.no.toLowerCase().includes(s) || m.owner.toLowerCase().includes(s) || m.type.toLowerCase().includes(s)) &&
      (f === 'all' || (f === 'active' ? isActive(m) : !isActive(m))),
  );
  const types = [...new Set(ms.map((m) => m.type))].sort((a, b) => a.localeCompare(b));

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={p.name}
        sub="Manage Machinery"
        back
        onBack={nav.back}
        extra={<IconBtn label="Machine listing and add machinery" onPress={() => nav.go({ n: 'pm', pid })} style={{ backgroundColor: c.ac }}><PlusIcon color={c.acink} /></IconBtn>}
      />
      <Page bottomInset={insets.bottom} keyboard>
        <Field value={q} onChangeText={setQ} placeholder="Search vehicle number or owner..." returnKeyType="search" />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginBottom: 2 }}>
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
        {ms.length === 0 ? (
          all.length > 0 ? (
            <Empty title="No machines found" text="Add details to a machine, or adjust your search or filter." />
          ) : (
            <Empty badge="+" title="No Machinery Added Yet" text="Tap the + button at the top to add your first machine." />
          )
        ) : (
          types.map((t) => (
            <View key={t}>
              <Grp>{t}</Grp>
              {ms.filter((m) => m.type === t).sort((a, b) => a.cAt - b.cAt).map((m, i) => (
                <Card key={m.id} index={i} onPress={() => nav.go({ n: 'rd', pid, mid: m.id })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#14181F', fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <H3>{m.no}</H3>
                      <Mut style={{ marginTop: 2 }}>{m.owner}</Mut>
                    </View>
                    <Text style={{ color: c.mut, fontSize: 24 }}>›</Text>
                  </View>
                </Card>
              ))}
            </View>
          ))
        )}
      </Page>
    </View>
  );
}
