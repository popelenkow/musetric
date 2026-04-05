import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type WaveformCommandMethods,
  type WaveformEventMethods,
} from '../portMessage.cross.js';

export type WaveformWorkerPort = TypedMessagePort<
  typeof self,
  WaveformEventMethods,
  WaveformCommandMethods
>;

const waveformEventMethodKeys = createObjectKeys<WaveformEventMethods>()([
  'state',
]);

export const createWaveformWorkerPort = (): WaveformWorkerPort => {
  const port = createTypedPort<
    typeof self,
    WaveformEventMethods,
    WaveformCommandMethods
  >(self, waveformEventMethodKeys);
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
