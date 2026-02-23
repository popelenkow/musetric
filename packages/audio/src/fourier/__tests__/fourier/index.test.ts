import { afterAll, describe, it } from 'vitest';
import {
  type ComplexArray,
  complexArrayFrom,
} from '../../../common/complexArray.js';
import { createComplexGpuBufferReader } from '../../../common/gpuBufferReader/index.js';
import { createGpuContext } from '../../../common/gpuContext.js';
import {
  allCpuFourierModes,
  allGpuFourierModes,
  cpuFouriers,
  gpuFouriers,
} from '../../fouriers.js';
import { assertArrayClose, createGpuBuffers, windowCount } from './common.js';
import { fourierFixtures } from './fixture.js';

describe('fourier', async () => {
  const { device } = await createGpuContext();

  for (const mode of allCpuFourierModes) {
    describe(mode, () => {
      for (const fixture of fourierFixtures) {
        describe(fixture.name, () => {
          const createFourier = cpuFouriers[mode];
          const fourier = createFourier();
          fourier.configure({
            windowSize: fixture.windowSize,
            windowCount,
          });

          it('forward', () => {
            const zeroImag = new Float32Array(fixture.windowSize).fill(0);
            const signal: ComplexArray = {
              real: fixture.input.slice(),
              imag: zeroImag,
            };
            fourier.forward(signal);
            assertArrayClose('real', signal.real, fixture.output.real);
            assertArrayClose('imag', signal.imag, fixture.output.imag);
          });

          it('inverse', () => {
            const zeroImag = new Float32Array(fixture.windowSize).fill(0);
            const signal: ComplexArray = {
              real: fixture.output.real.slice(),
              imag: fixture.output.imag.slice(),
            };
            fourier.inverse(signal);
            assertArrayClose('real', signal.real, fixture.input);
            assertArrayClose('imag', signal.imag, zeroImag);
          });
        });
      }
    });
  }

  for (const mode of allGpuFourierModes) {
    describe(mode, () => {
      for (const fixture of fourierFixtures) {
        describe(fixture.name, () => {
          const buffers = createGpuBuffers(device, fixture.windowSize);
          const createFourier = gpuFouriers[mode];
          const fourier = createFourier(device);
          fourier.configure(buffers.signal, {
            windowSize: fixture.windowSize,
            windowCount,
          });
          const reader = createComplexGpuBufferReader({
            device,
            typeSize: Float32Array.BYTES_PER_ELEMENT,
            size: fixture.windowSize,
          });

          it('forward', async () => {
            const zeroImag = new Float32Array(fixture.windowSize).fill(0);
            device.queue.writeBuffer(buffers.signal.real, 0, fixture.input);
            device.queue.writeBuffer(buffers.signal.imag, 0, zeroImag);
            const encoder = device.createCommandEncoder();
            fourier.forward(encoder);
            const command = encoder.finish();
            device.queue.submit([command]);
            await device.queue.onSubmittedWorkDone();
            const outputBuffer = await reader.read(buffers.signal);
            const result = complexArrayFrom(outputBuffer);
            assertArrayClose('real', result.real, fixture.output.real);
            assertArrayClose('imag', result.imag, fixture.output.imag);
          });

          afterAll(() => {
            fourier.destroy();
            reader.destroy();
            buffers.destroy();
          });
        });
      }
    });
  }
});
