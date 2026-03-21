import type { ResourceCell } from '@musetric/resource-utils';
import { createPipeline } from './pipeline.js';
import { createStateCell, type StateArg } from './state.js';

const workgroupSize = 64;

export type SpectrogramSliceWave = {
  run: (encoder: GPUCommandEncoder) => void;
  write: (waveArray: Float32Array, progress: number) => void;
};

export const createSpectrogramSliceWaveCell = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): ResourceCell<StateArg, SpectrogramSliceWave> => {
  const pipeline = createPipeline(device);
  const stateCell = createStateCell(device, pipeline);

  return {
    get: (arg) => {
      const state = stateCell.get(arg);

      return {
        run: (encoder) => {
          const { paddedWindowSize, windowCount } = state.params.value;
          const xGroups = Math.ceil(paddedWindowSize / workgroupSize);
          const pass = encoder.beginComputePass({
            label: 'slice-wave-pass',
            timestampWrites: marker,
          });
          pass.setPipeline(state.pipeline);
          pass.setBindGroup(0, state.bindGroup);
          pass.dispatchWorkgroups(xGroups, windowCount);
          pass.end();
        },
        write: (waveArray, progress) => {
          state.wave.write(waveArray, progress, state.config);
        },
      };
    },
    dispose: () => {
      stateCell.dispose();
    },
  };
};
