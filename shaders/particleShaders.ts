export const particleVertexShader = `
  uniform float uTime;
  uniform float uGatherFactor;

  attribute vec3 targetPosition;
  attribute vec3 randomPosition;
  attribute vec3 color;
  attribute float size;

  varying vec3 vColor;
  varying float vGather;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                   mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
               mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                   mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
  }

  void main() {
    vColor = color;
    vGather = uGatherFactor;

    vec3 pos = mix(randomPosition, targetPosition, uGatherFactor);

    float noiseScale = 0.35;
    float noiseSpeed = uTime * 0.2;
    vec3 vNoise = vec3(
      noise(pos * noiseScale + vec3(noiseSpeed, 0.0, 0.0)),
      noise(pos * noiseScale + vec3(0.0, noiseSpeed, 0.0)),
      noise(pos * noiseScale + vec3(0.0, 0.0, noiseSpeed))
    ) - 0.5;

    // Increase gathering noise slightly to prevent particles from being too perfectly aligned/concentrated
    pos += vNoise * mix(7.0, 1.2, uGatherFactor);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (260.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = `
  varying vec3 vColor;
  varying float vGather;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = pow(1.0 - dist * 2.0, 3.5);
    
    // Lowered brightness peak from 0.65 to 0.55 for a gentler look
    float brightness = mix(0.35, 0.55, vGather);
    
    // Muted alpha for softer blending
    gl_FragColor = vec4(vColor * brightness, alpha * 0.4);
  }
`;