import {
  type ChannelArrays,
  toChannelArrays,
} from '../../common/channelBuffers.es.js';
import type { PlayerWorkletPort } from './port.worklet.js';
import { createFrameIndexTracker } from './trackFrameIndex.worklet.js';

export type PlayerWorkletRuntime = {
  port: PlayerWorkletPort;
  process: (output: Float32Array[]) => boolean;
};
export const createPlayerWorkletRuntime = (
  port: PlayerWorkletPort,
): PlayerWorkletRuntime => {
  let channels: ChannelArrays | undefined = undefined;
  let frameIndex = 0;
  let playing = false;
  const frameIndexTracker = createFrameIndexTracker(frameIndex);

  port.bindMethods({
    mount: (message) => {
      channels = toChannelArrays(message.buffers);
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.playing({ playing, frameIndex });
    },
    unmount: () => {
      channels = undefined;
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.playing({ playing, frameIndex });
    },
    play: () => {
      if (!channels) {
        return;
      }

      const frameCount = channels[0].length;
      if (frameIndex >= frameCount) {
        frameIndex = 0;
      }
      playing = true;
      port.methods.playing({ playing, frameIndex });
    },
    pause: () => {
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.playing({ playing, frameIndex });
    },
    seek: (message) => {
      if (!channels) {
        return;
      }
      frameIndex = Math.max(
        0,
        Math.min(message.frameIndex, channels[0].length),
      );
      frameIndexTracker.reset(frameIndex);
      port.methods.frameIndex({ frameIndex });
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
        const data = channels[channel];
        for (let i = 0; i < out.length; i++) {
          const index = frameIndex + i;
          out[i] = index < data.length ? data[index] : 0;
        }
      }

      const frameCount = channels[0].length;
      frameIndex += output[0].length;
      if (frameIndex >= frameCount) {
        frameIndex = 0;
        playing = false;
        frameIndexTracker.reset(frameIndex);
        port.methods.playing({ playing, frameIndex });
        return true;
      }

      if (frameIndexTracker.advance(frameIndex)) {
        port.methods.frameIndex({ frameIndex });
      }

      return true;
    },
  };
};
