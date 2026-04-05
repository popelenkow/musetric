import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type SpectrogramCommandMethods,
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
