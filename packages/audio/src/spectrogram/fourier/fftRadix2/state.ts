import { type ResourceCell } from '@musetric/resource-utils';
import { type ComplexGpuBuffer } from '../../common/complexArray.js';
import { type FourierConfig } from '../config.js';
import { assertWindowSizePowerOfTwo } from '../isPowerOfTwo.js';
import { createParamsCell, type StateParams } from './params.js';
import { type Pipelines } from './pipeline.js';
import { createReverseBindGroupCell } from './reverseBindGroup.js';
import { createReverseTableCell } from './reverseTable.js';
import { createTransformBindGroupCell } from './transformBindGroup.js';
import { createTrigTableCell } from './trigTable.js';

type BindGroups = {
  reverse: GPUBindGroup;
  transform: GPUBindGroup;
};
export type StateArg = {
  signal: ComplexGpuBuffer;
  config: FourierConfig;
};
export type State = {
  pipelines: Pipelines;
  bindGroups: BindGroups;
  params: StateParams;
};

export const createStateCell = (
  device: GPUDevice,
  pipelines: Pipelines,
): ResourceCell<StateArg, State> => {
  const paramsCell = createParamsCell(device);
  const reverseTableCell = createReverseTableCell(device);
  const trigTableCell = createTrigTableCell(device);
  const reverseBindGroupCell = createReverseBindGroupCell(device, pipelines);
  const transformBindGroupCell = createTransformBindGroupCell(
    device,
    pipelines,
  );

  return {
    get: (arg) => {
      const { signal, config } = arg;
      assertWindowSizePowerOfTwo(config.windowSize);
      const params = paramsCell.get(config);
      const reverseTable = reverseTableCell.get(config.windowSize);
      const trigTable = trigTableCell.get(config.windowSize);
      const bindGroups = {
        reverse: reverseBindGroupCell.get({
          signal: signal.real,
          reverseTable,
          params: params.buffer,
        }),
        transform: transformBindGroupCell.get({
          real: signal.real,
          imag: signal.imag,
          trigTable,
          params: params.buffer,
        }),
      };

      return {
        pipelines,
        bindGroups,
        params,
      };
    },
    dispose: () => {
      transformBindGroupCell.dispose();
      reverseBindGroupCell.dispose();
      trigTableCell.dispose();
      reverseTableCell.dispose();
      paramsCell.dispose();
    },
  };
};
