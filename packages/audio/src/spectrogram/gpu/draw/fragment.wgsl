struct Colors {
  played : vec4f,
  unplayed : vec4f,
  background : vec4f,
};

struct Params {
  progress : f32,
};

@group(0) @binding(0) var<uniform> colors : Colors;
@group(0) @binding(1) var<uniform> params : Params;
@group(0) @binding(2) var valueSampler : sampler;
@group(0) @binding(3) var columnTexture : texture_2d<f32>;

@fragment
fn main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let progress = params.progress;
  
  let intensity = textureSample(columnTexture, valueSampler, vec2f(uv.x, 1.0 - uv.y)).r;
  var displayColor = colors.unplayed.xyz;
  if (uv.x < progress) {
    displayColor = colors.played.xyz;
  }
  let color = mix(colors.background.xyz, displayColor, intensity);
  return vec4f(color, 1.0);
}
