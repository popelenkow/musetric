import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from '../portMessage.cross.js';

export type SpectrogramWorkerPort = TypedMessagePort<
  typeof self,
  ToSpectrogramWorkerMessage,
  FromSpectrogramWorkerMessage
>;

export const createSpectrogramWorkerPort = (): SpectrogramWorkerPort => {
  const port = wrapMessagePort(self).typed<
    ToSpectrogramWorkerMessage,
    FromSpectrogramWorkerMessage
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
