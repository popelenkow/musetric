import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type PlayerCommandMethods,
  type PlayerEventMethods,
} from '../protocol.es.js';

export type PlayerWorkletPort = TypedMessagePort<
  MessagePort,
  PlayerEventMethods,
  PlayerCommandMethods
>;

const playerEventMethodKeys = createObjectKeys<PlayerEventMethods>()([
  'playing',
  'frameIndex',
]);

export const createPlayerWorkletPort = (
  messagePort: MessagePort,
): PlayerWorkletPort => {
  const port = createTypedPort<
    MessagePort,
    PlayerEventMethods,
    PlayerCommandMethods
  >(messagePort, playerEventMethodKeys);
  return port;
};
