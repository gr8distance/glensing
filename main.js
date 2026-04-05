import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

// ---------------------------------------------------------------------------
// Mock packages (replace with real JSON fetch later)
// ---------------------------------------------------------------------------
const PACKAGES = [
  { name: "alexandria", desc: "A collection of portable public-domain utilities" },
  { name: "cl-ppcre", desc: "Portable Perl-compatible regular expressions" },
  { name: "bordeaux-threads", desc: "Portable multithreading primitives" },
  { name: "usocket", desc: "Universal socket library" },
  { name: "dexador", desc: "Fast HTTP client" },
  { name: "jonathan", desc: "High-performance JSON encoder/decoder" },
  { name: "lack", desc: "Minimal Clack-compatible web application interface" },
  { name: "ningle", desc: "Lightweight web framework" },
  { name: "sxql", desc: "SQL generator from S-expressions" },
  { name: "mito", desc: "ORM with migration support" },
  { name: "cl-async", desc: "Asynchronous I/O library" },
  { name: "ironclad", desc: "Cryptographic toolkit" },
  { name: "lparallel", desc: "Parallel programming library" },
  { name: "trivia", desc: "Pattern matching for Common Lisp" },
  { name: "str", desc: "Modern string manipulation library" },
  { name: "log4cl", desc: "Logging framework" },
  { name: "fiveam", desc: "Regression testing framework" },
  { name: "parachute", desc: "Extensible testing framework" },
  { name: "arrows", desc: "Threading macro implementations" },
  { name: "serapeum", desc: "Utilities beyond Alexandria" },
  { name: "cl-json", desc: "JSON encoder/decoder" },
  { name: "hunchentoot", desc: "Web server written in Common Lisp" },
  { name: "closer-mop", desc: "Cross-implementation MOP compatibility" },
  { name: "cffi", desc: "C foreign function interface" },
  { name: "flexi-streams", desc: "Flexible bivalent streams" },
];

// ---------------------------------------------------------------------------
// Scene setup
// ---------------------------------------------------------------------------
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

// Camera state
const CAM_HOME = { pos: new THREE.Vector3(0, 2, 8), target: new THREE.Vector3(0, 0, 0) };
const camState = {
  pos: CAM_HOME.pos.clone(),
  target: CAM_HOME.target.clone(),
  goalPos: CAM_HOME.pos.clone(),
  goalTarget: CAM_HOME.target.clone(),
  mode: "home", // "home" | "zoom-earth" | "returning"
};
camera.position.copy(camState.pos);
camera.lookAt(camState.target);

// Post-processing: bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.0, 0.45, 0.35
);
composer.addPass(bloom);

// Gravitational lensing post-processing
const lensingShader = {
  uniforms: {
    tDiffuse: { value: null },
    uBhScreen: { value: new THREE.Vector2(0.5, 0.45) }, // BH screen position
    uStrength: { value: 1.0 },
    uRadius: { value: 0.35 }, // effect radius in screen space
  },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uBhScreen;
    uniform float uStrength;
    uniform float uRadius;
    varying vec2 vUv;

    void main() {
      vec2 delta = vUv - uBhScreen;
      // Correct for aspect ratio
      float aspect = 1.0; // will be updated
      delta.x *= aspect;
      float dist = length(delta);

      // Einstein ring distortion
      // Inside the effect radius, warp UV coordinates radially
      float normalizedDist = dist / uRadius;

      // Black hole shadow: force dark center to counteract bloom bleed
      float shadowRadius = 0.18;
      float shadow = smoothstep(shadowRadius, shadowRadius + 0.06, normalizedDist);

      if (normalizedDist < 1.0 && normalizedDist > 0.08) {
        // Gravitational deflection: Schwarzschild-like
        float deflection = uStrength * 0.02 / (normalizedDist * normalizedDist + 0.2);

        vec2 dir = normalize(delta);
        vec2 warpedUv = vUv + dir * deflection;

        // Einstein ring near photon sphere
        float ringDist = abs(normalizedDist - 0.25);
        float ringStrength = exp(-ringDist * ringDist * 150.0) * 0.4;

        vec4 mainColor = texture2D(tDiffuse, warpedUv);

        // Einstein ring: sample from opposite side
        vec2 ringUv = uBhScreen - delta * 0.35;
        vec4 ringColor = texture2D(tDiffuse, ringUv);

        gl_FragColor = mix(mainColor, mainColor + ringColor * 0.2, ringStrength);
      } else {
        gl_FragColor = texture2D(tDiffuse, vUv);
      }

      // Apply BH shadow — darken center regardless of bloom
      gl_FragColor.rgb *= shadow;
    }
  `,
};
const lensingPass = new ShaderPass(lensingShader);
composer.addPass(lensingPass);

// ---------------------------------------------------------------------------
// Background stars — with twinkling + spectral colors
// ---------------------------------------------------------------------------
function createStarField(count) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count); // twinkle phase

  // Spectral types: O(blue) B(blue-white) A(white) F(yellow-white) G(yellow) K(orange) M(red)
  const spectral = [
    [0.6, 0.7, 1.0], [0.75, 0.8, 1.0], [1.0, 1.0, 1.0],
    [1.0, 0.95, 0.8], [1.0, 0.9, 0.6], [1.0, 0.7, 0.4], [1.0, 0.5, 0.3],
  ];

  for (let i = 0; i < count; i++) {
    const r = 40 + Math.random() * 960;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const brightness = 0.2 + Math.random() * 0.8;
    // Weighted toward white/yellow (A/F/G types more common)
    const type = spectral[Math.floor(Math.pow(Math.random(), 0.7) * spectral.length)];
    colors[i * 3] = type[0] * brightness;
    colors[i * 3 + 1] = type[1] * brightness;
    colors[i * 3 + 2] = type[2] * brightness;

    sizes[i] = 0.3 + Math.pow(Math.random(), 3) * 2.5; // few bright stars, many dim
    phases[i] = Math.random() * 6.28;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));

  const starMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float size;
      attribute float phase;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vTwinkle;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        // Twinkle: each star has unique phase and frequency
        float freq = 1.5 + phase * 0.5;
        vTwinkle = 0.7 + 0.3 * sin(uTime * freq + phase * 20.0)
                       * sin(uTime * freq * 0.7 + phase * 13.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPixelRatio * vTwinkle * (120.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        // Soft core with diffraction spikes approximation
        float core = exp(-d * d * 8.0);
        float halo = exp(-d * d * 2.0) * 0.3;
        float brightness = core + halo;
        gl_FragColor = vec4(vColor * brightness * vTwinkle, brightness * 0.95);
      }
    `,
  });

  return { points: new THREE.Points(geo, starMat), material: starMat };
}
const starField = createStarField(5000);
scene.add(starField.points);

