import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/theme';
import { Machine } from '../data/types';
import { hasD, isActive } from '../data/logic';
import { ab, fD } from '../utils/format';
import { Badge, Btn, Card, H3, KV, Mut, Pill, StartEnd } from './ui';

export function MachineCard({ m, index, onOpen }: { m: Machine; index: number; onOpen: () => void }) {
  const hd = hasD(m);
  return (
    <Card index={index} onPress={onOpen}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Badge>{ab(m.type)}</Badge>
        <View style={{ flex: 1 }}>
          <H3>{m.type}</H3>
          <Mut style={{ marginTop: 2 }}>{m.no || 'Vehicle details not added'}</Mut>
        </View>
        {hd && <Pill active={isActive(m)}>{isActive(m) ? 'Active' : 'Inactive'}</Pill>}
      </View>
      {hd ? (
        <View style={{ marginTop: 12 }}>
          <KV rows={[['Owner', m.owner]]} />
          <StartEnd start={fD(m.sd)} end={m.ed ? fD(m.ed) : 'Ongoing'} />
        </View>
      ) : (
        <Btn sm w style={{ marginTop: 12 }} onPress={onOpen}>Add Details</Btn>
      )}
    </Card>
  );
}
