import { wrapMessagePort } from '@musetric/resource-utils/cross/messagePort';
import type {
  FromPlayerWorkletMessage,
  ToPlayerWorkletMessage,
} from './portMessage.es.js';
import playerWorkletUrl from './worklet/player.worklet.ts?worker&url';

export const createPlayerNode = async (
  context: AudioContext,
): Promise<AudioWorkletNode> => {
  await context.audioWorklet.addModule(playerWorkletUrl);
  const node = new AudioWorkletNode(context, 'player-processor', {
    numberOfOutputs: 1,
    outputChannelCount: [2],
  });
  node.connect(context.destination);
  return node;
};

export const getPlayerPort = (node: AudioWorkletNode) =>
  wrapMessagePort(node.port).typed<
    FromPlayerWorkletMessage,
    ToPlayerWorkletMessage
  >();
