import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromWaveformWorkerMessage,
  type ToWaveformWorkerMessage,
} from './portMessage.cross.js';

export type WaveformMainPort = TypedMessagePort<
  Worker,
  FromWaveformWorkerMessage,
  ToWaveformWorkerMessage
>;

export const createWaveformMainPort = (
  waveformWorkerUrl: string | URL,
): WaveformMainPort => {
  const worker = new Worker(waveformWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromWaveformWorkerMessage,
    ToWaveformWorkerMessage
  >();
};
