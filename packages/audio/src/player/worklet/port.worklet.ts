import {
  type TypedMessagePort,
  wrapMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import type {
  FromPlayerWorkletMessage,
  ToPlayerWorkletMessage,
} from '../portMessage.es.js';

export type PlayerWorkletPort = TypedMessagePort<
  MessagePort,
  ToPlayerWorkletMessage,
  FromPlayerWorkletMessage
>;

export const createPlayerWorkletPort = (
  messagePort: MessagePort,
): PlayerWorkletPort => {
  const port = wrapMessagePort(messagePort).typed<
    ToPlayerWorkletMessage,
    FromPlayerWorkletMessage
  >();
  return port;
};
