import {
  type ChannelArrays,
  toChannelArrays,
} from '../../common/channelBuffers.es.js';
import type { PlayerWorkletPort } from './port.worklet.js';

export type PlayerWorkletRuntime = {
  port: PlayerWorkletPort;
  process: (output: Float32Array[]) => boolean;
};
export const createPlayerWorkletRuntime = (
  port: PlayerWorkletPort,
): PlayerWorkletRuntime => {
  let channels: ChannelArrays | undefined = undefined;
  let frameOffset = 0;
  let playing = false;

  port.bindMethods({
    init: (message) => {
      channels = toChannelArrays(message.buffers);
    },
    deinit: () => {
      channels = undefined;
    },
    play: (message) => {
      frameOffset = message.startFrame;
      playing = true;
    },
    pause: () => {
      playing = false;
    },
  });

  return {
    port,
    process: (output) => {
      if (!channels || !playing) {
        for (const out of output) {
          out.fill(0);
        }
        return true;
      }

      for (let channel = 0; channel < output.length; channel++) {
        const out = output[channel];
        const data = channels[channel] ?? new Float32Array(0);
        for (let i = 0; i < out.length; i++) {
          const index = frameOffset + i;
          out[i] = index < data.length ? data[index] : 0;
        }
      }

      const frameCount = channels[0].length;
      frameOffset += output[0].length;
      if (frameOffset >= frameCount) {
        playing = false;
        port.methods.ended();
      }

      return true;
    },
  };
};
