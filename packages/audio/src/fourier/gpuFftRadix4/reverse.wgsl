struct GpuFftRadix4ShaderParams {
  windowSize : u32,
  windowCount : u32,
  reverseWidth : u32,
};

@group(0) @binding(0) var<storage, read_write> dataReal  : array<f32>;
@group(0) @binding(1) var<storage, read>  reverseTable : array<u32>;
@group(0) @binding(2) var<uniform> params : GpuFftRadix4ShaderParams;

fn mapToReversedIndex(originalIndex : u32, stepSize : u32, blockLength : u32) -> u32 {
  let blockIndex = originalIndex / stepSize;
  let inBlockIndex = originalIndex % stepSize;
  return reverseTable[inBlockIndex] * blockLength + blockIndex;
}

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

  for (var start : u32 = threadIndex; start < windowSize; start += 64u) {
    var j = mapToReversedIndex(start, step, len);
    var k = j;
    while (k > start) {
      k = mapToReversedIndex(k, step, len);
    }
    if (k == start) {
      var real = dataReal[windowOffset + start];
      j = mapToReversedIndex(start, step, len);
      while (j != start) {
        let tmpReal = dataReal[windowOffset + j];
        dataReal[windowOffset + j] = real;
        real = tmpReal;
        j = mapToReversedIndex(j, step, len);
      }
      dataReal[windowOffset + start] = real;
    }
  }
}
