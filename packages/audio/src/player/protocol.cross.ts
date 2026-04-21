import { createMessageChannel } from '@musetric/resource-utils/cross/messageChannel';
import { type EmptyPortMethods } from '@musetric/resource-utils/cross/messagePort';
import { type ChannelBuffers } from '../common/channelBuffers.es.js';
import type { WaveType } from '../common/waveType.es.js';

export const playerProcessorName = 'player-processor';

export type PlayerOutboundMethods = {
  boot: (message: { dataPort: MessagePort }) => void;
  play: () => void;
  pause: () => void;
  seek: (message: { frameIndex: number }) => void;
  setTrackVolume: (message: { waveType: WaveType; volume: number }) => void;
};

export type PlayerInboundMethods = {
  booted: () => void;
  setPlaying: (message: { playing: boolean; frameIndex: number }) => void;
  setFrameIndex: (message: { frameIndex: number }) => void;
};

export const playerChannel = createMessageChannel<
  PlayerInboundMethods,
  PlayerOutboundMethods
>({
  inbound: {
    keys: ['booted', 'setPlaying', 'setFrameIndex'],
  },
  outbound: {
    keys: ['boot', 'play', 'seek', 'pause', 'setTrackVolume'],
    transfers: {
      boot: (message) => [message.dataPort],
    },
  },
});

export type PlayerDataMethods = {
  mount: (message: { tracks: Record<WaveType, ChannelBuffers> }) => void;
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
    keys: ['mount', 'unmount'],
  },
});
