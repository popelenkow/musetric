export type Rgb = {
  red: number;
  green: number;
  blue: number;
};

export type RgbGradient = {
  red: Uint8ClampedArray;
  green: Uint8ClampedArray;
  blue: Uint8ClampedArray;
};

export type ViewColors = {
  played: string;
  unplayed: string;
  background: string;
};

export type ViewGradients = {
  played: RgbGradient;
  unplayed: RgbGradient;
};

export const parseHexColor = (hex: string): Rgb => {
  let h = hex.startsWith('#') ? hex.slice(1) : hex;
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return { red: (n >> 16) & 255, green: (n >> 8) & 255, blue: n & 255 };
};

export const createGradient = (from: Rgb, to: Rgb): RgbGradient => {
  const red = new Uint8ClampedArray(256);
  const green = new Uint8ClampedArray(256);
  const blue = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    red[i] = Math.round(from.red + (to.red - from.red) * t);
    green[i] = Math.round(from.green + (to.green - from.green) * t);
    blue[i] = Math.round(from.blue + (to.blue - from.blue) * t);
  }
  return { red, green, blue };
};
