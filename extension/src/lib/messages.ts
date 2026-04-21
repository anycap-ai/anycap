export type StartGenerationMsg = {
  type: 'ANYCAP_START_GENERATION';
  image: { srcUrl: string; width: number; height: number };
  pageUrl: string;
};

export type GenerationResultMsg = {
  type: 'ANYCAP_GENERATION_RESULT';
  resultUrl?: string;
  error?: { code: string; message: string };
};

export type ExtensionMessage = StartGenerationMsg | GenerationResultMsg;

export function isStartGeneration(m: unknown): m is StartGenerationMsg {
  if (!m || typeof m !== 'object') return false;
  const msg = m as Record<string, unknown>;
  if (msg.type !== 'ANYCAP_START_GENERATION') return false;
  const image = msg.image;
  if (!image || typeof image !== 'object') return false;
  const img = image as Record<string, unknown>;
  return (
    typeof img.srcUrl === 'string' &&
    typeof img.width === 'number' &&
    typeof img.height === 'number'
  );
}
