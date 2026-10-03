import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/theme';
import { Header } from '../components/Header';
import { Logo } from '../components/Logo';
import { Card, Grp, H2, Page } from '../components/ui';
import { Nav } from '../nav';
import app from '../../app.json';

const FEATURES = [
  'Organise work by project and machinery type, measured in hours or kilometres',
  'Keep vehicle details, owner and usage dates, and mark machines Active or Inactive',
  "Review each machine's usage history",
  'Record daily start and end readings with times and diesel or petrol quantity, with total utilisation worked out automatically',
  'Carry the last end reading forward as the next start reading',
  'Add text notes such as \u201cWorking\u201d when there is no reading',
  'Search machines and filter by Active or Inactive',
  'Import readings from your Excel records, with a review before anything is saved',
  "Export a machine's readings to Excel for any date range",
  'Switch between light and dark mode',
];

export function About({ nav }: { nav: Nav }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <Header title="About" sub="Machine Tracker" back onBack={nav.back} />
      <Page bottomInset={insets.bottom}>
        <View style={{ alignItems: 'center', paddingBottom: 20 }}>
          <View style={{ width: 76, height: 76, borderRadius: 22, overflow: 'hidden', marginBottom: 12, elevation: 6, shadowColor: '#0F1B2D' }}>
            <Logo size={76} id="about" />
          </View>
          <H2>Machine Tracker</H2>
          <Text style={{ color: c.mut, fontSize: 13, fontStyle: 'italic', letterSpacing: 0.26, lineHeight: 19, textAlign: 'center', maxWidth: 280, marginTop: 2 }}>
            Conceptualised, Visualised and Developed by Akshat Shandilya
          </Text>
          <View style={{ marginTop: 10, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 99, backgroundColor: c.bdg }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: c.mut }}>Version {app.expo.version}</Text>
          </View>
        </View>

        <Card>
          <Text style={{ color: c.ink, fontSize: 15, lineHeight: 22 }}>
            Machine Tracker helps you keep a daily record of the machinery on your construction projects. Everything is stored on your phone and works offline.
          </Text>
        </Card>

        <Grp>WHAT YOU CAN DO</Grp>
        <Card>
          <View style={{ gap: 12 }}>
            {FEATURES.map((t) => (
              <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <Text style={{ color: c.acink, fontSize: 12, fontWeight: '800' }}>{'\u2713'}</Text>
                </View>
                <Text style={{ flex: 1, color: c.ink, fontSize: 15, lineHeight: 21 }}>{t}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Page>
    </View>
  );
}
