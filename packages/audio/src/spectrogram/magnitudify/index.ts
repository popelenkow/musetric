import type { ResourceCell } from '@musetric/resource-utils';
import { createPipelines } from './pipeline.js';
import { createStateCell, type StateArg } from './state.js';

const workgroupSize = 64;

export type SpectrogramMagnitudify = {
  run: (encoder: GPUCommandEncoder) => void;
};

export const createSpectrogramMagnitudifyCell = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): ResourceCell<StateArg, SpectrogramMagnitudify> => {
  const pipelines = createPipelines(device);
  const stateCell = createStateCell(device, pipelines);

  return {
    get: (arg) => {
      const state = stateCell.get(arg);

      return {
        run: (encoder) => {
          const { windowSize, windowCount } = state.params.value;
          const halfSize = Math.ceil(windowSize / 2);
          const xCount = Math.ceil(halfSize / workgroupSize);

          const pass = encoder.beginComputePass({
            label: 'magnitudify-pass',
            timestampWrites: marker,
          });

          pass.setPipeline(state.pipelines.run);
          pass.setBindGroup(0, state.bindGroup);
          pass.dispatchWorkgroups(xCount, windowCount);

          pass.setPipeline(state.pipelines.move);
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
