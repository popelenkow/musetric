import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type EmptyPortMethods,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import type { PlayerDataMethods } from '../../player/protocol.cross.js';
import type { SpectrogramDataMethods } from '../../spectrogram/protocol.cross.js';
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

export type PlayerDataPort = TypedMessagePort<
  MessagePort,
  PlayerDataMethods,
  EmptyPortMethods
>;

const playerDataMethodKeys = createObjectKeys<PlayerDataMethods>()([
  'mount',
  'unmount',
]);

export const createPlayerDataPort = (
  messagePort: MessagePort,
): PlayerDataPort =>
  createTypedPort<MessagePort, PlayerDataMethods, EmptyPortMethods>(
    messagePort,
    playerDataMethodKeys,
  );

export type SpectrogramDataPort = TypedMessagePort<
  MessagePort,
  SpectrogramDataMethods,
  EmptyPortMethods
>;

const spectrogramDataMethodKeys = createObjectKeys<SpectrogramDataMethods>()([
  'wave',
  'clear',
]);

export const createSpectrogramDataPort = (
  messagePort: MessagePort,
): SpectrogramDataPort =>
  createTypedPort<MessagePort, SpectrogramDataMethods, EmptyPortMethods>(
    messagePort,
    spectrogramDataMethodKeys,
  );
