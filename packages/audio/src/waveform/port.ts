import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type WaveformCommandMethods,
  type WaveformEventMethods,
} from './protocol.cross.js';

export type WaveformMainPort = TypedMessagePort<
  Worker,
  WaveformCommandMethods,
  WaveformEventMethods
>;

const waveformCommandMethodKeys = createObjectKeys<WaveformCommandMethods>()([
  'mount',
  'unmount',
  'progress',
  'colors',
  'resize',
]);

export const createWaveformMainPort = (
  waveformWorkerUrl: string | URL,
): WaveformMainPort => {
  const worker = new Worker(waveformWorkerUrl, { type: 'module' });
  const port = createTypedPort<
    Worker,
    WaveformCommandMethods,
    WaveformEventMethods
  >(worker, waveformCommandMethodKeys, {
    mount: (message) => [message.canvas],
  });
  return port;
};
