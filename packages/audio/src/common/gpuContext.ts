export type GpuContext = { adapter: GPUAdapter; device: GPUDevice };

export const createGpuContext = async (
  profiling?: boolean,
): Promise<GpuContext> => {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) {
    throw new Error('WebGPU adapter not available');
  }
  const device = await adapter.requestDevice({
    requiredFeatures: profiling ? ['timestamp-query'] : undefined,
  });
  return { adapter, device };
};
