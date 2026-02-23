struct GpuFourierParams {
  windowSize: u32,
  windowCount: u32,
};

@group(0) @binding(0) var<storage, read_write> dataReal: array<f32>;
@group(0) @binding(1) var<storage, read_write> dataImag: array<f32>;
@group(0) @binding(2) var<storage, read> trigTable: array<f32>;
@group(0) @binding(3) var<uniform> params: GpuFourierParams;


@compute @workgroup_size(64)
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>,
) {
  let windowSize = params.windowSize;
  let windowCount = params.windowCount;
  
  let windowIndex = workgroupId.x;
  if (windowIndex >= windowCount) {
    return;
  }

  let windowOffset = windowSize * windowIndex;
  let threadIndex = localId.x;
  let twiddleSign = -1.0;

  var sectionSize: u32 = 2u;
  while (sectionSize <= windowSize) {
    let halfSize = sectionSize >> 1u;
    let step = windowSize / sectionSize;
    for (var blockStart: u32 = 0u; blockStart < windowSize; blockStart += sectionSize) {
      for (var twiddleIndex: u32 = threadIndex; twiddleIndex < halfSize; twiddleIndex += 64u) {
        let firstIndex = windowOffset + blockStart + twiddleIndex;
        let secondIndex = firstIndex + halfSize;

        let trigIndex = twiddleIndex * step;
        let twiddleReal = trigTable[2u * trigIndex];
        let twiddleImag = twiddleSign * trigTable[2u * trigIndex + 1u];

        let evenReal = dataReal[firstIndex];
        let evenImag = dataImag[firstIndex];
        let oddReal = dataReal[secondIndex];
        let oddImag = dataImag[secondIndex];

        let productReal = oddReal * twiddleReal - oddImag * twiddleImag;
        let productImag = oddReal * twiddleImag + oddImag * twiddleReal;

        dataReal[firstIndex] = evenReal + productReal;
        dataImag[firstIndex] = evenImag + productImag;
        dataReal[secondIndex] = evenReal - productReal;
        dataImag[secondIndex] = evenImag - productImag;
      }
      workgroupBarrier();
    }
    workgroupBarrier();
    sectionSize = sectionSize << 1u;
  }
}
