export const minTempoBpm = (tempoBpm: number) => Math.floor(tempoBpm * 0.25);
export const maxTempoBpm = (tempoBpm: number) => Math.ceil(tempoBpm * 2);

export const minPitchShiftSemitones = -12;
export const maxPitchShiftSemitones = 12;
