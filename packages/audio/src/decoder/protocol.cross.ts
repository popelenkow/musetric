import { createMessageChannel } from '@musetric/resource-utils/cross/messageChannel';

export type DecoderOutboundMethods = {
  boot: (message: {
    playerPort: MessagePort;
    spectrogramPort: MessagePort;
  }) => void;
  mount: (message: { projectId: number; sampleRate: number }) => void;
  unmount: () => void;
};

export type DecoderInboundMethods = {
  setState: (message: { status: 'error' }) => void;
  mounted: (message: { frameCount: number }) => void;
  unmounted: () => void;
};

export const decoderChannel = createMessageChannel<
  DecoderInboundMethods,
  DecoderOutboundMethods
>({
  inbound: {
    keys: ['setState', 'mounted', 'unmounted'],
  },
  outbound: {
    keys: ['boot', 'mount', 'unmount'],
    transfers: {
      boot: (message) => [message.playerPort, message.spectrogramPort],
    },
  },
});
