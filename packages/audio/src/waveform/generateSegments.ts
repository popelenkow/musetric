export type WaveSegment = {
  min: number;
  max: number;
};

export const generateSegments = (
  data: Float32Array<ArrayBuffer>,
  width: number,
): WaveSegment[] => {
  const step = data.length / (2 * width);
  const segments: WaveSegment[] = [];
  for (let i = 0; i < width; i++) {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);
    let min = 1;
    let max = -1;
    for (let j = start; j < end; j++) {
      min = Math.min(min, data[j * 2]);
      max = Math.max(max, data[j * 2 + 1]);
    }
    segments.push({ min, max });
  }
  return segments;
};
