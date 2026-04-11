import { createObjectKeys } from '@musetric/resource-utils';
import {
  createTypedPort,
  type TypedMessagePort,
} from '@musetric/resource-utils/cross/messagePort';
import {
  type PlayerCommandMethods,
  type PlayerEventMethods,
  playerProcessorName,
} from './protocol.cross.js';

export const createPlayerNode = async (
  context: AudioContext,
  playerWorkletUrl: string,
): Promise<AudioWorkletNode> => {
  await context.audioWorklet.addModule(playerWorkletUrl);
  const node = new AudioWorkletNode(context, playerProcessorName, {
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(context.destination);
  return node;
};

export type PlayerMainPort = TypedMessagePort<
  MessagePort,
  PlayerCommandMethods,
  PlayerEventMethods
>;

const playerCommandMethodKeys = createObjectKeys<PlayerCommandMethods>()([
  'boot',
  'play',
  'seek',
  'pause',
]);

export const getPlayerPort = (node: AudioWorkletNode): PlayerMainPort => {
  const port = createTypedPort<
    MessagePort,
    PlayerCommandMethods,
    PlayerEventMethods
  >(node.port, playerCommandMethodKeys, {
    boot: (message) => [message.decoderPort],
  });
  return port;
};
