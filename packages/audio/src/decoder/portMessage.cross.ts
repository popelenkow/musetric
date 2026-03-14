import { type ChannelArrays } from '../common/channelBuffers.es.js';

export type ToDecoderWorkerMessage =
  | {
      type: 'init';
      projectId: number;
      sampleRate: number;
    }
  | {
      type: 'deinit';
    };

export type FromDecoderWorkerMessage =
  | {
      type: 'state';
      status: 'error';
    }
  | {
      type: 'decoded';
      channels: ChannelArrays<SharedArrayBuffer>;
      frameCount: number;
      duration: number;
    };
