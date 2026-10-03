import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/theme';
import { StoreProvider, useStore } from './src/data/store';
import { UiProvider, useUi } from './src/components/UiProvider';
import { Projects } from './src/screens/Projects';
import { MachineListing } from './src/screens/MachineListing';
import { ManageMachinery } from './src/screens/ManageMachinery';
import { MachineDetails } from './src/screens/MachineDetails';
import { Readings } from './src/screens/Readings';
import { About } from './src/screens/About';
import { SplashOverlay } from './src/splash/SplashOverlay';
import { setSplashActive } from './src/splash/splashState';
import { Nav, Route } from './src/nav';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Screens() {
  const ui = useUi();
  const [stack, setStack] = useState<Route[]>([{ n: 'proj' }]);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const nav: Nav = {
    go: (r) => setStack((s) => [...s, r]),
    back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ui.hasSheet()) { ui.closeSheet(); return true; }
      if (stackRef.current.length > 1) { setStack((s) => s.slice(0, -1)); return true; }
      return false;
    });
    return () => sub.remove();
  }, [ui]);

  const r = stack[stack.length - 1];
  const key = stack.length + r.n + ('mid' in r ? r.mid : 'pid' in r ? r.pid : '');
  return (
    <View style={{ flex: 1 }} key={key}>
      {r.n === 'proj' && <Projects nav={nav} />}
      {r.n === 'pm' && <MachineListing pid={r.pid} nav={nav} />}
      {r.n === 'mg' && <ManageMachinery pid={r.pid} nav={nav} />}
      {r.n === 'md' && <MachineDetails mid={r.mid} nav={nav} />}
      {r.n === 'rd' && <Readings mid={r.mid} nav={nav} />}
      {r.n === 'about' && <About nav={nav} />}
    </View>
  );
}

/**
 * Preview flow: Projects -> Manage Machinery (project card) -> "+" opens Machine Listing
 * (add machines / add details) ; tapping a machine in Manage opens its readings.
 */
function Root() {
  const { ready } = useStore();
  const { ready: themeReady, isDark } = useTheme();
  const [splash, setSplash] = useState(true);
  const hidden = useRef(false);

  const onReady = useCallback(() => {
    if (hidden.current) return;
    hidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  const onDone = useCallback(() => { setSplashActive(false); setSplash(false); }, []);

  if (!ready || !themeReady) return null;
  return (
    <>
      <StatusBar style="light" translucent />
      <UiProvider>
        <Screens />
        {splash && <SplashOverlay onReady={onReady} onDone={onDone} />}
      </UiProvider>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StoreProvider>
          <Root />
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
