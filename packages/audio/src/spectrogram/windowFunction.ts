export const bartlett = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  const last = windowSize - 1;
  for (let i = 0; i < windowSize; i++) {
    filter[i] = (2 / last) * (last / 2 - Math.abs(i - last / 2));
  }
  return filter;
};

export const bartlettHann = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  const last = windowSize - 1;
  for (let i = 0; i < windowSize; i++) {
    filter[i] = (2 / last) * (last / 2 - Math.abs(i - last / 2));
  }
  return filter;
};

export const blackman = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  const last = windowSize - 1;
  const alpha = 0.16;
  for (let i = 0; i < windowSize; i++) {
    const n = (2 * Math.PI * i) / last;
    const k = (4 * Math.PI * i) / last;
    filter[i] = (1 - alpha) / 2 - 0.5 * Math.cos(n) + (alpha / 2) * Math.cos(k);
  }
  return filter;
};

export const cosine = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    filter[i] = Math.cos((Math.PI * i) / (windowSize - 1) - Math.PI / 2);
  }
  return filter;
};

export const gauss = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  const alpha = 0.25;
  for (let i = 0; i < windowSize; i++) {
    const r1 = (i - (windowSize - 1) / 2) / ((alpha * (windowSize - 1)) / 2);
    filter[i] = Math.E ** (-0.5 * r1 ** 2);
  }
  return filter;
};

export const hamming = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    filter[i] = 0.54 - 0.46 * Math.cos((Math.PI * 2 * i) / (windowSize - 1));
  }
  return filter;
};

export const hann = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    filter[i] = 0.5 * (1 - Math.cos((Math.PI * 2 * i) / (windowSize - 1)));
  }
  return filter;
};

export const lanczoz = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  const last = windowSize - 1;
  for (let i = 0; i < windowSize; i++) {
    filter[i] =
      Math.sin(Math.PI * ((2 * i) / last - 1)) /
      (Math.PI * ((2 * i) / last - 1));
  }
  return filter;
};

export const rectangular = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    filter[i] = 1;
  }
  return filter;
};

export const triangular = (windowSize: number): Float32Array<ArrayBuffer> => {
  const filter = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    filter[i] =
      (2 / windowSize) * (windowSize / 2 - Math.abs(i - (windowSize - 1) / 2));
  }
  return filter;
};

export const windowFunctions = {
  bartlett,
  bartlettHann,
  blackman,
  cosine,
  gauss,
  hamming,
  hann,
  lanczoz,
  rectangular,
  triangular,
} as const;

export type WindowName = keyof typeof windowFunctions;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const windowNames = Object.keys(windowFunctions) as WindowName[];
