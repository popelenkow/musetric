import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type DecoderCommandMethods,
  type DecoderEventMethods,
} from '../protocol.cross.js';

export type DecoderWorkerPort = TypedMessagePort<
  typeof self,
  DecoderEventMethods,
  DecoderCommandMethods
>;

const decoderEventMethodKeys = createObjectKeys<DecoderEventMethods>()([
  'state',
  'mounted',
  'unmounted',
]);

export const createDecoderWorkerPort = (): DecoderWorkerPort => {
  const port = createTypedPort<
    typeof self,
    DecoderEventMethods,
    DecoderCommandMethods
  >(self, decoderEventMethodKeys);
  const onError = () => {
    port.methods.state({
      status: 'error',
    });
  };
  port.instance.addEventListener('error', onError);
  port.instance.addEventListener('unhandledrejection', onError);
  port.instance.addEventListener('messageerror', onError);
  return port;
};
