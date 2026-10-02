import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Header from '../components/Header';
import { ITrash } from '../components/Icons';
import { Button, Card, Mut, Txt } from '../components/UI';
import { hasDetails, isActive } from '../lib/machinery';
import { useNav } from '../navigation/nav';
import AddProjectSheet from '../sheets/AddProjectSheet';
import { ConfirmSheet, plural } from '../sheets/common';
import { useApp } from '../store/AppProvider';
import { Project } from '../types';

export default function ProjectsScreen() {
  const { c, projects, machines, readings, deleteProject, toast } = useApp();
  const nav = useNav();
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<Project | null>(null);

  const header = <Header title="Machine Tracker" subtitle="Daily Construction Machinery Tracking" />;
  const sheets = (
    <>
      {adding && <AddProjectSheet onClose={() => setAdding(false)} />}
      {del && (() => {
        const ms = machines.filter((m) => m.projectId === del.id);
        const n = readings.filter((r) => ms.some((m) => m.id === r.machineId)).length;
        return (
          <ConfirmSheet title="Delete this project?" onClose={() => setDel(null)}
            message={`“${del.name}” will be permanently deleted, along with its ${plural(ms.length, 'machine', 'machines')} and ${plural(n, 'reading', 'readings')}. This cannot be undone.`}
            onConfirm={async () => { if (await deleteProject(del.id)) toast('Project deleted'); }} />
        );
      })()}
    </>
  );

  // First-time users: a blank screen with just the Add Project button.
  if (!projects.length) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {header}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Button label="+ Add Project" large onPress={() => setAdding(true)} />
        </View>
        {sheets}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {header}
      <FlatList
        data={projects}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Txt style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.4 }}>Projects</Txt>
            <Button label="+ Add Project" onPress={() => setAdding(true)} />
          </View>
        }
        renderItem={({ item: p, index }) => {
          const ms = machines.filter((m) => m.projectId === p.id);
          const active = ms.filter((m) => hasDetails(m) && isActive(m)).length;
          return (
            <Card i={index} onPress={() => nav.push({ name: 'mg', projectId: p.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Txt style={{ fontSize: 17, fontWeight: '700' }}>{p.name}</Txt>
                  <Mut style={{ marginTop: 4 }}>Machinery: <Text style={{ fontWeight: '700', color: c.ink }}>{ms.length}</Text>  ·  Active: <Text style={{ fontWeight: '700', color: c.ink }}>{active}</Text></Mut>
                </View>
                <Pressable onPress={() => setDel(p)} accessibilityRole="button" accessibilityLabel="Delete project"
                  style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.bdg, alignItems: 'center', justifyContent: 'center' }}>
                  <ITrash color={c.bad} size={20} />
                </Pressable>
                <Txt style={{ fontSize: 24, color: c.mut }}>›</Txt>
              </View>
            </Card>
          );
        }}
      />
      {sheets}
    </View>
  );
}
