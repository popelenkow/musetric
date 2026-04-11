import { createMessageChannel } from '@musetric/resource-utils/cross/messageChannel';
import { type EmptyPortMethods } from '@musetric/resource-utils/cross/messagePort';
import type { SpectrogramConfig } from './config.cross.js';

export type SpectrogramOutboundMethods = {
  boot: (message: { dataPort: MessagePort }) => void;
  mount: (message: {
    config: Partial<SpectrogramConfig>;
    trackProgress: number;
  }) => void;
  unmount: () => void;
  trackProgress: (message: { trackProgress: number }) => void;
  config: (message: { patch: Partial<SpectrogramConfig> }) => void;
};

export type SpectrogramInboundMethods = {
  state: (message: { status: 'pending' | 'error' | 'success' }) => void;
};

export const spectrogramChannel = createMessageChannel<
  SpectrogramInboundMethods,
  SpectrogramOutboundMethods
>({
  inbound: {
    keys: ['state'],
  },
  outbound: {
    keys: ['boot', 'mount', 'unmount', 'trackProgress', 'config'],
    transfers: {
      boot: (message) => [message.dataPort],
      mount: (message) =>
        message.config.canvas ? [message.config.canvas] : [],
    },
  },
});

export type SpectrogramDataMethods = {
  wave: (message: { waveBuffer: SharedArrayBuffer }) => void;
  clear: () => void;
};

export const spectrogramDataChannel = createMessageChannel<
  EmptyPortMethods,
  SpectrogramDataMethods
>({
  inbound: {
    keys: [],
  },
  outbound: {
    keys: ['wave', 'clear'],
  },
});
