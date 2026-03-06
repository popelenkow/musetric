import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromDecoderWorkerMessage,
  type ToDecoderWorkerMessage,
} from './portMessage.cross.js';

export type DecoderMainPort = TypedMessagePort<
  Worker,
  FromDecoderWorkerMessage,
  ToDecoderWorkerMessage
>;

export const createDecoderMainPort = (
  decoderWorkerUrl: string | URL,
): DecoderMainPort => {
  const worker = new Worker(decoderWorkerUrl, { type: 'module' });
  return wrapMessagePort(worker).typed<
    FromDecoderWorkerMessage,
    ToDecoderWorkerMessage
  >();
};
