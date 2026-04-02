export type SpectralAnalysis = {
  rms: number;
  peak: number;
  zeroCrossingRate: number;
  duration: number;
  sampleRate: number;
};

const analysisWindowSize = 4096;

export const analyzeWave = (
  wave: Float32Array,
  sampleRate: number,
): SpectralAnalysis => {
  const n = wave.length;
  if (n === 0) {
    return { rms: 0, peak: 0, zeroCrossingRate: 0, duration: 0, sampleRate };
  }

  let sumSq = 0;
  let peak = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < n; i++) {
    const sample = wave[i];
    sumSq += sample * sample;
    const abs = Math.abs(sample);
    if (abs > peak) peak = abs;
    if (i > 0 && (wave[i - 1] ?? 0) >= 0 !== sample >= 0) {
      zeroCrossings++;
    }
  }

  const rms = Math.sqrt(sumSq / n);
  const zeroCrossingRate = (zeroCrossings * sampleRate) / n;
  const duration = n / sampleRate;

  return { rms, peak, zeroCrossingRate, duration, sampleRate };
};

export const toDecibels = (linear: number): number => {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
};

export const formatDecibels = (db: number): string => {
  if (!isFinite(db)) return '-∞ dB';
  return `${db.toFixed(1)} dB`;
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ds = Math.floor((seconds % 1) * 10);
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}.${ds}s`;
};

export const estimateDominantFrequencyBand = (
  zeroCrossingRate: number,
): string => {
  const estimatedFreq = zeroCrossingRate / 2;
  if (estimatedFreq < 300) return 'low';
  if (estimatedFreq < 1200) return 'mid-low';
  if (estimatedFreq < 3000) return 'mid-high';
  return 'high';
};

export const analyzeWindowedWave = (
  wave: Float32Array,
  sampleRate: number,
): SpectralAnalysis => {
  const start = Math.max(
    0,
    Math.floor(wave.length / 2) - analysisWindowSize / 2,
  );
  const end = Math.min(wave.length, start + analysisWindowSize);
  const window = wave.subarray(start, end);
  return analyzeWave(window, sampleRate);
};
