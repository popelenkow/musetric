export const waveTypes = ['lead', 'backing', 'instrumental'] as const;
export type WaveType = (typeof waveTypes)[number];
