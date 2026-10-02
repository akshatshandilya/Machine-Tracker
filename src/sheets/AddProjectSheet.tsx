import React, { useState } from 'react';
import { Button, Field } from '../components/UI';
import Sheet, { useSheet } from '../components/Sheet';
import { useApp } from '../store/AppProvider';
import { H2 } from './common';

function Body() {
  const { addProject, toast } = useApp();
  const { close } = useSheet();
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const save = async () => {
    const v = name.trim();
    if (!v) { setErr('Please enter a project name.'); return; }
    if (await addProject(v)) { close(); toast('Project saved'); }
  };
  return (
    <>
      <H2>Add Project</H2>
      <Field label="Project Name" value={name} onChangeText={(t) => { setName(t); setErr(''); }} placeholder="Mumbai–Pune Highway Package 4"
        error={err} autoFocus returnKeyType="done" onSubmitEditing={save} />
      <Button label="Save Project" full onPress={save} style={{ marginTop: 16 }} />
    </>
  );
}
export default function AddProjectSheet({ onClose }: { onClose: () => void }) {
  return <Sheet onClose={onClose}><Body /></Sheet>;
}
