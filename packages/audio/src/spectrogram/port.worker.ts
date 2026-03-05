import { wrapMessagePort } from '@musetric/resource-utils/cross/messagePort';
import {
  type FromSpectrogramWorkerMessage,
  type ToSpectrogramWorkerMessage,
} from './portMessage.cross.js';

export const createPort = () => {
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
