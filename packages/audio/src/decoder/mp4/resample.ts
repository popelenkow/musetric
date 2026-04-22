const resampleChannel = async (
  channel: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number,
): Promise<Float32Array> => {
  const { ConverterType, create } =
    await import('@alexanderolsen/libsamplerate-js');
  const src = await create(1, sourceSampleRate, targetSampleRate, {
    converterType: ConverterType.SRC_SINC_FASTEST,
  });

  try {
    return src.simple(channel);
  } finally {
    src.destroy();
  }
};

export const resamplePcm = async (
  channels: Float32Array[],
  sourceSampleRate: number,
  targetSampleRate: number,
): Promise<Float32Array[]> => {
  if (sourceSampleRate === targetSampleRate) {
    return channels;
  }

  if (channels.length === 1) {
    const resampled = await resampleChannel(
      channels[0],
      sourceSampleRate,
      targetSampleRate,
    );
    return [resampled];
  }

  const [left, right] = await Promise.all([
    resampleChannel(channels[0], sourceSampleRate, targetSampleRate),
    resampleChannel(channels[1], sourceSampleRate, targetSampleRate),
  ]);

  return [left, right];
};
