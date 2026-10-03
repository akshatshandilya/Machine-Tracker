import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

/** Opens the system file picker (no storage permission needed) and returns the file's bytes. */
export async function pickWorkbook(): Promise<{ name: string; data: Uint8Array } | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  const a = res.assets[0];
  if (Platform.OS === 'web') {
    const buf = a.file ? await a.file.arrayBuffer() : await (await fetch(a.uri)).arrayBuffer();
    return { name: a.name, data: new Uint8Array(buf) };
  }
  return { name: a.name, data: await new File(a.uri).bytes() };
}
