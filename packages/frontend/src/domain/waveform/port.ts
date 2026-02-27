import { wrapMessagePort } from '@musetric/resource-utils/cross/messagePort';
import {
  type FromWaveformWorkerMessage,
  type ToWaveformWorkerMessage,
} from './protocol.es.js';
import waveformWorkerUrl from './waveform.worker.ts?worker&url';

export const createWaveformWorker = () => {
  const worker = new Worker(waveformWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromWaveformWorkerMessage,
    ToWaveformWorkerMessage
  >();
};
