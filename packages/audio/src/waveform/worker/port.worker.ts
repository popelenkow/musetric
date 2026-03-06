import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import type {
  FromWaveformWorkerMessage,
  ToWaveformWorkerMessage,
} from '../portMessage.cross.js';

export type WaveformWorkerPort = TypedMessagePort<
  typeof self,
  ToWaveformWorkerMessage,
  FromWaveformWorkerMessage
>;

export const createWaveformWorkerPort = (): WaveformWorkerPort => {
  const port = wrapMessagePort(self).typed<
    ToWaveformWorkerMessage,
    FromWaveformWorkerMessage
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
