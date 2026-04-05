import { type ChannelArrays } from '../common/channelBuffers.es.js';

export type DecoderCommandMethods = {
  init: (message: { projectId: number; sampleRate: number }) => void;
  deinit: () => void;
};

export type DecoderEventMethods = {
  state: (message: { status: 'error' }) => void;
  decoded: (message: {
    channels: ChannelArrays<SharedArrayBuffer>;
    frameCount: number;
    duration: number;
  }) => void;
};
