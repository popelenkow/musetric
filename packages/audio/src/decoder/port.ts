import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type DecoderCommandMethods,
  type DecoderEventMethods,
} from './protocol.cross.js';

export type DecoderMainPort = TypedMessagePort<
  Worker,
  DecoderCommandMethods,
  DecoderEventMethods
>;

const decoderCommandMethodKeys = createObjectKeys<DecoderCommandMethods>()([
  'boot',
  'mount',
  'unmount',
]);

export const createDecoderMainPort = (
  decoderWorkerUrl: string | URL,
): DecoderMainPort => {
  const worker = new Worker(decoderWorkerUrl, { type: 'module' });
  const port = createTypedPort<
    Worker,
    DecoderCommandMethods,
    DecoderEventMethods
  >(worker, decoderCommandMethodKeys, {
    boot: (message) => [message.playerPort, message.spectrogramPort],
  });
  return port;
};
