import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type EmptyPortMethods,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type SpectrogramCommandMethods,
  type SpectrogramDataMethods,
  type SpectrogramEventMethods,
} from '../protocol.cross.js';

export type SpectrogramWorkerPort = TypedMessagePort<
  typeof self,
  SpectrogramEventMethods,
  SpectrogramCommandMethods
>;

const spectrogramEventMethodKeys = createObjectKeys<SpectrogramEventMethods>()([
  'state',
]);

export const createSpectrogramWorkerPort = (): SpectrogramWorkerPort => {
  const port = createTypedPort<
    typeof self,
    SpectrogramEventMethods,
    SpectrogramCommandMethods
  >(self, spectrogramEventMethodKeys);
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

export type SpectrogramDecoderDataPort = TypedMessagePort<
  MessagePort,
  EmptyPortMethods,
  SpectrogramDataMethods
>;

const spectrogramDecoderDataMethodKeys = createObjectKeys<EmptyPortMethods>()(
  [],
);

export const createSpectrogramDecoderDataPort = (
  messagePort: MessagePort,
): SpectrogramDecoderDataPort =>
  createTypedPort<MessagePort, EmptyPortMethods, SpectrogramDataMethods>(
    messagePort,
    spectrogramDecoderDataMethodKeys,
  );