// ---------------------------------------------------------------------------
// Nebula background — subtle colored gas clouds
// ---------------------------------------------------------------------------
const nebulaGeo = new THREE.PlaneGeometry(600, 600);
const nebulaMat = new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;

    // Simplex-like noise
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0; float a = 0.5;
      for (int i = 0; i < 4; i++) { v += a*noise(p); p *= 2.1; a *= 0.5; }
      return v;
    }

    void main() {
      vec2 uv = vUv * 3.0;
      float n1 = fbm(uv + uTime * 0.01);
      float n2 = fbm(uv * 1.5 + vec2(5.0) + uTime * 0.008);
      float n3 = fbm(uv * 0.8 + vec2(10.0) - uTime * 0.005);

      vec3 c1 = vec3(0.15, 0.05, 0.3) * n1;  // purple
      vec3 c2 = vec3(0.05, 0.1, 0.25) * n2;   // blue
      vec3 c3 = vec3(0.2, 0.05, 0.1) * n3;    // red

      vec3 color = c1 + c2 + c3;
      float alpha = (n1 * n2 + n3 * 0.3) * 0.12;
      gl_FragColor = vec4(color, alpha);
    }
  `,
});
const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
nebula.position.z = -300;
scene.add(nebula);

// ---------------------------------------------------------------------------
// GLSL noise (shared)
// ---------------------------------------------------------------------------
const GLSL_NOISE = `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a*noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }
`;

// ---------------------------------------------------------------------------
// Black hole core — with shadow sphere
// ---------------------------------------------------------------------------
const blackHole = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 64, 64),
  new THREE.ShaderMaterial({
    depthWrite: true,
    uniforms: {},
    vertexShader: `
      varying vec3 vNormal;
      void main() { vNormal = normalize(normalMatrix*normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        // Pure black with very subtle edge highlight (gravitational lensing hint)
        float edge = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 10.0);
        gl_FragColor = vec4(vec3(0.06, 0.02, 0.12) * edge, 1.0);
      }
    `,
  })
);
blackHole.renderOrder = 10;
scene.add(blackHole);

// Photon ring — thin bright ring at the photon sphere
const photonRingMat = new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform float uTime; varying vec2 vUv;
    void main() {
      float r = vUv.y; // 0 = inner, 1 = outer for ring geometry
      // Sharp photon ring brightness profile
      float ring1 = exp(-pow((r - 0.3) * 10.0, 2.0));  // primary
      float ring2 = exp(-pow((r - 0.6) * 8.0, 2.0)) * 0.5; // secondary
      float ring3 = exp(-pow((r - 0.85) * 12.0, 2.0)) * 0.2; // tertiary

      float angle = atan(vUv.x - 0.5, r);
      float flicker = 0.85 + 0.15 * sin(angle * 12.0 + uTime * 2.5);

      float total = (ring1 + ring2 + ring3) * flicker;
      vec3 color = mix(vec3(1.0, 0.85, 0.5), vec3(0.7, 0.4, 1.0), r);
      gl_FragColor = vec4(color * total * 1.2, total * 0.7);
    }
  `,
});
const photonRing = new THREE.Mesh(new THREE.RingGeometry(0.72, 1.05, 128, 1), photonRingMat);
scene.add(photonRing);

// Event horizon glow ring
const glowRingMat = new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform float uTime; varying vec2 vUv;
    void main() {
      float dist = abs(vUv.y - 0.5) * 2.0;
      float glow = smoothstep(1.0, 0.0, dist);
      vec3 color = mix(vec3(0.5,0.2,1.0), vec3(1.0,0.6,0.2), dist);
      float pulse = 0.8 + 0.2*sin(uTime*1.5);
      gl_FragColor = vec4(color, glow * 0.5 * pulse);
    }
  `,
});
scene.add(new THREE.Mesh(new THREE.RingGeometry(0.72, 0.95, 128), glowRingMat));

// ---------------------------------------------------------------------------
// Accretion disk — with turbulent noise + Doppler color shift
// ---------------------------------------------------------------------------
const diskMat = new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv; varying float vRadius; varying vec2 vPos;
    void main() { vUv = uv; vRadius = length(position.xy); vPos = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform float uTime; varying vec2 vUv; varying float vRadius; varying vec2 vPos;
    ${GLSL_NOISE}
    void main() {
      float angle = atan(vPos.y, vPos.x);
      float nr = (vRadius - 1.0) / 3.5;

      // Turbulent noise for organic structure
      vec2 noiseCoord = vec2(angle * 2.0 + uTime * 0.3, nr * 8.0 - uTime * 0.1);
      float turb = fbm(noiseCoord) * 0.8 + 0.2;
      float turb2 = fbm(noiseCoord * 1.5 + vec2(42.0, 17.0)) * 0.6;

      // Spiral arms
      float spiral = sin(angle * 4.0 + uTime * 0.6 - nr * 15.0) * 0.5 + 0.5;
      float spiral2 = sin(angle * 7.0 - uTime * 0.4 + nr * 10.0) * 0.5 + 0.5;

      // Radial falloff
      float fade = smoothstep(1.0, 0.0, nr) * smoothstep(0.0, 0.12, nr);

      // Doppler shift: approaching side is blue-shifted, receding is red-shifted
      float doppler = sin(angle + uTime * 0.6) * 0.5 + 0.5;

      // Relativistic beaming: approaching side is brighter (subtle D^2)
      float beamFactor = 0.5 + doppler * doppler * 1.2;

      // Color gradient with Doppler
      vec3 hotColor = mix(vec3(1.0, 0.85, 0.5), vec3(0.7, 0.85, 1.0), doppler * 0.5);
      vec3 midColor = mix(vec3(1.0, 0.5, 0.2), vec3(0.5, 0.3, 1.0), doppler * 0.6);
      vec3 coolColor = vec3(0.25, 0.1, 0.5);

      vec3 color = mix(hotColor, midColor, smoothstep(0.0, 0.45, nr));
      color = mix(color, coolColor, smoothstep(0.35, 1.0, nr));

      // Combine patterns
      float pattern = mix(spiral, spiral2, 0.4) * turb + turb2 * 0.3;
      float brightness = fade * (0.3 + pattern * 0.6) * beamFactor;

      // Hot spots near inner edge
      float hotSpots = pow(turb, 3.0) * smoothstep(0.3, 0.0, nr) * 2.0;
      color += vec3(1.0, 0.9, 0.7) * hotSpots * beamFactor;

      gl_FragColor = vec4(color * (1.0 + pattern * 0.6), min(brightness * 1.2, 1.0));
    }
  `,
});
const accretionDisk = new THREE.Mesh(new THREE.RingGeometry(1.1, 4.5, 256, 4), diskMat);
accretionDisk.rotation.x = -Math.PI * 0.42;
scene.add(accretionDisk);

