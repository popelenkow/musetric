import { createCpuTimer } from '../../common/timer/index.js';
import { roundDuration } from '../../common/timer/roundDuration.js';

export const timerLabels = [
  'configure',
  'sliceWave',
  'zerofyImag',
  'windowing',
  'fourier',
  'magnitudify',
  'decibelify',
  'remap',
  'draw',
  'other',
  'total',
] as const;
export type TimerLabel = (typeof timerLabels)[number];
export type PipelineMetrics = Record<TimerLabel, number>;

const create = () => createCpuTimer(timerLabels);
type Timer = ReturnType<typeof create>;

export type Markers = Timer['markers'];

export type PipelineTimer = {
  markers: Markers;
  finish: () => void;
};

export const createPipelineTimer = (
  onMetrics?: (metrics: PipelineMetrics) => void,
): PipelineTimer => {
  if (!onMetrics) {
    return {
      markers: timerLabels.reduce(
        (acc, label) => {
          acc[label] = (fn) => fn;
          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {} as Markers,
      ),
      finish: () => {
        /** Nothing */
      },
    };
  }

  const timer = create();

  return {
    markers: timer.markers,
    finish: () => {
      const metrics = timer.read();
      const sum = timerLabels
        .slice(0, -2)
        .reduce((acc, key) => acc + metrics[key], 0);
      metrics.other = roundDuration(metrics.total - sum);
      onMetrics(metrics);
    },
  };
};
