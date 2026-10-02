import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler } from 'react-native';
import { NavCtx, Route } from './nav';
import ProjectsScreen from '../screens/ProjectsScreen';
import ManageMachineryScreen from '../screens/ManageMachineryScreen';
import MachineListingScreen from '../screens/MachineListingScreen';
import MachineDetailsScreen from '../screens/MachineDetailsScreen';
import ReadingsScreen from '../screens/ReadingsScreen';

/** Light slide + fade between screens (the same motion as the preview). */
function Transition({ children }: { children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 220, useNativeDriver: true }).start(); }, [v]);
  return <Animated.View style={{ flex: 1, opacity: v, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>{children}</Animated.View>;
}

export default function Router() {
  const [stack, setStack] = useState<Route[]>([{ name: 'projects' }]);
  const push = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { pop(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, pop]);

  const top = stack[stack.length - 1];
  const nav = useMemo(() => ({ push, pop }), [push, pop]);
  let screen: React.ReactNode;
  switch (top.name) {
    case 'projects': screen = <ProjectsScreen />; break;
    case 'mg': screen = <ManageMachineryScreen projectId={top.projectId} />; break;
    case 'pm': screen = <MachineListingScreen projectId={top.projectId} />; break;
    case 'md': screen = <MachineDetailsScreen machineId={top.machineId} />; break;
    case 'rd': screen = <ReadingsScreen machineId={top.machineId} />; break;
  }
  return <NavCtx.Provider value={nav}><Transition key={`${stack.length}-${top.name}`}>{screen}</Transition></NavCtx.Provider>;
}
