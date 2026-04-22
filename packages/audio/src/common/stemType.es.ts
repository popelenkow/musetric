export const stemTypes = ['lead', 'backing', 'instrumental'] as const;
export type StemType = (typeof stemTypes)[number];
