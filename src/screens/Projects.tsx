import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useStore } from '../data/store';
import { useUi } from '../components/UiProvider';
import { Header } from '../components/Header';
import { Bold, Btn, Card, H2, H3, Mut, Page } from '../components/ui';
import { InfoIcon, TrashIcon } from '../components/Icons';
import { AddProjectSheet, ConfirmSheet } from '../sheets/Sheets';
import { hasD, isActive } from '../data/logic';
import { Nav } from '../nav';

export function Projects({ nav }: { nav: Nav }) {
  const { c } = useTheme();
  const { db, deleteProject } = useStore();
  const ui = useUi();
  const insets = useSafeAreaInsets();
  const add = () => ui.openSheet(<AddProjectSheet />);

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Machine Tracker"
        sub="Daily Construction Machinery Tracking"
        wrapSub
        extra={
          <Pressable
            accessibilityLabel="About Machine Tracker"
            onPress={() => nav.go({ n: 'about' })}
            style={({ pressed }) => ({
              width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)',
            })}
          >
            <InfoIcon size={18} color="#fff" />
          </Pressable>
        }
      />
      <Page bottomInset={insets.bottom}>
        {db.projects.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Btn kind="p" onPress={add} style={{}}>
              <Text style={{ color: c.acink, fontSize: 18, fontWeight: '700', paddingHorizontal: 12, paddingVertical: 4 }}>+ Add Project</Text>
            </Btn>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
              <H2>Projects</H2>
              <Btn kind="p" sm onPress={add}>+ Add Project</Btn>
            </View>
            {db.projects.map((p, i) => {
              const ms = db.machines.filter((m) => m.pid === p.id);
              const act = ms.filter((m) => hasD(m) && isActive(m)).length;
              return (
                <Card key={p.id} index={i} onPress={() => nav.go({ n: 'mg', pid: p.id })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <H3>{p.name}</H3>
                      <Mut style={{ marginTop: 3 }}>Machinery: <Bold>{ms.length}</Bold> · Active: <Bold>{act}</Bold></Mut>
                    </View>
                    <Pressable
                      accessibilityLabel="Delete project"
                      onPress={() => {
                        const ids = ms.map((m) => m.id);
                        const n = db.readings.filter((x) => ids.includes(x.mid)).length;
                        const cn = (k: number, a: string, b: string) => `${k} ${k === 1 ? a : b}`;
                        ui.openSheet(
                          <ConfirmSheet
                            title="Delete this project?"
                            body={`“${p.name}” will be permanently deleted, along with its ${cn(ms.length, 'machine', 'machines')} and ${cn(n, 'reading', 'readings')}. This cannot be undone.`}
                            onConfirm={() => { deleteProject(p.id); ui.closeSheet(); ui.toast('Project deleted'); }}
                          />,
                        );
                      }}
                      style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.bdg, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <TrashIcon size={20} color={c.bad} />
                    </Pressable>
                    <Text style={{ color: c.mut, fontSize: 24 }}>›</Text>
                  </View>
                </Card>
              );
            })}
          </>
        )}
      </Page>
    </View>
  );
}
