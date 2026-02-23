import { createGpuTimer } from '../../common/timer/gpu.js';
import { createCpuTimer } from '../../common/timer/index.js';
import { roundDuration } from '../../common/timer/roundDuration.js';

export const timerLabels = [
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
export type TimerLabel = (typeof timerLabels)[number];
export type PipelineMetrics = Record<TimerLabel, number>;

const gpuLabels = [
  'sliceWave',
  'windowing',
  'fourierReverse',
  'fourierTransform',
  'magnitudify',
  'decibelify',
  'remap',
  'draw',
] as const satisfies TimerLabel[];

const cpuLabels = [
  'configure',
  'writeBuffers',
  'createCommand',
  'submitCommand',
  'total',
] as const satisfies TimerLabel[];

const create = (device: GPUDevice) => ({
  gpu: createGpuTimer(device, gpuLabels),
  cpu: createCpuTimer(cpuLabels),
});

type Timer = ReturnType<typeof create>;

type Markers = Partial<Timer['gpu']['markers']> & Timer['cpu']['markers'];

export type PipelineTimer = {
  markers: Markers;
  resolve: (encoder: GPUCommandEncoder) => void;
  finish: () => Promise<void>;
  destroy: () => void;
};

export const createPipelineTimer = (
  device: GPUDevice,
  onMetrics?: (metrics: PipelineMetrics) => void,
): PipelineTimer => {
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

  const pipelineTimer: PipelineTimer = {
    markers,
    resolve: timer.gpu.resolve,
    finish: async () => {
      const gpuMetrics = await timer.gpu.read();
      const cpuMetrics = timer.cpu.read();
      const metrics: PipelineMetrics = {
        ...gpuMetrics,
        ...cpuMetrics,
        other: 0,
      };
      const gpuSum = gpuLabels.reduce((acc, key) => acc + metrics[key], 0);
      metrics.submitCommand = roundDuration(metrics.submitCommand - gpuSum);
      const sum = timerLabels
        .slice(0, -2)
        .reduce((acc, key) => acc + metrics[key], 0);
      metrics.other = roundDuration(metrics.total - sum);
      const sortedMetrics = timerLabels.reduce<PipelineMetrics>(
        (acc, key) => ({
          ...acc,
          [key]: metrics[key],
        }),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {} as PipelineMetrics,
      );
      onMetrics(sortedMetrics);
    },
    destroy: timer.gpu.destroy,
  };

  return pipelineTimer;
};
