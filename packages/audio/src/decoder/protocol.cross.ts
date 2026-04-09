import { type ChannelArrays } from '../common/channelBuffers.es.js';

export type DecoderCommandMethods = {
  mount: (message: { projectId: number; sampleRate: number }) => void;
  unmount: () => void;
};

export type DecoderEventMethods = {
  state: (message: { status: 'error' }) => void;
  mounted: (message: {
    channels: ChannelArrays<SharedArrayBuffer>;
    frameCount: number;
  }) => void;
  unmounted: () => void;
};