// Secondary disk image — gravitationally lensed back-side visible above & below BH
// This is the iconic Interstellar "hat" shape
const secondaryDiskMat = new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec2 vUv; varying float vRadius; varying vec2 vPos;
    void main() { vUv = uv; vRadius = length(position.xy); vPos = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: `
    uniform float uTime; varying vec2 vUv; varying float vRadius; varying vec2 vPos;
    ${GLSL_NOISE}
    void main() {
      float angle = atan(vPos.y, vPos.x);
      float nr = (vRadius - 0.65) / 0.6;  // thin band

      vec2 noiseCoord = vec2(angle * 2.0 - uTime * 0.4, nr * 6.0 + uTime * 0.15);
      float turb = fbm(noiseCoord) * 0.7 + 0.3;

      float fade = smoothstep(1.0, 0.2, nr) * smoothstep(0.0, 0.2, nr);

      // Doppler + beaming: approaching side much brighter
      float doppler = sin(angle + uTime * 0.6) * 0.5 + 0.5;
      float beaming = 0.3 + doppler * doppler * 2.0;

      vec3 hotColor = mix(vec3(1.0, 0.7, 0.3), vec3(0.6, 0.7, 1.0), doppler * 0.6);
      vec3 color = hotColor * turb * beaming;

      float alpha = fade * turb * 0.3;
      gl_FragColor = vec4(color, alpha);
    }
  `,
});

// Upper secondary image (back of disk bent over the top)
const secondaryDiskUpper = new THREE.Mesh(
  new THREE.RingGeometry(0.75, 1.3, 128, 2), secondaryDiskMat
);
secondaryDiskUpper.rotation.x = Math.PI * 0.08; // slightly tilted to wrap above
secondaryDiskUpper.position.y = 0.1;
scene.add(secondaryDiskUpper);

// Lower secondary image
const secondaryDiskLower = new THREE.Mesh(
  new THREE.RingGeometry(0.75, 1.3, 128, 2), secondaryDiskMat.clone()
);
secondaryDiskLower.rotation.x = -Math.PI * 0.08;
secondaryDiskLower.position.y = -0.1;
scene.add(secondaryDiskLower);

// ---------------------------------------------------------------------------
// Package particles
// ---------------------------------------------------------------------------
const PKG_COUNT = PACKAGES.length;
const DECOR_COUNT = 120;
const TOTAL = PKG_COUNT + DECOR_COUNT;

const pkgGeo = new THREE.BufferGeometry();
const pkgPositions = new Float32Array(TOTAL * 3);
const pkgColors = new Float32Array(TOTAL * 3);
const pkgSizes = new Float32Array(TOTAL);
const particleState = [];

function initParticle(i, isPackage) {
  const angle = Math.random() * Math.PI * 2;
  const radius = isPackage ? 4.0 + Math.random() * 8.0 : 5.0 + Math.random() * 15.0;
  const y = (Math.random() - 0.5) * (isPackage ? 2.0 : 8.0);
  const speed = isPackage ? 0.15 + Math.random() * 0.25 : 0.02 + Math.random() * 0.08;
  const drift = isPackage ? -0.008 - Math.random() * 0.015 : -0.001 - Math.random() * 0.003;
  particleState[i] = { angle, radius, y, speed, drift, isPackage, baseRadius: radius };

  pkgPositions[i * 3] = Math.cos(angle) * radius;
  pkgPositions[i * 3 + 1] = y;
  pkgPositions[i * 3 + 2] = Math.sin(angle) * radius;

  if (isPackage) {
    pkgColors[i * 3] = 0.6 + Math.random() * 0.4;
    pkgColors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
    pkgColors[i * 3 + 2] = 1.0;
    pkgSizes[i] = 2.0 + Math.random() * 2.5;
  } else {
    const b = 0.3 + Math.random() * 0.4;
    pkgColors[i * 3] = b * 0.7;
    pkgColors[i * 3 + 1] = b * 0.5;
    pkgColors[i * 3 + 2] = b;
    pkgSizes[i] = 1.0 + Math.random() * 2.0;
  }
}

for (let i = 0; i < TOTAL; i++) initParticle(i, i < PKG_COUNT);

pkgGeo.setAttribute("position", new THREE.BufferAttribute(pkgPositions, 3));
pkgGeo.setAttribute("color", new THREE.BufferAttribute(pkgColors, 3));
pkgGeo.setAttribute("size", new THREE.BufferAttribute(pkgSizes, 1));

const pkgMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
  vertexShader: `
    attribute float size; attribute vec3 color; varying vec3 vColor;
    uniform float uPixelRatio;
    void main() { vColor = color; vec4 mv = modelViewMatrix * vec4(position,1.0);
      gl_PointSize = size * uPixelRatio * (50.0 / -mv.z); gl_Position = projectionMatrix * mv; }
  `,
  fragmentShader: `
    varying vec3 vColor;
    void main() { float d = length(gl_PointCoord-0.5)*2.0;
      float glow = exp(-d*d*3.0); float core = smoothstep(0.3,0.0,d);
      gl_FragColor = vec4(vColor*glow + vec3(1.0)*core*0.4, glow*0.9); }
  `,
});
const pkgPoints = new THREE.Points(pkgGeo, pkgMat);
scene.add(pkgPoints);

// Light trails
const TRAIL_LENGTH = 12;
const trailPositions = [];
const trailGeometries = [];

