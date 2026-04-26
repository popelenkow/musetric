import { type StemType, stemTypes } from '../../common/stemType.es.js';
import {
  type playerChannel,
  type playerDataChannel,
} from '../protocol.cross.js';
import { createFrameIndexTracker } from '../trackFrameIndex.js';

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
  const frameIndexTracker = createFrameIndexTracker(sampleRate);

  dataPort.bindHandlers({
    mount: (message) => {
      frameCount = message.frameCount;
      tracks = message.tracks;
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset();
      port.methods.setPlaying({ playing, frameIndex });
    },
    unmount: () => {
      frameCount = 0;
      tracks = undefined;
      frameIndex = 0;
      playing = false;
      frameIndexTracker.reset();
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
      frameIndexTracker.reset();
      port.methods.setPlaying({ playing, frameIndex });
    },
    seek: (message) => {
      frameIndex = message.frameIndex;
      frameIndexTracker.reset();
      port.methods.setFrameIndex({ frameIndex });
    },
    setTrackVolume: (message) => {
      trackVolumes[message.stemType] = message.volume;
    },
  });

  return {
    port,
    process: (outputs) => {
      for (const output of outputs) {
        output.fill(0);
      }

      if (!tracks || !playing) {
        return;
      }

      for (const stemType of stemTypes) {
        const track = tracks[stemType];
        const volume = trackVolumes[stemType] ?? 1;

        for (
          let channelIndex = 0;
          channelIndex < outputs.length;
          channelIndex += 1
        ) {
          const output = outputs[channelIndex];
          const samples = track[channelIndex];
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!samples) {
            continue;
          }

          for (let offset = 0; offset < output.length; offset++) {
            const sample = samples[frameIndex + offset] ?? 0;
            output[offset] += sample * volume;
          }
        }
      }

      frameIndex += outputs[0].length;
      if (frameIndex >= frameCount) {
        frameIndex = 0;
        playing = false;
        frameIndexTracker.reset();
        port.methods.setPlaying({ playing, frameIndex });
        return;
      }

      if (frameIndexTracker.advance(outputs[0].length)) {
        port.methods.setFrameIndex({ frameIndex });
      }
    },
  };
};
