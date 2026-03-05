export type ChannelBuffers<Buffer extends ArrayBufferLike = ArrayBufferLike> =
  | [Buffer]
  | [Buffer, Buffer];
export type ChannelArrays<Buffer extends ArrayBufferLike = ArrayBufferLike> =
  | [Float32Array<Buffer>]
  | [Float32Array<Buffer>, Float32Array<Buffer>];

export const toChannelBuffers = <Buffer extends ArrayBufferLike>(
  arrays: ChannelArrays<Buffer>,
): ChannelBuffers<Buffer> =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  arrays.map((x) => x.buffer) as ChannelBuffers<Buffer>;

export const toChannelArrays = <Buffer extends ArrayBufferLike>(
  buffers: ChannelBuffers<Buffer>,
): ChannelArrays<Buffer> =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  buffers.map((x) => new Float32Array(x)) as ChannelArrays<Buffer>;
