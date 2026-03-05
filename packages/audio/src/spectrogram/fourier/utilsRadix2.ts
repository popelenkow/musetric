const createReverseTable = (windowSize: number): Uint32Array<ArrayBuffer> => {
  const bits = Math.log2(windowSize);
  const table = new Uint32Array(windowSize);
  for (let i = 0; i < windowSize; i++) {
    let rev = 0;
    for (let bit = 0; bit < bits; bit++) {
      rev = (rev << 1) | ((i >> bit) & 1);
    }
    table[i] = rev;
  }
  return table;
};

const createTrigTable = (windowSize: number): Float32Array<ArrayBuffer> => {
  const table = new Float32Array(windowSize);
  for (let i = 0; i < windowSize; i += 2) {
    const angle = (Math.PI * i) / windowSize;
    table[i] = Math.cos(angle);
    table[i + 1] = Math.sin(angle);
  }
  return table;
};

export const utilsRadix2 = {
  createReverseTable,
  createTrigTable,
};
