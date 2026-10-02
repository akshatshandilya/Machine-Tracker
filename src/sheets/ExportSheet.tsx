import React, { useState } from 'react';
import { Button, Mut } from '../components/UI';
import { DateField } from '../components/PickerFields';
import Sheet, { useSheet } from '../components/Sheet';
import { today } from '../lib/dates';
import { exportReadings } from '../lib/excel';
import { firstStart } from '../lib/machinery';
import { useApp } from '../store/AppProvider';
import { Machine } from '../types';
import { Col, H2, Row2 } from './common';

function Body({ machine }: { machine: Machine }) {
  const { readings, toast } = useApp();
  const { close } = useSheet();
  const [from, setFrom] = useState(firstStart(machine));
  const [to, setTo] = useState(today());
  const go = async () => {
    const f = from || firstStart(machine), t = to || today();
    if (f > t) { toast('The From date must be on or before the To date'); return; }
    close();
    try {
      const ok = await exportReadings(machine, readings.filter((r) => r.machineId === machine.id), f, t);
      if (!ok) toast('No readings in this date range');
    } catch { toast('Something went wrong while exporting. Please try again.'); }
  };
  return (
    <>
      <H2>Export to Excel</H2>
      <Mut>Select the date range to export</Mut>
      <Row2>
        <Col><DateField label="From" value={from} onChange={setFrom} /></Col>
        <Col><DateField label="To" value={to} onChange={setTo} /></Col>
      </Row2>
      <Mut style={{ fontSize: 13, marginTop: 4 }}>Defaults: machine start date to today. Days with no reading appear as blank rows.</Mut>
      <Row2>
        <Col><Button label="Cancel" variant="secondary" full onPress={close} style={{ marginTop: 16 }} /></Col>
        <Col><Button label="Download" full onPress={go} style={{ marginTop: 16 }} /></Col>
      </Row2>
    </>
  );
}
export default function ExportSheet({ machine, onClose }: { machine: Machine; onClose: () => void }) {
  return <Sheet onClose={onClose}><Body machine={machine} /></Sheet>;
}
