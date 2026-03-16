import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './portMessage.cross.js';

export type SpectrogramMainPort = TypedMessagePort<
  Worker,
  FromSpectrogramWorkerMessage,
  ToSpectrogramWorkerMessage
>;

export const createSpectrogramMainPort = (
  spectrogramWorkerUrl: string,
): SpectrogramMainPort => {
  const worker = new Worker(spectrogramWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromSpectrogramWorkerMessage,
    ToSpectrogramWorkerMessage
  >();
};
