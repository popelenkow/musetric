import type { ResourceCell } from '@musetric/resource-utils';
import { createPipeline } from './pipeline.js';
import { createStateCell, type StateArg } from './state.js';

const workgroupSize = 64;

export type SpectrogramWindowing = {
  run: (encoder: GPUCommandEncoder) => void;
};

export const createSpectrogramWindowingCell = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): ResourceCell<StateArg, SpectrogramWindowing> => {
  const pipeline = createPipeline(device);
  const stateCell = createStateCell(device, pipeline);

  return {
    get: (arg) => {
      const state = stateCell.get(arg);

      return {
        run: (encoder) => {
          const { windowSize, windowCount } = state.params.value;
          const xCount = Math.ceil(windowSize / workgroupSize);
          const pass = encoder.beginComputePass({
            label: 'windowing-pass',
            timestampWrites: marker,
          });
          pass.setPipeline(state.pipeline);
          pass.setBindGroup(0, state.bindGroup);
          pass.dispatchWorkgroups(xCount, windowCount);
          pass.end();
        },
      };
    },
    dispose: () => {
      stateCell.dispose();
    },
  };
};
