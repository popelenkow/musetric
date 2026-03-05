import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromDecoderWorkerMessage,
  type ToDecoderWorkerMessage,
} from '../portMessage.cross.js';

export type DecoderWorkerPort = TypedMessagePort<
  typeof self,
  ToDecoderWorkerMessage,
  FromDecoderWorkerMessage
>;

export const createDecoderWorkerPort = (): DecoderWorkerPort => {
  const port = wrapMessagePort(self).typed<
    ToDecoderWorkerMessage,
    FromDecoderWorkerMessage
  >();
  const onError = () => {
    port.postMessage({
      type: 'state',
      status: 'error',
    });
  };
  port.addEventListener('error', onError);
  port.addEventListener('unhandledrejection', onError);
  port.addEventListener('messageerror', onError);
  return port;
};
