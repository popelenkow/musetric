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
  process: (outputs: Float32Array[]) => void;
};

export const createPlayerRuntime = (
  options: CreatePlayerRuntimeOptions,
): PlayerRuntime => {
  const { port, dataPort } = options;

  let frameCount = 0;
  let tracks: Record<StemType, Float32Array[]> | undefined = undefined;
  let frameIndex = 0;
  let playing = false;
  const trackVolumes: Partial<Record<StemType, number>> = {};
  const frameIndexTracker = createFrameIndexTracker(frameIndex);

  dataPort.bindHandlers({
    mount: (message) => {
      frameCount = message.frameCount;
      tracks = message.tracks;
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset(frameIndex);
      port.methods.setPlaying({ playing, frameIndex });
    },
    unmount: () => {
      frameCount = 0;
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
    process: (outputs) => {
      outputs.forEach((output) => {
        output.fill(0);
      });
      if (!tracks || !playing) {
        return;
      }

      const currentTracks = tracks;
      outputs.forEach((output, channelIndex) => {
        stemTypes.forEach((stemType) => {
          const samples = currentTracks[stemType][channelIndex];
          if (!samples) {
            return;
          }

          const volume = trackVolumes[stemType] ?? 1;
          output.forEach((_, i) => {
            const sample = samples[frameIndex + i] ?? 0;
            output[i] += sample * volume;
          });
        });
      });

      frameIndex += outputs[0].length;
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
