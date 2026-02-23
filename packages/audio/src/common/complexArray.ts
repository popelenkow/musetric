export type ComplexGpuBuffer = {
  real: GPUBuffer;
  imag: GPUBuffer;
};

export type ComplexCpuBuffer = {
  real: ArrayBuffer;
  imag: ArrayBuffer;
};

export type ComplexArray = {
  real: Float32Array<ArrayBuffer>;
  imag: Float32Array<ArrayBuffer>;
};

export const createComplexArray = (length: number): ComplexArray => ({
  real: new Float32Array(length),
  imag: new Float32Array(length),
});

export const subComplexArray = (
  array: ComplexArray,
  start: number,
  end: number,
): ComplexArray => ({
  real: array.real.subarray(start, end),
  imag: array.imag.subarray(start, end),
});

export const complexArrayFrom = (array: ComplexCpuBuffer): ComplexArray => ({
  real: new Float32Array(array.real),
  imag: new Float32Array(array.imag),
});
