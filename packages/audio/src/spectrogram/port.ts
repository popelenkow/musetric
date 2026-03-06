import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './portMessage.cross.js';
import spectrogramWorkerUrl from './worker/entry.worker.ts?worker&url';

export type SpectrogramMainPort = TypedMessagePort<
  Worker,
  FromSpectrogramWorkerMessage,
  ToSpectrogramWorkerMessage
>;

export const createSpectrogramMainPort = (): SpectrogramMainPort => {
  const worker = new Worker(spectrogramWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromSpectrogramWorkerMessage,
    ToSpectrogramWorkerMessage
  >();
};
