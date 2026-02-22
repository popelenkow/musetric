export type ChannelBuffers =
  | [ArrayBufferLike]
  | [ArrayBufferLike, ArrayBufferLike];
export type ChannelArrays = [Float32Array] | [Float32Array, Float32Array];

export const toBuffers = (arrays: ChannelArrays): ChannelBuffers =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  arrays.map((x) => x.buffer) as ChannelBuffers;

export const toArrays = (buffers: ChannelBuffers): ChannelArrays =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  buffers.map((x) => new Float32Array(x)) as ChannelArrays;
