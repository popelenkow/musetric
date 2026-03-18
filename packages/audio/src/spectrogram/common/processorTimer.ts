import {
  createCpuTimer,
  createGpuTimer,
  roundDuration,
} from './timer/index.js';

export const spectrogramTimerLabels = [
  'configure',
  'writeBuffers',
  'createCommand',
  'submitCommand',
  'sliceWave',
  'windowing',
  'fourierReverse',
  'fourierTransform',
  'magnitudify',
  'decibelify',
  'remap',
  'draw',
  'other',
  'total',
] as const;
export type SpectrogramTimerLabel = (typeof spectrogramTimerLabels)[number];
export type SpectrogramProcessorMetrics = Record<SpectrogramTimerLabel, number>;

const gpuLabels = [
  'sliceWave',
  'windowing',
  'fourierReverse',
  'fourierTransform',
  'magnitudify',
  'decibelify',
  'remap',
  'draw',
] as const satisfies SpectrogramTimerLabel[];

const cpuLabels = [
  'configure',
  'writeBuffers',
  'createCommand',
  'submitCommand',
  'total',
] as const satisfies SpectrogramTimerLabel[];

const create = (device: GPUDevice) => ({
  gpu: createGpuTimer(device, gpuLabels),
  cpu: createCpuTimer(cpuLabels),
});

type Timer = ReturnType<typeof create>;

type Markers = Partial<Timer['gpu']['markers']> & Timer['cpu']['markers'];

export type SpectrogramProcessorTimer = {
  markers: Markers;
  resolve: (encoder: GPUCommandEncoder) => void;
  finish: () => Promise<void>;
  destroy: () => void;
};

export const createSpectrogramProcessorTimer = (
  device: GPUDevice,
  onMetrics?: (metrics: SpectrogramProcessorMetrics) => void,
): SpectrogramProcessorTimer => {
  if (!onMetrics) {
    return {
      markers: cpuLabels.reduce(
        (acc, label) => {
          acc[label] = (fn) => fn;
          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {} as Markers,
      ),
      resolve: () => {
        /** Nothing */
      },
      finish: async () => {
        /** Nothing */
      },
      destroy: () => {
        /** Nothing */
      },
    };
  }

  const timer = create(device);
  const markers: Markers = {
    ...timer.gpu.markers,
    ...timer.cpu.markers,
  };

  const processorTimer: SpectrogramProcessorTimer = {
    markers,
    resolve: timer.gpu.resolve,
    finish: async () => {
      const gpuMetrics = await timer.gpu.read();
      const cpuMetrics = timer.cpu.read();
      const metrics: SpectrogramProcessorMetrics = {
        ...gpuMetrics,
        ...cpuMetrics,
        other: 0,
      };
      const gpuSum = gpuLabels.reduce((acc, key) => acc + metrics[key], 0);
      metrics.submitCommand = roundDuration(metrics.submitCommand - gpuSum);
      const sum = spectrogramTimerLabels
        .slice(0, -2)
        .reduce((acc, key) => acc + metrics[key], 0);
      metrics.other = roundDuration(metrics.total - sum);
      const sortedMetrics =
        spectrogramTimerLabels.reduce<SpectrogramProcessorMetrics>(
          (acc, key) => ({
            ...acc,
            [key]: metrics[key],
          }),
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          {} as SpectrogramProcessorMetrics,
        );
      onMetrics(sortedMetrics);
    },
    destroy: timer.gpu.destroy,
  };

  return processorTimer;
};
