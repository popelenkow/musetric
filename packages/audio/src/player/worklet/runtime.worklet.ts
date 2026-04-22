import { type StemType, stemTypes } from '../../common/stemType.es.js';
import {
  type playerChannel,
  type playerDataChannel,
} from '../protocol.cross.js';
import { createFrameIndexTracker } from './trackFrameIndex.worklet.js';

export type CreatePlayerRuntimeOptions = {
  port: ReturnType<typeof playerChannel.inbound<MessagePort>>;
  dataPort: ReturnType<typeof playerDataChannel.inbound<MessagePort>>;
};

export type PlayerRuntime = {
  port: ReturnType<typeof playerChannel.inbound<MessagePort>>;
  process: (output: Float32Array[]) => void;
};

export const createPlayerRuntime = (
  options: CreatePlayerRuntimeOptions,
): PlayerRuntime => {
  const { port, dataPort } = options;

  let tracks: Record<StemType, Float32Array[]> | undefined = undefined;
  let frameIndex = 0;
  let playing = false;
  const trackVolumes: Partial<Record<StemType, number>> = {};
  const frameIndexTracker = createFrameIndexTracker(frameIndex);

  dataPort.bindHandlers({
    mount: (message) => {
      tracks = message.tracks;
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.setPlaying({ playing, frameIndex });
    },
    unmount: () => {
      tracks = undefined;
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.setPlaying({ playing, frameIndex });
    },
  });

  port.bindHandlers({
    play: () => {
      if (!tracks) {
        return;
      }

      const frameCount = Math.max(
        tracks.lead[0].length,
        tracks.backing[0].length,
        tracks.instrumental[0].length,
      );
      if (frameIndex >= frameCount) {
        frameIndex = 0;
      }
      playing = true;
      port.methods.setPlaying({ playing, frameIndex });
    },
    pause: () => {
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.setPlaying({ playing, frameIndex });
    },
    seek: (message) => {
      frameIndex = message.frameIndex;
      frameIndexTracker.reset(frameIndex);
      port.methods.setFrameIndex({ frameIndex });
    },
    setTrackVolume: (message) => {
      trackVolumes[message.stemType] = message.volume;
    },
  });

  return {
    port,
    process: (output) => {
      if (!tracks || !playing) {
        for (const out of output) {
          out.fill(0);
        }
        return;
      }

      for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
        const out = output[channelIndex];
        for (let i = 0; i < out.length; i++) {
          const index = frameIndex + i;
          let value = 0;

          for (const stemType of stemTypes) {
            const samples = tracks[stemType][channelIndex];
            const sample = index < samples.length ? samples[index] : 0;
            const volume = trackVolumes[stemType] ?? 1;
            value += sample * volume;
          }

          out[i] = value;
        }
      }

      const frameCount = Math.max(
        tracks.lead[0].length,
        tracks.backing[0].length,
        tracks.instrumental[0].length,
      );
      frameIndex += output[0].length;
      if (frameIndex >= frameCount) {
        frameIndex = 0;
        playing = false;
        frameIndexTracker.reset(frameIndex);
        port.methods.setPlaying({ playing, frameIndex });
        return;
      }

      if (frameIndexTracker.advance(frameIndex)) {
        port.methods.setFrameIndex({ frameIndex });
      }
    },
  };
};
