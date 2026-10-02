import React, { useState } from 'react';
import { View } from 'react-native';
import { Badge, Card, Mut, SearchInput, Txt } from '../components/UI';
import Sheet, { useSheet } from '../components/Sheet';
import { TYPES, abbr, unitOf } from '../lib/machinery';
import { H2 } from './common';

function Body({ onPick }: { onPick: (type: string) => void }) {
  const { close } = useSheet();
  const [q, setQ] = useState('');
  const list = [...TYPES].sort((a, b) => a.localeCompare(b)).filter((t) => t.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <H2>Select Machinery</H2>
      <SearchInput value={q} onChangeText={setQ} placeholder="Search machinery..." />
      <View style={{ marginTop: 12 }}>
        {list.map((t) => (
          <Card key={t} onPress={() => { close(); onPick(t); }} style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Badge text={abbr(t)} />
              <Txt style={{ flex: 1, fontSize: 17, fontWeight: '700' }}>{t}</Txt>
              <Mut>{unitOf(t)}</Mut>
            </View>
          </Card>
        ))}
      </View>
    </>
  );
}
export default function SelectMachinerySheet({ onPick, onClose }: { onPick: (type: string) => void; onClose: () => void }) {
  return <Sheet onClose={onClose}><Body onPick={onPick} /></Sheet>;
}
