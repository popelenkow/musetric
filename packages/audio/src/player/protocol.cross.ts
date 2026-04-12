import { createMessageChannel } from '@musetric/resource-utils/cross/messageChannel';
import { type EmptyPortMethods } from '@musetric/resource-utils/cross/messagePort';
import { type ChannelBuffers } from '../common/channelBuffers.es.js';

export const playerProcessorName = 'player-processor';

export type PlayerOutboundMethods = {
  boot: (message: { dataPort: MessagePort }) => void;
  play: () => void;
  pause: () => void;
  seek: (message: { frameIndex: number }) => void;
};

export type PlayerInboundMethods = {
  setPlaying: (message: { playing: boolean; frameIndex: number }) => void;
  setFrameIndex: (message: { frameIndex: number }) => void;
};

export const playerChannel = createMessageChannel<
  PlayerInboundMethods,
  PlayerOutboundMethods
>({
  inbound: {
    keys: ['setPlaying', 'setFrameIndex'],
  },
  outbound: {
    keys: ['boot', 'play', 'seek', 'pause'],
    transfers: {
      boot: (message) => [message.dataPort],
    },
  },
});

export type PlayerDataMethods = {
  setWave: (message: { buffers: ChannelBuffers }) => void;
  unmount: () => void;
};

export const playerDataChannel = createMessageChannel<
  EmptyPortMethods,
  PlayerDataMethods
>({
  inbound: {
    keys: [],
  },
  outbound: {
    keys: ['setWave', 'unmount'],
  },
});
