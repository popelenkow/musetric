export type WaveformSegment = {
  min: number;
  max: number;
};

export const generateWaveformSegments = (
  wavePeaks: Float32Array,
  segmentCount: number,
): WaveformSegment[] => {
  const step = wavePeaks.length / (2 * segmentCount);
  const segments: WaveformSegment[] = [];
  for (let i = 0; i < segmentCount; i++) {
    const start = Math.floor(i * step);
    const end = Math.floor((i + 1) * step);
    let min = 1;
    let max = -1;
    for (let j = start; j < end; j++) {
      min = Math.min(min, wavePeaks[j * 2]);
      max = Math.max(max, wavePeaks[j * 2 + 1]);
    }
    segments.push({ min, max });
  }
  return segments;
};
