export type PitchDetection = {
  frequency?: number;
  confidence: number;
  energy: number;
};

export type DetectPitchOptions = {
  samples: Float32Array;
  centerFrameIndex: number;
  sampleRate: number;
};

const assessmentSampleRate = 8000;
const windowSampleCount = 1024;
const minimumFrequency = 70;
const maximumFrequency = 1000;
const minimumEnergy = 0.006;
const minimumConfidence = 0.45;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const getSample = (samples: Float32Array, frameIndex: number) => {
  if (frameIndex < 0 || frameIndex >= samples.length) {
    return 0;
  }
  return samples[frameIndex] ?? 0;
};

const getRefinedTau = (
  scores: Float32Array,
  tau: number,
  minimumTau: number,
  maximumTau: number,
) => {
  if (tau <= minimumTau || tau >= maximumTau) {
    return tau;
  }

  const left = scores[tau - 1] ?? 0;
  const center = scores[tau] ?? 0;
  const right = scores[tau + 1] ?? 0;
  const denominator = left - 2 * center + right;
  if (Math.abs(denominator) < 0.000001) {
    return tau;
  }

  return tau + 0.5 * ((left - right) / denominator);
};

export const detectPitch = (options: DetectPitchOptions): PitchDetection => {
  const { samples, centerFrameIndex, sampleRate } = options;
  const downsampleFactor = Math.max(
    1,
    Math.floor(sampleRate / assessmentSampleRate),
  );
  const downsampledSampleRate = sampleRate / downsampleFactor;
  const minimumTau = Math.max(
    1,
    Math.floor(downsampledSampleRate / maximumFrequency),
  );
  const maximumTau = Math.min(
    windowSampleCount - 2,
    Math.ceil(downsampledSampleRate / minimumFrequency),
  );
  const values = new Float32Array(windowSampleCount);
  const startFrameIndex =
    centerFrameIndex - Math.floor((windowSampleCount * downsampleFactor) / 2);

  let sum = 0;
  for (let index = 0; index < windowSampleCount; index += 1) {
    const sample = getSample(
      samples,
      startFrameIndex + index * downsampleFactor,
    );
    values[index] = sample;
    sum += sample;
  }

  const mean = sum / windowSampleCount;
  let energySum = 0;
  for (let index = 0; index < windowSampleCount; index += 1) {
    const value = (values[index] ?? 0) - mean;
    values[index] = value;
    energySum += value * value;
  }

  const energy = Math.sqrt(energySum / windowSampleCount);
  if (energy < minimumEnergy) {
    return {
      confidence: 0,
      energy,
    };
  }

  const scores = new Float32Array(maximumTau + 1);
  let bestTau = minimumTau;
  let bestScore = 0;

  for (let tau = minimumTau; tau <= maximumTau; tau += 1) {
    let correlation = 0;
    let firstEnergy = 0;
    let secondEnergy = 0;
    const count = windowSampleCount - tau;

    for (let index = 0; index < count; index += 1) {
      const first = values[index] ?? 0;
      const second = values[index + tau] ?? 0;
      correlation += first * second;
      firstEnergy += first * first;
      secondEnergy += second * second;
    }

    const denominator = firstEnergy + secondEnergy;
    const score = denominator > 0 ? (2 * correlation) / denominator : 0;
    scores[tau] = score;
    if (score > bestScore) {
      bestScore = score;
      bestTau = tau;
    }
  }

  if (bestScore < minimumConfidence) {
    return {
      confidence: clamp(bestScore, 0, 1),
      energy,
    };
  }

  const refinedTau = getRefinedTau(scores, bestTau, minimumTau, maximumTau);
  return {
    frequency: downsampledSampleRate / refinedTau,
    confidence: clamp(bestScore, 0, 1),
    energy,
  };
};
