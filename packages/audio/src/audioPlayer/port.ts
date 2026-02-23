import { wrapMessagePort } from '@musetric/resource-utils/cross/messagePort';
import playerWorkletUrl from './index.worklet.js?worker&url';
import type { FromWorkletMessage, ToWorkletMessage } from './message.es.js';

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
  wrapMessagePort(node.port).typed<FromWorkletMessage, ToWorkletMessage>();