for (let i = 0; i < PKG_COUNT; i++) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(TRAIL_LENGTH * 3);
  for (let t = 0; t < TRAIL_LENGTH; t++) {
    pos[t * 3] = pkgPositions[i * 3];
    pos[t * 3 + 1] = pkgPositions[i * 3 + 1];
    pos[t * 3 + 2] = pkgPositions[i * 3 + 2];
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  trailPositions.push(pos);
  trailGeometries.push(geo);

  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0.5 + Math.random() * 0.3, 0.3, 0.9),
    transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Line(geo, mat));
}

// ---------------------------------------------------------------------------
// Earth — orbits around the black hole
// ---------------------------------------------------------------------------
const EARTH_ORBIT_RADIUS = 4.5;
const EARTH_ORBIT_SPEED = 0.15;
const EARTH_ORBIT_TILT = -0.25; // slight tilt in Y
const earthPos = new THREE.Vector3(); // updated every frame

// Earth group (sphere + atmosphere + marker)
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const earthMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `
    varying vec3 vNormal; varying vec2 vUv; varying vec3 vWorldNormal;
    void main() {
      vNormal = normalize(normalMatrix*normal);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime; varying vec3 vNormal; varying vec2 vUv; varying vec3 vWorldNormal;
    ${GLSL_NOISE}
    void main() {
      float fresnel = pow(1.0 - max(dot(vNormal, vec3(0,0,1)), 0.0), 2.5);

      // Noise-based continents
      vec2 p = vUv * vec2(6.0, 4.0) + vec2(1.5, 0.8);
      float continent = fbm(p);
      float landMask = smoothstep(0.42, 0.52, continent);

      // Land detail: deserts, forests, mountains
      vec3 forest = vec3(0.08, 0.28, 0.1);
      vec3 desert = vec3(0.35, 0.3, 0.15);
      vec3 mountain = vec3(0.25, 0.22, 0.2);
      vec3 ice = vec3(0.85, 0.9, 0.95);
      float detail = fbm(p * 3.0);
      float latitude = abs(vUv.y - 0.5) * 2.0;

      vec3 land = mix(forest, desert, smoothstep(0.3, 0.6, detail));
      land = mix(land, mountain, smoothstep(0.65, 0.8, continent));
      land = mix(land, ice, smoothstep(0.82, 0.95, latitude)); // polar ice

      // Ocean with depth
      vec3 shallowWater = vec3(0.05, 0.2, 0.4);
      vec3 deepWater = vec3(0.02, 0.06, 0.18);
      vec3 water = mix(deepWater, shallowWater, smoothstep(0.3, 0.42, continent));

      vec3 surface = mix(water, land, landMask);

      // Simple sun lighting (from the right)
      vec3 lightDir = normalize(vec3(1.0, 0.3, 0.5));
      float NdotL = max(dot(vWorldNormal, lightDir), 0.0);
      float diffuse = NdotL * 0.7 + 0.3; // ambient + diffuse

      // Night side city lights
      float nightMask = smoothstep(0.1, 0.0, NdotL);
      float cities = step(0.72, fbm(p * 8.0)) * landMask * 0.8;
      vec3 cityGlow = vec3(1.0, 0.85, 0.4) * cities * nightMask;

      // Cloud layer (subtle)
      float clouds = smoothstep(0.52, 0.62, fbm(p * 2.0 + uTime * 0.02));
      surface = mix(surface, vec3(0.9, 0.92, 0.95), clouds * 0.35 * diffuse);

      vec3 finalColor = surface * diffuse + cityGlow;
      finalColor = mix(finalColor, vec3(0.3, 0.55, 1.0), fresnel * 0.6);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(0.3, 48, 48), earthMat);
earthGroup.add(earth);

// Atmosphere — double layer for realism
const atmoMat = new THREE.ShaderMaterial({
  transparent: true, side: THREE.BackSide, depthWrite: false,
  vertexShader: `
    varying vec3 vNormal; varying vec3 vWorldNormal;
    void main() {
      vNormal = normalize(normalMatrix*normal);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal; varying vec3 vWorldNormal;
    void main() {
      float rim = pow(0.65 - dot(vNormal, vec3(0,0,1)), 2.0);
      // Sun-facing side is brighter
      vec3 lightDir = normalize(vec3(1.0, 0.3, 0.5));
      float sunFacing = max(dot(vWorldNormal, lightDir), 0.0) * 0.4 + 0.6;
      vec3 atmoColor = mix(vec3(0.2, 0.4, 1.0), vec3(0.4, 0.7, 1.0), rim);
      gl_FragColor = vec4(atmoColor * sunFacing, rim * 0.55);
    }
  `,
});
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 48, 48), atmoMat);
earthGroup.add(atmosphere);

// area51 marker
const marker = new THREE.Mesh(
  new THREE.ConeGeometry(0.04, 0.08, 4),
  new THREE.MeshBasicMaterial({ color: 0x50c8ff })
);
marker.position.y = 0.32;
earthGroup.add(marker);

// Orbit path ring (subtle visual guide)
const orbitRingGeo = new THREE.RingGeometry(EARTH_ORBIT_RADIUS - 0.02, EARTH_ORBIT_RADIUS + 0.02, 128);
const orbitRingMat = new THREE.MeshBasicMaterial({
  color: 0x3366aa, transparent: true, opacity: 0.08, side: THREE.DoubleSide,
});
const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
orbitRing.rotation.x = -Math.PI * 0.5 + EARTH_ORBIT_TILT;
scene.add(orbitRing);

// ---------------------------------------------------------------------------
// Install beam system — packages EJECTED from BH toward orbiting earth
// ---------------------------------------------------------------------------
const MAX_BEAMS = 3;
const BEAM_POINTS = 40;
const installBeams = [];
const installLog = document.getElementById("install-log");
const area51Pulse = document.getElementById("area51-pulse");

function createBeam() {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(BEAM_POINTS * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.LineBasicMaterial({
    transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
  });
  const line = new THREE.Line(geo, mat);
  scene.add(line);

  const headGeo = new THREE.BufferGeometry();
  headGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
  headGeo.setAttribute("size", new THREE.BufferAttribute(new Float32Array([5.0]), 1));
  const headMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uPixelRatio: { value: renderer.getPixelRatio() } },
    vertexShader: `
      attribute float size; uniform float uPixelRatio;
      void main() { vec4 mv = modelViewMatrix*vec4(position,1.0);
        gl_PointSize = size*uPixelRatio*(60.0/-mv.z); gl_Position = projectionMatrix*mv; }
    `,
    fragmentShader: `
      void main() { float d = length(gl_PointCoord-0.5)*2.0;
        float glow = exp(-d*d*2.5); float core = smoothstep(0.2,0.0,d);
        gl_FragColor = vec4(vec3(0.2,1.0,0.4)*glow + vec3(0.8,1.0,0.8)*core*0.6, glow); }
    `,
  });
  const head = new THREE.Points(headGeo, headMat);
  head.visible = false;
  scene.add(head);

  return {
    line, geo, mat, positions, head, headGeo,
    active: false, progress: 0, pkg: null,
    startPos: new THREE.Vector3(),
    controlPos: new THREE.Vector3(),
    targetSnapshot: new THREE.Vector3(), // earth pos when launched
  };
}

for (let i = 0; i < MAX_BEAMS; i++) installBeams.push(createBeam());

function launchBeam(beam) {
  const pkg = PACKAGES[Math.floor(Math.random() * PACKAGES.length)];
  beam.pkg = pkg;
  beam.active = true;
  beam.progress = 0;

  // Start from BH surface
  const ejectAngle = Math.random() * Math.PI * 2;
  const ejectR = 0.7 + Math.random() * 0.4;
  beam.startPos.set(
    Math.cos(ejectAngle) * ejectR,
    Math.sin(ejectAngle) * ejectR * 0.3,
    Math.sin(ejectAngle) * ejectR * 0.5
  );

  // Snapshot current earth position as target
  beam.targetSnapshot.copy(earthPos);

  // Control point — arcs between BH and earth
  const mid = beam.startPos.clone().add(beam.targetSnapshot).multiplyScalar(0.5);
  mid.y += 1.5 + Math.random();
  mid.x += (Math.random() - 0.5) * 2;
  mid.z += (Math.random() - 0.5) * 2;
  beam.controlPos.copy(mid);

  beam.mat.color.setHSL(0.38 + Math.random() * 0.05, 0.85, 0.55);

  installLog.textContent = `Fetching ${pkg.name} from gargantua...`;
  installLog.style.opacity = "1";
}

function bezier(out, a, b, c, t) {
  const it = 1 - t;
  out.x = it * it * a.x + 2 * it * t * b.x + t * t * c.x;
  out.y = it * it * a.y + 2 * it * t * b.y + t * t * c.y;
  out.z = it * it * a.z + 2 * it * t * b.z + t * t * c.z;
}

const _beamTmp = new THREE.Vector3();

function updateBeam(beam) {
  if (!beam.active) return;

  beam.progress += 0.007;

  // Smoothly update target toward current earth pos (tracking)
  beam.targetSnapshot.lerp(earthPos, 0.05);

  if (beam.progress >= 1) {
    beam.active = false;
    beam.mat.opacity = 0;
    beam.head.visible = false;

    area51Pulse.classList.add("active");
    installLog.textContent = `Installed ${beam.pkg.name} ✓`;
    setTimeout(() => area51Pulse.classList.remove("active"), 600);
    setTimeout(() => { installLog.style.opacity = "0"; }, 2000);
    return;
  }

  beam.head.visible = true;
  const p = beam.progress;

  // Head position
  bezier(_beamTmp, beam.startPos, beam.controlPos, beam.targetSnapshot, p);
  const hArr = beam.headGeo.attributes.position.array;
  hArr[0] = _beamTmp.x; hArr[1] = _beamTmp.y; hArr[2] = _beamTmp.z;
  beam.headGeo.attributes.position.needsUpdate = true;

  // Trail
  const trailLen = Math.min(p, 0.25);
  for (let i = 0; i < BEAM_POINTS; i++) {
    const tp = Math.max(0, p - (i / BEAM_POINTS) * trailLen);
    bezier(_beamTmp, beam.startPos, beam.controlPos, beam.targetSnapshot, tp);
    beam.positions[i * 3] = _beamTmp.x;
    beam.positions[i * 3 + 1] = _beamTmp.y;
    beam.positions[i * 3 + 2] = _beamTmp.z;
  }
  beam.geo.attributes.position.needsUpdate = true;
  beam.mat.opacity = Math.min(p * 5, 1) * (1 - p * p) * 0.9;
}

let nextInstallTime = 2;

// ---------------------------------------------------------------------------
// Package labels (2D overlay projected from 3D positions)
// ---------------------------------------------------------------------------
const labelsContainer = document.getElementById("pkg-labels");
const labelElements = [];
const _projTmp = new THREE.Vector3();

for (let i = 0; i < PKG_COUNT; i++) {
  const el = document.createElement("div");
  el.className = "pkg-label";
  el.textContent = PACKAGES[i].name;
  el.dataset.index = i;
  labelsContainer.appendChild(el);
  labelElements.push(el);

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    zoomToPackage(parseInt(el.dataset.index));
  });
}

function updateLabels() {
  const posArr = pkgGeo.attributes.position.array;
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < PKG_COUNT; i++) {
    _projTmp.set(posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2]);
    _projTmp.project(camera);

    const sx = (_projTmp.x * 0.5 + 0.5) * w;
    const sy = (-_projTmp.y * 0.5 + 0.5) * h;

    const el = labelElements[i];

    // Hide if behind camera or off screen
    if (_projTmp.z > 1 || sx < -50 || sx > w + 50 || sy < -20 || sy > h + 20) {
      el.style.display = "none";
      continue;
    }

    el.style.display = "";
    el.style.transform = `translate(${sx + 28}px, ${sy - 7}px)`;

    // Search highlight: matching labels glow, non-matching dim
    if (isSearching) {
      if (searchMatchIndices.has(i)) {
        el.style.color = "rgba(80, 255, 150, 0.95)";
        el.style.fontSize = "0.8rem";
        el.style.textShadow = "0 0 8px rgba(80, 255, 150, 0.5)";
      } else {
        el.style.color = "rgba(200, 180, 255, 0.12)";
        el.style.fontSize = "0.6rem";
        el.style.textShadow = "none";
      }
    } else {
      el.style.color = "";
      el.style.fontSize = "";
      el.style.textShadow = "";
    }
  }
}

// isSearching is set in animate loop before updateLabels is called

// ---------------------------------------------------------------------------
// Package click → zoom + detail overlay
// ---------------------------------------------------------------------------
const pkgDetail = document.getElementById("pkg-detail");
const pkgDetailClose = document.getElementById("pkg-detail-close");
const pkgDetailContent = document.getElementById("pkg-detail-content");
let zoomedPkgIndex = -1;

function zoomToPackage(index) {
  if (camState.mode === "zoom-pkg") return;
  zoomedPkgIndex = index;
  camState.mode = "zoom-pkg";

  const pkg = PACKAGES[index];
  pkgDetailContent.innerHTML = `
    <h2>${pkg.name}</h2>
    <p class="pd-desc">${pkg.desc}</p>
    <div class="pd-section">
      <h3>Install</h3>
      <pre><code>$ area51 install ${pkg.name}</code></pre>
    </div>
    <div class="pd-section">
      <h3>Add to project</h3>
      <pre><code>;; area51.asd
(defsystem "my-project"
  :depends-on ("${pkg.name}"))</code></pre>
    </div>
    <div class="pd-section">
      <h3>Use</h3>
      <pre><code>(ql:quickload "${pkg.name}")</code></pre>
    </div>
  `;

  pkgDetail.classList.add("visible");
  document.getElementById("overlay").classList.add("faded");

  // Hide labels during zoom
  labelsContainer.style.opacity = "0";
}

function closePackageDetail() {
  camState.mode = "returning";
  pkgDetail.classList.remove("visible");
  document.getElementById("overlay").classList.remove("faded");
  labelsContainer.style.opacity = "1";
  zoomedPkgIndex = -1;
}

pkgDetailClose.addEventListener("click", (e) => {
  e.stopPropagation();
  closePackageDetail();
});

// ---------------------------------------------------------------------------
// Earth click → zoom + area51 detail overlay
// ---------------------------------------------------------------------------
const area51Detail = document.getElementById("area51-detail");
const area51Close = document.getElementById("area51-close");

function zoomToEarth() {
  if (camState.mode === "zoom-earth") return;
  camState.mode = "zoom-earth";
  area51Detail.classList.add("visible");
  document.getElementById("overlay").classList.add("faded");
}

function returnHome() {
  camState.mode = "returning";
  area51Detail.classList.remove("visible");
  document.getElementById("overlay").classList.remove("faded");
}

area51Close.addEventListener("click", (e) => {
  e.stopPropagation();
  returnHome();
});

// ---------------------------------------------------------------------------
// Raycaster — packages + earth click
// ---------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.4;
const mouse = new THREE.Vector2(9999, 9999);
const tooltip = document.getElementById("tooltip");
let hoveredPkg = -1;
let hoveredEarth = false;

canvas.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  if (camState.mode === "zoom-earth") return;

  raycaster.setFromCamera(mouse, camera);

  // Check earth hover
  const earthHits = raycaster.intersectObject(earth);
  hoveredEarth = earthHits.length > 0;

  // Check package hover
  const pkgHits = raycaster.intersectObject(pkgPoints);
  let found = -1;
  for (const hit of pkgHits) {
    if (hit.index < PKG_COUNT) { found = hit.index; break; }
  }

  if (hoveredEarth) {
    tooltip.innerHTML = `<div class="tt-name">Earth — area51</div><div class="tt-desc">Click to explore the ground station</div>`;
    tooltip.classList.remove("hidden");
    tooltip.style.left = `${e.clientX + 16}px`;
    tooltip.style.top = `${e.clientY - 8}px`;
    canvas.style.cursor = "pointer";
    hoveredPkg = -1;
  } else if (found >= 0) {
    hoveredPkg = found;
    const pkg = PACKAGES[found];
    tooltip.innerHTML = `<div class="tt-name">${pkg.name}</div><div class="tt-desc">${pkg.desc}</div>`;
    tooltip.classList.remove("hidden");
    tooltip.style.left = `${e.clientX + 16}px`;
    tooltip.style.top = `${e.clientY - 8}px`;
    canvas.style.cursor = "pointer";
  } else {
    hoveredPkg = -1;
    tooltip.classList.add("hidden");
    canvas.style.cursor = "default";
  }
});

canvas.addEventListener("click", () => {
  if (camState.mode === "zoom-earth") {
    returnHome();
    return;
  }
  if (camState.mode === "zoom-pkg") {
    closePackageDetail();
    return;
  }
  if (hoveredEarth) {
    zoomToEarth();
  } else if (hoveredPkg >= 0) {
    zoomToPackage(hoveredPkg);
  }
});

// ---------------------------------------------------------------------------
// Search — with 3D highlight integration
// ---------------------------------------------------------------------------
const searchInput = document.getElementById("search");
const resultsDiv = document.getElementById("results");
let searchMatchIndices = new Set(); // indices of matching packages
let isSearching = false;

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  searchMatchIndices.clear();

  if (!q) {
    resultsDiv.classList.remove("open");
    resultsDiv.innerHTML = "";
    return;
  }

  const matches = [];
  PACKAGES.forEach((p, i) => {
    if (p.name.includes(q) || p.desc.toLowerCase().includes(q)) {
      matches.push({ ...p, index: i });
      searchMatchIndices.add(i);
    }
  });

  if (!matches.length) {
    resultsDiv.classList.remove("open");
    resultsDiv.innerHTML = "";
    return;
  }

  resultsDiv.innerHTML = matches
    .map((p) => `<div class="result-item" data-pkg-index="${p.index}"><div class="name">${p.name}</div><div class="desc">${p.desc}</div></div>`)
    .join("");
  resultsDiv.classList.add("open");

  // Click on search result → zoom to that package
  resultsDiv.querySelectorAll(".result-item").forEach((el) => {
    el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const idx = parseInt(el.dataset.pkgIndex);
      searchInput.blur();
      resultsDiv.classList.remove("open");
      searchInput.value = "";
      searchMatchIndices.clear();
      zoomToPackage(idx);
    });
  });
});

searchInput.addEventListener("blur", () => {
  setTimeout(() => {
    resultsDiv.classList.remove("open");
    searchMatchIndices.clear();
  }, 200);
});

document.getElementById("pkg-count").textContent = `${PACKAGES.length} packages in orbit`;

// ---------------------------------------------------------------------------
// 2. Mouse gravity — cursor attracts nearby particles
// ---------------------------------------------------------------------------
const mouseWorld = new THREE.Vector3();
const mouseGravityStrength = 0.15;
const mouseGravityRadius = 3.0;

function updateMouseWorldPos() {
  // Project mouse to a plane at z=0 (BH center depth)
  const ndc = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  ndc.unproject(camera);
  const dir = ndc.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  mouseWorld.copy(camera.position).add(dir.multiplyScalar(dist));
}

// ---------------------------------------------------------------------------
// 3. Copy-to-clipboard on code blocks
// ---------------------------------------------------------------------------
function addCopyButtons() {
  document.querySelectorAll("#pkg-detail pre, #area51-detail pre, .code-block pre").forEach((pre) => {
    if (pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const code = pre.querySelector("code")?.textContent || pre.textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 1500);
      });
    });
    pre.style.position = "relative";
    pre.appendChild(btn);
  });
}

// Observe DOM changes to add copy buttons to dynamically created code blocks
const observer = new MutationObserver(addCopyButtons);
observer.observe(document.body, { childList: true, subtree: true });
addCopyButtons();

// ---------------------------------------------------------------------------
// 4. Package grid cards → scroll up & zoom to 3D package
// ---------------------------------------------------------------------------
const packageGrid = document.getElementById("package-grid");
packageGrid.innerHTML = PACKAGES.map(
  (p, i) => `<div class="pkg-card" data-pkg-index="${i}"><div class="pkg-name">${p.name}</div><div class="pkg-desc">${p.desc}</div></div>`
).join("");

packageGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".pkg-card");
  if (!card) return;
  const idx = parseInt(card.dataset.pkgIndex);

  // Scroll to top, then zoom to that package
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Wait for scroll to finish, then zoom
  const waitForScroll = () => {
    if (window.scrollY < 10) {
      setTimeout(() => zoomToPackage(idx), 300);
    } else {
      requestAnimationFrame(waitForScroll);
    }
  };
  requestAnimationFrame(waitForScroll);
});

// ---------------------------------------------------------------------------
// Scroll-driven camera & UI
// ---------------------------------------------------------------------------
let scrollProgress = 0; // 0 = top, 1 = fully scrolled past hero

const scrollHint = document.getElementById("scroll-hint");
const area51El = document.getElementById("area51");
const overlayEl = document.getElementById("overlay");

function updateScroll() {
  const scrollY = window.scrollY;
  const heroHeight = window.innerHeight;
  scrollProgress = Math.min(scrollY / heroHeight, 1);

  // Fade hero UI and area51 HUD
  const heroOpacity = 1 - scrollProgress * 2; // fades out in first half
  overlayEl.style.opacity = Math.max(heroOpacity, 0);
  area51El.style.opacity = Math.max(heroOpacity, 0);
  scrollHint.style.opacity = Math.max(1 - scrollProgress * 4, 0);
}

window.addEventListener("scroll", updateScroll, { passive: true });

// ---------------------------------------------------------------------------
// Smooth lerp helper
// ---------------------------------------------------------------------------
function smoothDamp(current, target, speed) {
  return current + (target - current) * Math.min(speed, 1);
}

function smoothstepJS(x) {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // --- Background ---
  starField.material.uniforms.uTime.value = t;
  nebulaMat.uniforms.uTime.value = t;

  // --- Black hole & accretion disk ---
  accretionDisk.rotation.z = t * 0.05;
  glowRingMat.uniforms.uTime.value = t;
  photonRingMat.uniforms.uTime.value = t;
  diskMat.uniforms.uTime.value = t;
  secondaryDiskMat.uniforms.uTime.value = t;
  if (secondaryDiskLower.material !== secondaryDiskMat) {
    secondaryDiskLower.material.uniforms.uTime.value = t;
  }

  // Update gravitational lensing — project BH center to screen space
  const bhScreenPos = new THREE.Vector3(0, 0, 0).project(camera);
  lensingPass.uniforms.uBhScreen.value.set(
    bhScreenPos.x * 0.5 + 0.5,
    bhScreenPos.y * 0.5 + 0.5
  );
  // Reduce lensing when scrolled away
  lensingPass.uniforms.uStrength.value = Math.max(1.0 - scrollProgress * 2, 0);

  // --- Earth orbit ---
  const earthAngle = t * EARTH_ORBIT_SPEED;
  earthPos.set(
    Math.cos(earthAngle) * EARTH_ORBIT_RADIUS,
    Math.sin(earthAngle) * EARTH_ORBIT_RADIUS * Math.sin(EARTH_ORBIT_TILT),
    Math.sin(earthAngle) * EARTH_ORBIT_RADIUS
  );
  earthGroup.position.copy(earthPos);
  earth.rotation.y = t * 0.3;
  earthMat.uniforms.uTime.value = t;
  marker.position.y = 0.32 + Math.sin(t * 2) * 0.015;

  // --- Particles (seamless loop) ---
  const posArr = pkgGeo.attributes.position.array;
  const colArr = pkgGeo.attributes.color.array;
  const sizeArr = pkgGeo.attributes.size.array;

  const isZoomed = camState.mode === "zoom-pkg" || camState.mode === "zoom-earth";

  // Update mouse world position for gravity effect
  updateMouseWorldPos();

  for (let i = 0; i < TOTAL; i++) {
    const s = particleState[i];
    s.angle += s.speed * 0.016;
    // Stop inward drift when zoomed in — just orbit
    if (!isZoomed) {
      s.radius += s.drift * 0.5;
    }

    const minR = s.isPackage ? 0.8 : 1.5;
    if (s.radius < minR) {
      s.radius = s.baseRadius * (0.9 + Math.random() * 0.2);
      s.angle += Math.PI * (0.5 + Math.random());
      s.y = (Math.random() - 0.5) * (s.isPackage ? 2.0 : 8.0);
    }

    let px = Math.cos(s.angle) * s.radius;
    let py = s.y * (s.radius / s.baseRadius);
    let pz = Math.sin(s.angle) * s.radius;

    // Mouse gravity: attract nearby particles toward cursor
    if (s.isPackage && !isZoomed) {
      const dx = mouseWorld.x - px;
      const dy = mouseWorld.y - py;
      const dz = mouseWorld.z - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < mouseGravityRadius && dist > 0.1) {
        const force = mouseGravityStrength / (dist * dist + 0.5);
        px += dx * force * 0.016;
        py += dy * force * 0.016;
        pz += dz * force * 0.016;
      }
    }

    posArr[i * 3] = px;
    posArr[i * 3 + 1] = py;
    posArr[i * 3 + 2] = pz;

    // Color: search highlight + fade
    if (i < PKG_COUNT) {
      const fadeIn = smoothstepJS((s.radius - s.baseRadius * 0.85) / (s.baseRadius * 0.15));
      const fadeOut = smoothstepJS((s.radius - minR) / (minR * 2));
      const alpha = Math.min(fadeIn, fadeOut);

      if (isSearching) {
        // Search mode: matching packages glow bright, others dim
        if (searchMatchIndices.has(i)) {
          colArr[i * 3] = 0.3 * alpha;
          colArr[i * 3 + 1] = 1.0 * alpha;
          colArr[i * 3 + 2] = 0.5 * alpha;
          sizeArr[i] = 5.0; // enlarge matches
        } else {
          colArr[i * 3] = 0.15 * alpha;
          colArr[i * 3 + 1] = 0.1 * alpha;
          colArr[i * 3 + 2] = 0.25 * alpha;
          sizeArr[i] = 1.5; // shrink non-matches
        }
      } else {
        const baseR = 0.6 + (i / PKG_COUNT) * 0.4;
        const baseG = 0.4 + (i / PKG_COUNT) * 0.3;
        colArr[i * 3] = baseR * alpha;
        colArr[i * 3 + 1] = baseG * alpha;
        colArr[i * 3 + 2] = 1.0 * alpha;
      }
    }
  }
  pkgGeo.attributes.position.needsUpdate = true;
  pkgGeo.attributes.color.needsUpdate = true;

  // Trails
  for (let i = 0; i < PKG_COUNT; i++) {
    const tp = trailPositions[i];
    for (let j = TRAIL_LENGTH - 1; j > 0; j--) {
      tp[j * 3] = tp[(j - 1) * 3];
      tp[j * 3 + 1] = tp[(j - 1) * 3 + 1];
      tp[j * 3 + 2] = tp[(j - 1) * 3 + 2];
    }
    tp[0] = posArr[i * 3];
    tp[1] = posArr[i * 3 + 1];
    tp[2] = posArr[i * 3 + 2];
    trailGeometries[i].attributes.position.needsUpdate = true;
  }

  // Highlight hovered package
  for (let i = 0; i < PKG_COUNT; i++) {
    const base = 2.0 + (i / PKG_COUNT) * 2.5;
    sizeArr[i] = i === hoveredPkg ? base * 2.0 : base;
  }
  pkgGeo.attributes.size.needsUpdate = true;

  // --- Install beams ---
  if (t > nextInstallTime && camState.mode !== "zoom-earth") {
    const freeBeam = installBeams.find((b) => !b.active);
    if (freeBeam) {
      launchBeam(freeBeam);
      nextInstallTime = t + 3 + Math.random() * 3;
    }
  }
  for (const beam of installBeams) updateBeam(beam);

  // --- Camera ---
  const lerpSpeed = 0.03;

  // Scroll-driven zoom: camera pulls back as user scrolls
  const scrollZoom = scrollProgress * 12; // z moves from 8 to 20
  const scrollY_offset = scrollProgress * 4; // camera rises
  const scrollFov = 60 + scrollProgress * 20; // FOV widens slightly

  if (camState.mode === "home" || camState.mode === "returning") {
    camState.goalPos.set(
      CAM_HOME.pos.x + Math.sin(t * 0.1) * 0.3 * (1 - scrollProgress),
      CAM_HOME.pos.y + Math.cos(t * 0.08) * 0.2 * (1 - scrollProgress) + scrollY_offset,
      CAM_HOME.pos.z + scrollZoom
    );
    camState.goalTarget.set(0, scrollProgress * 2, 0);

    if (camState.mode === "returning" && camState.pos.distanceTo(camState.goalPos) < 0.5) {
      camState.mode = "home";
    }
  } else if (camState.mode === "zoom-earth") {
    const camOffset = new THREE.Vector3(0, 0.3, 1.2);
    camState.goalPos.copy(earthPos).add(camOffset);
    camState.goalTarget.copy(earthPos);
  } else if (camState.mode === "zoom-pkg" && zoomedPkgIndex >= 0) {
    // Zoom toward the selected package particle
    const px = posArr[zoomedPkgIndex * 3];
    const py = posArr[zoomedPkgIndex * 3 + 1];
    const pz = posArr[zoomedPkgIndex * 3 + 2];
    const pkgPos = new THREE.Vector3(px, py, pz);
    const dir = pkgPos.clone().normalize();
    camState.goalPos.copy(pkgPos).add(dir.multiplyScalar(1.5)).add(new THREE.Vector3(0, 0.3, 0));
    camState.goalTarget.set(px, py, pz);
  }

  camState.pos.x = smoothDamp(camState.pos.x, camState.goalPos.x, lerpSpeed);
  camState.pos.y = smoothDamp(camState.pos.y, camState.goalPos.y, lerpSpeed);
  camState.pos.z = smoothDamp(camState.pos.z, camState.goalPos.z, lerpSpeed);
  camState.target.x = smoothDamp(camState.target.x, camState.goalTarget.x, lerpSpeed);
  camState.target.y = smoothDamp(camState.target.y, camState.goalTarget.y, lerpSpeed);
  camState.target.z = smoothDamp(camState.target.z, camState.goalTarget.z, lerpSpeed);

  camera.position.copy(camState.pos);
  camera.lookAt(camState.target);

  // Smooth FOV transition
  camera.fov = smoothDamp(camera.fov, scrollFov, 0.05);
  camera.updateProjectionMatrix();

  // Update package labels
  isSearching = searchMatchIndices.size > 0;
  if (scrollProgress < 0.5 && camState.mode !== "zoom-pkg") {
    labelsContainer.style.display = "";
    labelsContainer.style.opacity = String(Math.max(1 - scrollProgress * 3, 0));
    updateLabels();
  } else if (camState.mode !== "zoom-pkg") {
    labelsContainer.style.display = "none";
  }

  composer.render();
}

animate();

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  pkgMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
});
