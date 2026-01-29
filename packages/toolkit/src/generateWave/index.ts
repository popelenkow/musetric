import { createSegments } from './createSegments.js';
import { readSource } from './readSource.js';
import { writeWave } from './writeWave.js';
import type { GenerateWaveOptions } from './types.js';

export type { GenerateWaveOptions } from './types.js';

export const generateWave = async (
  options: GenerateWaveOptions,
): Promise<void> => {
  const { durationSeconds, stream } = await readSource(
    options.fromPath,
    options.sampleRate,
    options.logger,
  );
  const segments = await createSegments(
    durationSeconds,
    options.sampleRate,
    stream,
  );
  await writeWave(options.toPath, segments);
};
