import { type ChannelArrays } from '@musetric/audio';

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
