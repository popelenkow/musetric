struct GpuFftRadix4ShaderParams {
  windowSize : u32,
  windowCount : u32,
  reverseWidth : u32,
};

@group(0) @binding(0) var<storage, read_write> dataReal : array<f32>;
@group(0) @binding(1) var<storage, read_write> dataImag : array<f32>;
@group(0) @binding(2) var<storage, read> trigTable : array<f32>;
@group(0) @binding(3) var<uniform> params : GpuFftRadix4ShaderParams;

@compute @workgroup_size(64)
fn main(
  @builtin(workgroup_id) workgroupId : vec3<u32>,
  @builtin(local_invocation_id) localId : vec3<u32>,
) {
  let windowSize = params.windowSize;
  let windowCount = params.windowCount;
  let reverseWidth = params.reverseWidth;
  
  let windowIndex = workgroupId.x;
  if (windowIndex >= windowCount) {
    return;
  }

  let threadIndex = localId.x;
  let windowOffset = windowSize * windowIndex;
  var step = 1u << reverseWidth;
  var len = windowSize >> reverseWidth;
  let sign = 1.0;

  if (len == 2u) {
    for (var outOff : u32 = threadIndex * 2u; outOff < windowSize; outOff += 2u * 64u) {
      let evenR = dataReal[windowOffset + outOff];
      let oddR = dataReal[windowOffset + outOff + 1u];
      dataReal[windowOffset + outOff] = evenR + oddR;
      dataImag[windowOffset + outOff] = 0.0;
      dataReal[windowOffset + outOff + 1u] = evenR - oddR;
      dataImag[windowOffset + outOff + 1u] = 0.0;
    }
  } else {
    for (var outOff : u32 = threadIndex * 4u; outOff < windowSize; outOff += 4u * 64u) {
      let Ar = dataReal[windowOffset + outOff];
      let Br = dataReal[windowOffset + outOff + 1u];
      let Cr = dataReal[windowOffset + outOff + 2u];
      let Dr = dataReal[windowOffset + outOff + 3u];

      let T0r = Ar + Cr;
      let T1r = Ar - Cr;
      let T2r = Br + Dr;
      let T3r = sign * (Br - Dr);

      let FAr = T0r + T2r;
      let FBr = T1r;
      let FCr = T0r - T2r;
      let FDr = T1r;

      dataReal[windowOffset + outOff] = FAr;
      dataImag[windowOffset + outOff] = 0.0;
      dataReal[windowOffset + outOff + 1u] = FBr;
      dataImag[windowOffset + outOff + 1u] = -T3r;
      dataReal[windowOffset + outOff + 2u] = FCr;
      dataImag[windowOffset + outOff + 2u] = 0.0;
      dataReal[windowOffset + outOff + 3u] = FDr;
      dataImag[windowOffset + outOff + 3u] = T3r;
    }
  }

  step = step >> 1u;

  while (step >= 2u) {
    let len = (windowSize / step) << 1u;
    let quarterLen = len >> 2u;
    for (var outOff : u32 = 0u; outOff < windowSize; outOff += len) {
      let limit = outOff + quarterLen;
      for (var i : u32 = outOff + threadIndex; i < limit; i += 64u) {
        let k = (i - outOff) * step;
        let A = windowOffset + i;
        let B = quarterLen + A;
        let C = quarterLen + B;
        let D = quarterLen + C;

        let Ar = dataReal[A];
        let Ai = dataImag[A];
        let Br = dataReal[B];
        let Bi = dataImag[B];
        let Cr = dataReal[C];
        let Ci = dataImag[C];
        let Dr = dataReal[D];
        let Di = dataImag[D];

        let MAr = Ar;
        let MAi = Ai;

        let tableBr = trigTable[k];
        let tableBi = sign * trigTable[k + 1u];
        let MBr = Br * tableBr - Bi * tableBi;
        let MBi = Br * tableBi + Bi * tableBr;

        let tableCr = trigTable[2u * k];
        let tableCi = sign * trigTable[2u * k + 1u];
        let MCr = Cr * tableCr - Ci * tableCi;
        let MCi = Cr * tableCi + Ci * tableCr;

        let tableDr = trigTable[3u * k];
        let tableDi = sign * trigTable[3u * k + 1u];
        let MDr = Dr * tableDr - Di * tableDi;
        let MDi = Dr * tableDi + Di * tableDr;

        let T0r = MAr + MCr;
        let T0i = MAi + MCi;
        let T1r = MAr - MCr;
        let T1i = MAi - MCi;
        let T2r = MBr + MDr;
        let T2i = MBi + MDi;
        let T3r = sign * (MBr - MDr);
        let T3i = sign * (MBi - MDi);

        let FAr = T0r + T2r;
        let FAi = T0i + T2i;
        let FCr = T0r - T2r;
        let FCi = T0i - T2i;
        let FBr = T1r + T3i;
        let FBi = T1i - T3r;
        let FDr = T1r - T3i;
        let FDi = T1i + T3r;

        dataReal[A] = FAr;
        dataImag[A] = FAi;
        dataReal[B] = FBr;
        dataImag[B] = FBi;
        dataReal[C] = FCr;
        dataImag[C] = FCi;
        dataReal[D] = FDr;
        dataImag[D] = FDi;
      }
      workgroupBarrier();
    }
    step = step >> 2u;
  }
}
