import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { useStore } from '../data/store';
import { useUi } from '../components/UiProvider';
import { Header } from '../components/Header';
import { Btn, Card, Empty, KV, Mut, Page, StartEnd } from '../components/ui';
import { ExportSheet, ReadingSheet } from '../sheets/Sheets';
import { sortedReadings } from '../data/logic';
import { f1, fD, fT } from '../utils/format';
import { isNum } from '../data/logic';
import { Nav } from '../nav';

export function Readings({ mid, nav }: { mid: string; nav: Nav }) {
  const { c, isDark } = useTheme();
  const { db } = useStore();
  const ui = useUi();
  const insets = useSafeAreaInsets();
  const m = db.machines.find((x) => x.id === mid);
  if (!m) return null;

  const rs = sortedReadings(db, mid);
  const tot = rs.reduce((s, r) => (isNum(r.sr) && isNum(r.er) ? s + (r.er - r.sr) : s), 0);
  const add = () => ui.openSheet(<ReadingSheet m={m} />);

  const th = { color: c.mut, fontSize: 10, fontWeight: '800' as const, letterSpacing: 0.2, paddingLeft: 4, textTransform: 'uppercase' as const };
  const flex = [1.18, 1, 1, 1, 1];
  const show = (v: number | string | null | undefined) => (v === '' || v == null ? '—' : String(v));
  const dshort = (d: string) => fD(d).replace(/ 20(\d\d)$/, ' $1');

  return (
    <View style={{ flex: 1 }}>
      <Header title={m.type} sub={m.no} back onBack={nav.back} noTheme extra={<Btn kind="p" sm onPress={add}>+ Add Reading</Btn>} />
      <Page bottomInset={insets.bottom}>
        <Card>
          <KV labelWidth={100} rows={[['Owner', m.owner], ['Vehicle Type', m.vt || '—']]} />
          <StartEnd labels={['Start Date', 'End Date']} start={fD(m.sd)} end={m.ed ? fD(m.ed) : 'Ongoing'} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.line }}>
            <Mut>Total Utilisation</Mut>
            <Text style={{ fontSize: 26, fontWeight: '800', color: c.ink }}>{f1(tot)}</Text>
          </View>
        </Card>

        {rs.length === 0 ? (
          <Empty badge="0" title="No Daily Readings" text="Add today's machinery reading to begin tracking usage." action={<Btn kind="p" onPress={add}>+ Add Reading</Btn>} />
        ) : (
          <>
            <Btn w style={{ marginBottom: 12 }} onPress={() => ui.openSheet(<ExportSheet m={m} />)}>⬇ Export to Excel</Btn>
            <View style={{ backgroundColor: c.card, borderWidth: 1, borderColor: c.line, borderRadius: 20, overflow: 'hidden', elevation: isDark ? 3 : 2, shadowColor: isDark ? '#000' : '#3C321E' }}>
              <View style={{ flexDirection: 'row', backgroundColor: c.bdg, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'flex-end' }}>
                <Text style={[th, { flex: flex[0] }]}>Date</Text>
                <Text style={[th, { flex: flex[1], textAlign: 'right' }]}>Start</Text>
                <Text style={[th, { flex: flex[2], textAlign: 'right' }]}>End</Text>
                <Text style={[th, { flex: flex[3], textAlign: 'right' }]}>Total Utilisation</Text>
                <Text style={[th, { flex: flex[4], textAlign: 'right' }]}>Diesel / Petrol</Text>
              </View>
              {rs.map((r) => {
                // a text note from the sheet (e.g. "Working") fills the cells that would otherwise be empty
                const note = typeof r.sr === 'string' && r.sr ? r.sr : typeof r.er === 'string' && r.er ? r.er : '';
                const both = isNum(r.sr) && isNum(r.er);
                const txt = (v: string) => ({ fontSize: 12, textAlign: 'right' as const, color: c.ink });
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => ui.openSheet(<ReadingSheet m={m} reading={r} />)}
                    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: pressed ? c.bdg : 'transparent' })}
                  >
                    <Text numberOfLines={1} style={{ flex: flex[0], fontSize: 14, fontWeight: '700', color: c.ink }}>{dshort(r.date)}</Text>
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} onLongPress={() => ui.toast(`Start: ${show(r.sr)} at ${fT(r.st)}`)} style={[{ flex: flex[1], paddingLeft: 3 }, isNum(r.sr) ? { fontSize: 14, textAlign: 'right', color: c.ink } : txt(show(r.sr || note))]}>{show(r.sr || note)}</Text>
                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} onLongPress={() => ui.toast(`End: ${show(r.er)} at ${fT(r.et)}`)} style={[{ flex: flex[2], paddingLeft: 3 }, isNum(r.er) ? { fontSize: 14, textAlign: 'right', color: c.ink } : txt(show(r.er || note))]}>{show(r.er || note)}</Text>
                    {both ? (
                      <Text style={{ flex: flex[3], fontSize: 14, fontWeight: '800', textAlign: 'right', color: c.ink }}>{f1((r.er as number) - (r.sr as number))}</Text>
                    ) : (
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[{ flex: flex[3] }, txt(note || '—')]}>{note || '—'}</Text>
                    )}
                    {r.fuel != null ? (
                      <Text style={{ flex: flex[4], fontSize: 14, textAlign: 'right', color: c.ink }}>{r.fuel}</Text>
                    ) : (
                      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[{ flex: flex[4] }, txt(note || '—')]}>{note || '—'}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontSize: 13, color: c.mut, marginTop: 10, textAlign: 'center' }}>Tap a row to edit or delete · long-press Start or End to see the time</Text>
          </>
        )}
      </Page>
    </View>
  );
}
