import { wrapMessagePort } from '@musetric/resource-utils/cross/messagePort';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './protocol.es.js';
import spectrogramWorkerUrl from './spectrogram.worker.ts?worker&url';

export const createSpectrogramWorker = () => {
  const worker = new Worker(spectrogramWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromSpectrogramWorkerMessage,
    ToSpectrogramWorkerMessage
  >();
};
