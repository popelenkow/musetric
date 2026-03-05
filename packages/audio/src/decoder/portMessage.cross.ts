import { type ChannelArrays } from '../common/channelBuffers.es.js';

export type ToDecoderWorkerMessage = {
  type: 'init';
  projectId: number;
  sampleRate: number;
};

export type FromDecoderWorkerMessage =
  | {
      type: 'state';
      status: 'pending' | 'error';
    }
  | {
      type: 'decoded';
      channels: ChannelArrays<SharedArrayBuffer>;
      frameCount: number;
      duration: number;
    };
