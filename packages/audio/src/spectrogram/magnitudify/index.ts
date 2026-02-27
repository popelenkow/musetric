import { createState, type State } from './state.js';

const workgroupSize = 64;

export type Magnitudify = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: State['configure'];
  destroy: State['destroy'];
};

export const createMagnitudify = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): Magnitudify => {
  const state = createState(device);

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
    configure: state.configure,
    destroy: state.destroy,
  };
};
