import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type SpectrogramCommandMethods,
  type SpectrogramEventMethods,
} from './protocol.cross.js';

export type SpectrogramMainPort = TypedMessagePort<
  Worker,
  SpectrogramCommandMethods,
  SpectrogramEventMethods
>;

const spectrogramCommandMethodKeys =
  createObjectKeys<SpectrogramCommandMethods>()([
    'boot',
    'mount',
    'unmount',
    'trackProgress',
    'config',
  ]);

export const createSpectrogramMainPort = (
  spectrogramWorkerUrl: string | URL,
): SpectrogramMainPort => {
  const worker = new Worker(spectrogramWorkerUrl, { type: 'module' });
  const port = createTypedPort<
    Worker,
    SpectrogramCommandMethods,
    SpectrogramEventMethods
  >(worker, spectrogramCommandMethodKeys, {
    boot: (message) => [message.decoderPort],
    mount: (message) => (message.config.canvas ? [message.config.canvas] : []),
  });
  return port;
};
