import { getStored, setStored } from './storage';

export async function getOrCreateInstallId(): Promise<string> {
  const existing = await getStored('installId');
  if (existing) return existing;
  const id = crypto.randomUUID();
  await setStored('installId', id);
  return id;
}
