import { createGpuContext, type GpuContext } from '@musetric/audio';
import { useEffect, useState } from 'react';

let gpuContext: GpuContext | undefined = undefined;
let promise: Promise<GpuContext> | undefined = undefined;
export const getGpuDevice = async (profiling: boolean) => {
  promise = promise ?? createGpuContext(profiling);
  gpuContext = gpuContext ?? (await promise);
  return gpuContext.device;
};

export const useGpuDevice = (profiling: boolean) => {
  const [device, setDevice] = useState<GPUDevice | undefined>(
    gpuContext?.device,
  );

  useEffect(() => {
    void getGpuDevice(profiling).then(setDevice);
  }, [profiling]);

  return device;
};
