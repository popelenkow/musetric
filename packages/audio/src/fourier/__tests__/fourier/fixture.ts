import { type ComplexArray } from '../../../common/complexArray.js';

export type FourierFixture = {
  name: string;
  windowSize: number;
  input: Float32Array<ArrayBuffer>;
  output: ComplexArray;
};

export const fourierFixtures: FourierFixture[] = [
  {
    name: 'FFT 2-point: unit impulse',
    windowSize: 2,
    input: Float32Array.from([1, 0]),
    output: {
      real: Float32Array.from([1, 1]),
      imag: Float32Array.from([0, 0]),
    },
  },
  {
    name: 'FFT 2-point: constant',
    windowSize: 2,
    input: Float32Array.from([1, 1]),
    output: {
      real: Float32Array.from([2, 0]),
      imag: Float32Array.from([0, 0]),
    },
  },
  {
    name: 'FFT 2-point: linear ramp',
    windowSize: 2,
    input: Float32Array.from([0, 1]),
    output: {
      real: Float32Array.from([1, -1]),
      imag: Float32Array.from([0, 0]),
    },
  },
  {
    name: 'FFT 4-point: unit impulse',
    windowSize: 4,
    input: Float32Array.from([1, 0, 0, 0]),
    output: {
      real: Float32Array.from([1, 1, 1, 1]),
      imag: Float32Array.from([0, 0, 0, 0]),
    },
  },
  {
    name: 'FFT 4-point: constant',
    windowSize: 4,
    input: Float32Array.from([1, 1, 1, 1]),
    output: {
      real: Float32Array.from([4, 0, 0, 0]),
      imag: Float32Array.from([0, 0, 0, 0]),
    },
  },
  {
    name: 'FFT 4-point: linear ramp',
    windowSize: 4,
    input: Float32Array.from([0, 1, 2, 3]),
    output: {
      real: Float32Array.from([6, -2, -2, -2]),
      imag: Float32Array.from([0, 2, 0, -2]),
    },
  },
  {
    name: 'FFT 8-point: unit impulse',
    windowSize: 8,
    input: Float32Array.from(
      Array.from({ length: 8 }, (_, i) => (i === 0 ? 1 : 0)),
    ),
    output: {
      real: Float32Array.from(new Array(8).fill(1)),
      imag: Float32Array.from(new Array(8).fill(0)),
    },
  },
  {
    name: 'FFT 8-point: constant',
    windowSize: 8,
    input: Float32Array.from(new Array(8).fill(1)),
    output: {
      real: Float32Array.from([8, ...new Array(7).fill(0)]),
      imag: Float32Array.from(new Array(8).fill(0)),
    },
  },
  {
    name: 'FFT 8-point: linear ramp',
    windowSize: 8,
    input: Float32Array.from([0, 1, 2, 3, 4, 5, 6, 7]),
    output: {
      real: Float32Array.from([28, -4, -4, -4, -4, -4, -4, -4]),
      imag: Float32Array.from([
        0, 9.656854, 4, 1.656854, 0, -1.656854, -4, -9.656854,
      ]),
    },
  },
  {
    name: 'FFT 8-point: sin 1',
    windowSize: 8,
    input: Float32Array.from(
      Array.from({ length: 8 }, (_, i) => Math.sin((2 * Math.PI * i) / 8)),
    ),
    output: {
      real: Float32Array.from(new Array(8).fill(0)),
      imag: Float32Array.from([0, -4, 0, 0, 0, 0, 0, 4]),
    },
  },
  {
    name: 'FFT 16-point: unit impulse',
    windowSize: 16,
    input: Float32Array.from([1, ...new Array(15).fill(0)]),
    output: {
      real: Float32Array.from(new Array(16).fill(1)),
      imag: Float32Array.from(new Array(16).fill(0)),
    },
  },
  {
    name: 'FFT 16-point: constant',
    windowSize: 16,
    input: Float32Array.from(new Array(16).fill(1)),
    output: {
      real: Float32Array.from([16, ...new Array(15).fill(0)]),
      imag: Float32Array.from(new Array(16).fill(0)),
    },
  },
  {
    name: 'FFT 16-point: sin 1',
    windowSize: 16,
    input: Float32Array.from(
      Array.from({ length: 16 }, (_, i) => Math.sin((2 * Math.PI * i) / 16)),
    ),
    output: {
      real: Float32Array.from(new Array(16).fill(0)),
      imag: Float32Array.from(
        Array.from({ length: 16 }, (_, i) => {
          if (i === 1) return -8;
          if (i === 15) return 8;
          return 0;
        }),
      ),
    },
  },
  {
    name: 'FFT 16-point: cos 3 & cos 5',
    windowSize: 16,
    input: Float32Array.from(
      Array.from(
        { length: 16 },
        (_, i) =>
          Math.cos((2 * Math.PI * 3 * i) / 16) +
          Math.cos((2 * Math.PI * 5 * i) / 16),
      ),
    ),
    output: {
      real: Float32Array.from(
        Array.from({ length: 16 }, (_, i) => {
          if (i === 3) return 8;
          if (i === 13) return 8;
          if (i === 5) return 8;
          if (i === 11) return 8;
          return 0;
        }),
      ),
      imag: Float32Array.from(new Array(16).fill(0)),
    },
  },
  {
    name: 'FFT 32-point: unit impulse',
    windowSize: 32,
    input: Float32Array.from([1, ...new Array(31).fill(0)]),
    output: {
      real: Float32Array.from(new Array(32).fill(1)),
      imag: Float32Array.from(new Array(32).fill(0)),
    },
  },
  {
    name: 'FFT 32-point: constant',
    windowSize: 32,
    input: Float32Array.from(new Array(32).fill(1)),
    output: {
      real: Float32Array.from([32, ...new Array(31).fill(0)]),
      imag: Float32Array.from(new Array(32).fill(0)),
    },
  },
  {
    name: 'FFT 32-point: sin 1',
    windowSize: 32,
    input: Float32Array.from(
      Array.from({ length: 32 }, (_, i) => Math.sin((2 * Math.PI * i) / 32)),
    ),
    output: {
      real: Float32Array.from(new Array(32).fill(0)),
      imag: Float32Array.from(
        Array.from({ length: 32 }, (_, i) => {
          if (i === 1) return -16;
          if (i === 31) return 16;
          return 0;
        }),
      ),
    },
  },
  {
    name: 'FFT 32-point: cos 3 & cos 5',
    windowSize: 32,
    input: Float32Array.from(
      Array.from(
        { length: 32 },
        (_, i) =>
          Math.cos((2 * Math.PI * 3 * i) / 32) +
          Math.cos((2 * Math.PI * 5 * i) / 32),
      ),
    ),
    output: {
      real: Float32Array.from(
        Array.from({ length: 32 }, (_, i) => {
          if (i === 3) return 16;
          if (i === 29) return 16;
          if (i === 5) return 16;
          if (i === 27) return 16;
          return 0;
        }),
      ),
      imag: Float32Array.from(new Array(32).fill(0)),
    },
  },
  {
    name: 'FFT 64-point: sin 7',
    windowSize: 64,
    input: Float32Array.from(
      Array.from({ length: 64 }, (_, i) =>
        Math.sin((2 * Math.PI * 7 * i) / 64),
      ),
    ),
    output: {
      real: Float32Array.from(new Array(64).fill(0)),
      imag: Float32Array.from(
        Array.from({ length: 64 }, (_, i) => {
          if (i === 7) return -32;
          if (i === 57) return 32;
          return 0;
        }),
      ),
    },
  },
  {
    name: 'FFT 128-point: cos 9',
    windowSize: 128,
    input: Float32Array.from(
      Array.from({ length: 128 }, (_, i) =>
        Math.cos((2 * Math.PI * 9 * i) / 128),
      ),
    ),
    output: {
      real: Float32Array.from(
        Array.from({ length: 128 }, (_, i) => {
          if (i === 9) return 64;
          if (i === 119) return 64;
          return 0;
        }),
      ),
      imag: Float32Array.from(new Array(128).fill(0)),
    },
  },
  {
    name: 'FFT 256-point: sin 12 & cos 20',
    windowSize: 256,
    input: Float32Array.from(
      Array.from(
        { length: 256 },
        (_, i) =>
          Math.sin((2 * Math.PI * 12 * i) / 256) +
          Math.cos((2 * Math.PI * 20 * i) / 256),
      ),
    ),
    output: {
      real: Float32Array.from(
        Array.from({ length: 256 }, (_, i) => {
          if (i === 20) return 128;
          if (i === 236) return 128;
          return 0;
        }),
      ),
      imag: Float32Array.from(
        Array.from({ length: 256 }, (_, i) => {
          if (i === 12) return -128;
          if (i === 244) return 128;
          return 0;
        }),
      ),
    },
  },
];
