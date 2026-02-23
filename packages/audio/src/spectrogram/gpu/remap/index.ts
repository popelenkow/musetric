import { createState, type State } from './state.js';

const workgroupSize = 16;

export type Remap = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: State['configure'];
  destroy: State['destroy'];
};

export const createRemap = (
  device: GPUDevice,
  marker?: GPUComputePassTimestampWrites,
): Remap => {
  const state = createState(device);

  return {
    run: (encoder) => {
      const { width, height } = state.params.value;
      const xGroups = Math.ceil(width / workgroupSize);
      const yGroups = Math.ceil(height / workgroupSize);

      const pass = encoder.beginComputePass({
        label: 'remap-column-pass',
        timestampWrites: marker,
      });
      pass.setPipeline(state.pipeline);
      pass.setBindGroup(0, state.bindGroup);
      pass.dispatchWorkgroups(xGroups, yGroups);
      pass.end();
    },
    configure: state.configure,
    destroy: state.destroy,
  };
};
