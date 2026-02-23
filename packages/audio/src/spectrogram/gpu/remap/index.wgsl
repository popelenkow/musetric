struct RemapParams {
  halfSize: u32,
  width: u32,
  height: u32,
  minBin: u32,
  maxBin: u32,
  logMin: f32,
  logRange: f32,
};

@group(0) @binding(0) var<storage, read> signal: array<f32>;
@group(0) @binding(1) var texture: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(2) var<uniform> params: RemapParams;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) gid : vec3<u32>) {
  let halfSize = params.halfSize;
  let width = params.width;
  let height = params.height;
  let minBin = params.minBin;
  let maxBin = params.maxBin;
  let logMin = params.logMin;
  let logRange = params.logRange;
  
  let x = gid.x;
  let y = gid.y;
  if (x >= width || y >= height) {
    return;
  }
  let ratio = 1.0 - f32(y) / f32(height - 1u);
  let raw = exp(logMin + logRange * ratio);
  var idx = u32(floor(raw) - 1.0);
  if (idx < minBin) {
    idx = minBin;
  }
  if (idx >= maxBin) {
    idx = maxBin - 1u;
  }
  let offset = x * halfSize + idx;
  let intensity = signal[offset];
  textureStore(texture, vec2u(x, y), vec4f(intensity, 0.0, 0.0, 1.0));
}
