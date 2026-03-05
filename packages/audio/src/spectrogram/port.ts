import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './portMessage.cross.js';
import spectrogramWorkerUrl from './spectrogram.worker.ts?worker&url';

export const createSpectrogramWorker = () => {
  const worker = new Worker(spectrogramWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromSpectrogramWorkerMessage,
    ToSpectrogramWorkerMessage
  >();
};
export type SpectrogramWorker = TypedMessagePort<
  Worker,
  FromSpectrogramWorkerMessage,
  ToSpectrogramWorkerMessage
>;
