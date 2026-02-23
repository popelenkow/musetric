const createTrigTable = (windowSize: number): Float32Array<ArrayBuffer> => {
  const table = new Float32Array(2 * windowSize);
  for (let i = 0; i < table.length; i += 2) {
    const angle = (Math.PI * i) / windowSize;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  return table;
};

const getReverseWidth = (windowSize: number): number => {
  // Find size's power of two
  let power = 0;
  for (let t = 1; windowSize > t; t <<= 1) {
    power++;
  }

  // Calculate initial step's reverseWidth:
  //   * If we are full radix-4 - it is 2x smaller to give initial len=8
  //   * Otherwise it is the same as `power` to give len=4
  const reverseWidth = power % 2 === 0 ? power - 1 : power;
  return reverseWidth - 1;
};

const createReverseTable = (reverseWidth: number): Uint32Array<ArrayBuffer> => {
  const reverseTable = new Uint32Array(1 << reverseWidth);

  for (let j = 0; j < reverseTable.length; j++) {
    reverseTable[j] = 0;
    for (let shift = 0; shift < reverseWidth + 1; shift += 2) {
      const revShift = reverseWidth - shift - 1;
      reverseTable[j] |= ((j >>> shift) & 3) << revShift;
    }
    reverseTable[j] /= 2;
  }

  return reverseTable;
};

export const utilsRadix4 = {
  createTrigTable,
  getReverseWidth,
  createReverseTable,
};
