import { Logger } from '@musetric/resource-utils/logger';

export type GenerateWaveOptions = {
  fromPath: string;
  toPath: string;
  sampleRate: number;
  logger: Logger;
};

export type ReadSourceResult = {
  durationSeconds: number;
  stream: AsyncIterable<Float32Array>;
};
