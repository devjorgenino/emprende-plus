import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getString(key: string): Promise<string | undefined> {
  const value = await AsyncStorage.getItem(key);
  return value ?? undefined;
}

export async function setString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function getObject<T>(key: string): Promise<T | undefined> {
  const json = await AsyncStorage.getItem(key);
  if (!json) return undefined;
  return JSON.parse(json) as T;
}

export async function setObject<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getNumber(key: string): Promise<number | undefined> {
  const value = await AsyncStorage.getItem(key);
  return value ? parseFloat(value) : undefined;
}

export async function setNumber(key: string, value: number): Promise<void> {
  await AsyncStorage.setItem(key, value.toString());
}

export async function getBoolean(key: string): Promise<boolean | undefined> {
  const value = await AsyncStorage.getItem(key);
  return value ? value === 'true' : undefined;
}

export async function setBoolean(key: string, value: boolean): Promise<void> {
  await AsyncStorage.setItem(key, value.toString());
}

export async function removeKey(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.clear();
}
