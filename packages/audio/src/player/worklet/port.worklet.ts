import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type EmptyPortMethods,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type PlayerCommandMethods,
  type PlayerDataMethods,
  type PlayerEventMethods,
} from '../protocol.cross.js';

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

export type PlayerDecoderDataPort = TypedMessagePort<
  MessagePort,
  EmptyPortMethods,
  PlayerDataMethods
>;

const playerDecoderDataMethodKeys = createObjectKeys<EmptyPortMethods>()([]);

export const createPlayerDecoderDataPort = (
  messagePort: MessagePort,
): PlayerDecoderDataPort =>
  createTypedPort<MessagePort, EmptyPortMethods, PlayerDataMethods>(
    messagePort,
    playerDecoderDataMethodKeys,
  );
