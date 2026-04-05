import { type ChannelArrays } from '../common/channelBuffers.es.js';

export type DecoderCommandMethods = {
  mount: (message: { projectId: number; sampleRate: number }) => void;
  unmount: () => void;
};

export type DecoderEventMethods = {
  state: (message: { status: 'error' }) => void;
  decoded: (message: {
    channels: ChannelArrays<SharedArrayBuffer>;
    frameCount: number;
    duration: number;
  }) => void;
};
