export type Mode = 'light' | 'dark';

export interface Colors {
  bg: string; card: string; ink: string; mut: string; line: string;
  ac: string; acink: string; dk: string; ok: string; okbg: string; bad: string; bdg: string;
}

export const LIGHT: Colors = {
  bg: '#F1EEE8', card: '#FBFAF7', ink: '#1F2733', mut: '#6B7380', line: '#E1DCD0',
  ac: '#FFB020', acink: '#1A1200', dk: '#0F1B2D', ok: '#0F7F5A', okbg: '#DDEFE3', bad: '#C7352B', bdg: '#EAE5DA',
};

export const DARK: Colors = {
  bg: '#0B1220', card: '#131C2E', ink: '#EAF0FA', mut: '#93A0B8', line: '#22304A',
  ac: '#FFB020', acink: '#1A1200', dk: '#070D18', ok: '#4ADE9B', okbg: '#0F3326', bad: '#FF8A80', bdg: '#1B2740',
};

export const AMBER: [string, string] = ['#FFC63D', '#FFA800'];
export const NAVY: [string, string] = ['#0F1B2D', '#1B3556'];
export const NAVY_DARK = '#16294A';
