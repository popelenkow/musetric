import { createState, type State } from './state.js';

const workgroupSize = 64;

export type Decibelify = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: State['configure'];
  destroy: State['destroy'];
};
export const createDecibelify = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): Decibelify => {
  const state = createState(device);

  return {
    run: (encoder) => {
      const { halfSize, windowCount } = state.params.value;
      const xCount = Math.ceil(halfSize / workgroupSize);

      const pass = encoder.beginComputePass({
        label: 'decibelify-pass',
        timestampWrites: marker,
      });

      pass.setPipeline(state.pipelines.findMax);
      pass.setBindGroup(0, state.bindGroup);
      pass.dispatchWorkgroups(windowCount);

      pass.setPipeline(state.pipelines.run);
      pass.setBindGroup(0, state.bindGroup);
      pass.dispatchWorkgroups(xCount, windowCount);

      pass.end();
    },
    configure: state.configure,
    destroy: state.destroy,
  };
};
