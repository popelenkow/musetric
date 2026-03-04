import { wrapMessagePort } from '@musetric/resource-utils/cross/messagePort';
import decoderWorkerUrl from './decoder.worker.ts?worker&url';
import {
  type FromDecoderWorkerMessage,
  type ToDecoderWorkerMessage,
} from './protocol.es.js';

export const createDecoderWorker = () => {
  const worker = new Worker(decoderWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromDecoderWorkerMessage,
    ToDecoderWorkerMessage
  >();
};
