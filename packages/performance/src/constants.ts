import {
  type FourierMode,
  isGpuFourierMode,
  spectrogram,
} from '@musetric/audio';

export const runs = 10;
export const skipRuns = 10;
export const progress = 0.5;

export const canvasWidth = 1920;
export const canvasHeight = 1080;
const { sampleRate } = spectrogram.defaultConfig;

const getWindowSizes = () => {
  const sizes: number[] = [];
  for (let size = 64; size <= 1024 * 16; size *= 2) {
    sizes.push(size);
  }
  return sizes;
};
export const windowSizes = getWindowSizes();

const createWave = () => {
  const result = new Float32Array(sampleRate * 60 * 3);
  for (let i = 0; i < result.length; i++) {
    result[i] = Math.random() * 2 - 1;
  }
  return result;
};
export const wave = createWave();

export const getTimerLabels = (mode: FourierMode): readonly string[] =>
  isGpuFourierMode(mode)
    ? spectrogram.gpu.timerLabels
    : spectrogram.cpu.timerLabels;
