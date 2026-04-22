import type { ResourceCell } from '@musetric/resource-utils';
import { createPipeline } from './pipeline.js';
import { createStateCell, type StateArg } from './state.js';

const workgroupSize = 64;

export type SpectrogramSliceSamples = {
  run: (encoder: GPUCommandEncoder) => void;
  write: (samples: Float32Array, trackProgress: number) => void;
};

export const createSpectrogramSliceSamplesCell = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): ResourceCell<StateArg, SpectrogramSliceSamples> => {
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
            label: 'slice-samples-pass',
            timestampWrites: marker,
          });
          pass.setPipeline(state.pipeline);
          pass.setBindGroup(0, state.bindGroup);
          pass.dispatchWorkgroups(xGroups, windowCount);
          pass.end();
        },
        write: (samples, trackProgress) => {
          state.samples.write(samples, trackProgress, state.config);
        },
      };
    },
    dispose: () => {
      stateCell.dispose();
    },
  };
};
