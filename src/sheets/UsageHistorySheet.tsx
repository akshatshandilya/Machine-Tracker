import React from 'react';
import { View } from 'react-native';
import { Button, Card, Mut, Pill, StartEnd, Txt } from '../components/UI';
import Sheet, { useSheet } from '../components/Sheet';
import { daysBetween, fD, today } from '../lib/dates';
import { Machine } from '../types';
import { H2, plural } from './common';

function Body({ machine }: { machine: Machine }) {
  const { close } = useSheet();
  const items = machine.history.map((h, i) => ({ h, i })).reverse();
  return (
    <>
      <H2>Usage History</H2>
      <Mut style={{ marginBottom: 14 }}>{machine.type} · {machine.vehicleNo}</Mut>
      {items.map(({ h, i }) => {
        const days = plural(daysBetween(h.start, h.end || today()) + 1, 'day', 'days');
        return (
          <Card key={i}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt style={{ fontSize: 17, fontWeight: '700' }}>Period {i + 1}</Txt>
              <Pill text={h.end ? days : `Ongoing · ${days}`} active={!h.end} />
            </View>
            <StartEnd a={fD(h.start)} b={h.end ? fD(h.end) : 'Ongoing'} />
          </Card>
        );
      })}
      <Button label="Close" variant="secondary" full onPress={close} />
    </>
  );
}
export default function UsageHistorySheet({ machine, onClose }: { machine: Machine; onClose: () => void }) {
  return <Sheet onClose={onClose}><Body machine={machine} /></Sheet>;
}
