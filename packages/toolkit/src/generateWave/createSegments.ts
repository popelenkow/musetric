const waveColumns = 3840;

export const createSegments = async (
  durationSeconds: number,
  sampleRate: number,
  stream: AsyncIterable<Float32Array>,
): Promise<Float32Array> => {
  const totalSamples = Math.max(1, Math.floor(durationSeconds * sampleRate));
  const step = totalSamples / waveColumns;

  const segments = new Float32Array(waveColumns * 2);
  for (let i = 0; i < waveColumns; i++) {
    const base = i * 2;
    segments[base] = 1;
    segments[base + 1] = -1;
  }

  let sampleIndex = 0;
  for await (const floats of stream) {
    for (let i = 0; i + 1 < floats.length; i += 2) {
      const mono = (floats[i] + floats[i + 1]) / 2;
      const segmentIndex = Math.min(
        waveColumns - 1,
        Math.floor(sampleIndex / step),
      );
      const base = segmentIndex * 2;
      if (mono < segments[base]) segments[base] = mono;
      if (mono > segments[base + 1]) segments[base + 1] = mono;
      sampleIndex += 1;
    }
  }

  for (let i = 0; i < waveColumns; i++) {
    const base = i * 2;
    if (segments[base] > segments[base + 1]) {
      segments[base] = 0;
      segments[base + 1] = 0;
    }
  }

  return segments;
};
