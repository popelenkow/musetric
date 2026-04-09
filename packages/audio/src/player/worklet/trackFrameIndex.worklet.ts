const quantum = 128;

const alignFrames = (frameCount: number) => {
  return Math.max(quantum, Math.ceil(frameCount / quantum) * quantum);
};

const interval = alignFrames(sampleRate / 30);

export type FrameIndexTracker = {
  advance: (frameIndex: number) => boolean;
  reset: (frameIndex: number) => void;
};

export const createFrameIndexTracker = (initialFrameIndex: number) => {
  let lastFrameIndex = initialFrameIndex;

  const ref: FrameIndexTracker = {
    advance: (frameIndex) => {
      if (frameIndex - lastFrameIndex >= interval) {
        lastFrameIndex = frameIndex;
        return true;
      }

      return false;
    },
    reset: (frameIndex) => {
      lastFrameIndex = frameIndex;
    },
  };

  return ref;
};
