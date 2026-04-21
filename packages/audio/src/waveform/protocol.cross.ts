import { createMessageChannel } from '@musetric/resource-utils/cross/messageChannel';
import type { ViewColors } from '../common/colors.es.js';
import type { ViewSize } from '../common/viewSize.es.js';
import type { WaveType } from '../common/waveType.es.js';

export type WaveformOutboundMethods = {
  boot: () => void;
  mount: (message: {
    projectId: number;
    waveType: WaveType;
    trackProgress: number;
    canvas: OffscreenCanvas;
    colors: ViewColors;
    viewSize: ViewSize;
  }) => void;
  unmount: (message: { waveType: WaveType }) => void;
  setTrackProgress: (message: { trackProgress: number }) => void;
  setColors: (message: { colors: ViewColors }) => void;
  resize: (message: { waveType: WaveType; viewSize: ViewSize }) => void;
};

export type WaveformInboundMethods = {
  booted: () => void;
  setState: (message: {
    waveType: WaveType;
    status: 'error' | 'success';
  }) => void;
};

export const waveformChannel = createMessageChannel<
  WaveformInboundMethods,
  WaveformOutboundMethods
>({
  inbound: {
    keys: ['booted', 'setState'],
  },
  outbound: {
    keys: [
      'boot',
      'mount',
      'unmount',
      'setTrackProgress',
      'setColors',
      'resize',
    ],
    transfers: {
      mount: (message) => [message.canvas],
    },
  },
});
