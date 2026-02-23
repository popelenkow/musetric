import { type ExtPipelineConfig } from '../../pipeline.js';
import { createColors } from './colors.js';
import { createPipeline } from './pipeline.js';
import { createStateProgress } from './progress.js';

export type Config = Pick<
  ExtPipelineConfig,
  'visibleTimeBefore' | 'visibleTimeAfter' | 'colors'
>;

export type Draw = {
  run: (encoder: GPUCommandEncoder) => void;
  configure: (view: GPUTextureView, config: Config) => void;
  destroy: () => void;
};
export const createDraw = (
  device: GPUDevice,
  canvas: HTMLCanvasElement,
  marker?: GPUComputePassTimestampWrites,
): Draw => {
  const context = canvas.getContext('webgpu');
  if (!context) {
    throw new Error('WebGPU context not available on the canvas');
  }

  const pipeline = createPipeline(device, context);
  const progress = createStateProgress(device);
  const colors = createColors(device);
  const sampler = device.createSampler({
    label: 'draw-sampler',
    magFilter: 'nearest',
    minFilter: 'nearest',
  });
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let bindGroup: GPUBindGroup;

  const ref: Draw = {
    run: (encoder) => {
      const view = context.getCurrentTexture().createView({
        label: 'draw-view',
      });
      const pass = encoder.beginRenderPass({
        label: 'draw-pass',
        colorAttachments: [
          {
            view,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
        timestampWrites: marker,
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
    },
    configure: (view, config) => {
      progress.write(config);
      colors.write(config);
      bindGroup = device.createBindGroup({
        label: 'draw-bind-group',
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: colors.buffer } },
          { binding: 1, resource: { buffer: progress.buffer } },
          { binding: 2, resource: sampler },
          { binding: 3, resource: view },
        ],
      });
    },
    destroy: () => {
      colors.destroy();
      progress.destroy();
    },
  };

  return ref;
};
