import React from 'react';
import { View } from 'react-native';
import { Button, Mut, Txt } from '../components/UI';
import Sheet, { useSheet } from '../components/Sheet';
import { useApp } from '../store/AppProvider';

export const H2 = ({ children }: { children: React.ReactNode }) => <Txt style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.4, marginBottom: 4 }}>{children}</Txt>;
export const Row2 = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: 'row', gap: 10 }}>{children}</View>;
export const Col = ({ children }: { children: React.ReactNode }) => <View style={{ flex: 1 }}>{children}</View>;

/** Cancel / Delete confirmation body (used inside any Sheet). */
export function ConfirmBody({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }:
  { title: string; message: string; confirmLabel?: string; onConfirm: () => void | Promise<void>; onCancel?: () => void }) {
  const { close } = useSheet();
  return (
    <View>
      <H2>{title}</H2>
      <Mut style={{ fontSize: 15, marginBottom: 18, lineHeight: 21 }}>{message}</Mut>
      <Row2>
        <Col><Button label="Cancel" variant="secondary" full onPress={onCancel ?? close} /></Col>
        <Col><Button label={confirmLabel} variant="danger" full onPress={() => onConfirm()} /></Col>
      </Row2>
    </View>
  );
}

export function ConfirmSheet(p: { title: string; message: string; onConfirm: () => Promise<void> | void; onClose: () => void; confirmLabel?: string }) {
  return (
    <Sheet onClose={p.onClose}>
      <ConfirmInner {...p} />
    </Sheet>
  );
}
function ConfirmInner({ title, message, onConfirm, confirmLabel }: { title: string; message: string; onConfirm: () => Promise<void> | void; confirmLabel?: string }) {
  const { close } = useSheet();
  return <ConfirmBody title={title} message={message} confirmLabel={confirmLabel} onConfirm={async () => { close(); await onConfirm(); }} />;
}

export const plural = (n: number, a: string, b: string) => `${n} ${n === 1 ? a : b}`;
export { useApp };
