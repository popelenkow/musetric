import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const writeWave = async (
  toPath: string,
  segments: Float32Array,
): Promise<void> => {
  await mkdir(dirname(toPath), { recursive: true });
  const buffer = Buffer.from(segments.buffer);
  await writeFile(toPath, buffer);
};
