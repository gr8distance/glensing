import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

interface PackageData {
  name: string;
  desc: string;
}

interface SceneCallbacks {
  onHoverPackage?: (pkg: PackageData | null, x: number, y: number) => void;
  onHoverEarth?: (hovered: boolean, x: number, y: number) => void;
  onClickPackage?: (index: number, pkg: PackageData) => void;
  onClickEarth?: () => void;
  onClickBackground?: () => void;
  onInstallLog?: (message: string, done: boolean) => void;
  onPulseArea51?: (active: boolean) => void;
}

export interface SceneAPI {
  setSearchMatches: (indices: Set<number>) => void;
  getPackageScreenPos: (index: number) => { x: number; y: number } | null;
  getPackagePositions: () => Float32Array;
  getCamera: () => THREE.PerspectiveCamera;
  zoomToPackage: (index: number) => void;
  zoomToEarth: () => void;
  returnHome: () => void;
  closePackageDetail: () => void;
  getCameraMode: () => string;
  setScrollProgress: (progress: number) => void;
  getPkgCount: () => number;
}

export function initScene(
  canvas: HTMLCanvasElement,
  packages: PackageData[],
  callbacks: SceneCallbacks = {}
): { cleanup: () => void; api: SceneAPI } {
  // ---------------------------------------------------------------------------
  // Scene setup
  // ---------------------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);

  // Camera state — pull back on portrait screens so the BH fits
  const isPortrait = window.innerWidth < window.innerHeight;
  const camZ = isPortrait ? 11 : 8;
  const camY = isPortrait ? 0.5 : 2;
  const CAM_HOME = { pos: new THREE.Vector3(0, camY, camZ), target: new THREE.Vector3(0, 0, 0) };
  const camState = {
    pos: CAM_HOME.pos.clone(),
    target: CAM_HOME.target.clone(),
    goalPos: CAM_HOME.pos.clone(),
    goalTarget: CAM_HOME.target.clone(),
    mode: "home" as "home" | "zoom-earth" | "zoom-pkg" | "returning",
  };
  camera.position.copy(camState.pos);
  camera.lookAt(camState.target);

  // Post-processing: bloom
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomScale = 0.5;
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth * bloomScale, window.innerHeight * bloomScale),
    isPortrait ? 0.6 : 1.0,
    isPortrait ? 0.3 : 0.45,
    0.35
  );
  composer.addPass(bloom);

  // Gravitational lensing post-processing
  const lensingShader = {
    uniforms: {
      tDiffuse: { value: null },
      uBhScreen: { value: new THREE.Vector2(0.5, 0.45) },
      uStrength: { value: 1.0 },
      uRadius: { value: 0.35 },
      uAspect: { value: window.innerWidth / window.innerHeight },
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
      uniform float uAspect;
      varying vec2 vUv;

      void main() {
        vec2 delta = vUv - uBhScreen;
        delta.x *= uAspect;
        float dist = length(delta);

        float normalizedDist = dist / uRadius;

        float shadowRadius = 0.18;
        float shadow = smoothstep(shadowRadius, shadowRadius + 0.06, normalizedDist);

        if (normalizedDist < 1.0 && normalizedDist > 0.08) {
          float deflection = uStrength * 0.02 / (normalizedDist * normalizedDist + 0.2);

          vec2 dir = normalize(delta);
          // Undo aspect correction for UV offset
          vec2 uvDir = dir;
          uvDir.x /= uAspect;
          vec2 warpedUv = vUv + uvDir * deflection;

          float ringDist = abs(normalizedDist - 0.25);
          float ringStrength = exp(-ringDist * ringDist * 150.0) * 0.4;

          vec4 mainColor = texture2D(tDiffuse, warpedUv);

          vec2 ringDelta = delta;
          ringDelta.x /= uAspect;
          vec2 ringUv = uBhScreen - ringDelta * 0.35;
          vec4 ringColor = texture2D(tDiffuse, ringUv);

          gl_FragColor = mix(mainColor, mainColor + ringColor * 0.2, ringStrength);
        } else {
          gl_FragColor = texture2D(tDiffuse, vUv);
        }

        gl_FragColor.rgb *= shadow;
      }
    `,
  };
  const lensingPass = new ShaderPass(lensingShader);
  composer.addPass(lensingPass);

  // ---------------------------------------------------------------------------
  // Background stars
  // ---------------------------------------------------------------------------
  function createStarField(count: number) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

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
      const type = spectral[Math.floor(Math.pow(Math.random(), 0.7) * spectral.length)];
      colors[i * 3] = type[0] * brightness;
      colors[i * 3 + 1] = type[1] * brightness;
      colors[i * 3 + 2] = type[2] * brightness;

      sizes[i] = 0.3 + Math.pow(Math.random(), 3) * 2.5;
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
          float core = exp(-d * d * 8.0);
          float halo = exp(-d * d * 2.0) * 0.3;
          float brightness = core + halo;
          gl_FragColor = vec4(vColor * brightness * vTwinkle, brightness * 0.95);
        }
      `,
    });

    return { points: new THREE.Points(geo, starMat), material: starMat };
  }
  const starField = createStarField(6666);
  scene.add(starField.points);

  // ---------------------------------------------------------------------------
  // Nebula background
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

        vec3 c1 = vec3(0.15, 0.05, 0.3) * n1;
        vec3 c2 = vec3(0.05, 0.1, 0.25) * n2;
        vec3 c3 = vec3(0.2, 0.05, 0.1) * n3;

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
  // Black hole core
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
          float edge = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 10.0);
          gl_FragColor = vec4(vec3(0.06, 0.02, 0.12) * edge, 1.0);
        }
      `,
    })
  );
  blackHole.renderOrder = 10;
  scene.add(blackHole);

  // Photon ring
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
        float r = vUv.y;
        float ring1 = exp(-pow((r - 0.3) * 10.0, 2.0));
        float ring2 = exp(-pow((r - 0.6) * 8.0, 2.0)) * 0.5;
        float ring3 = exp(-pow((r - 0.85) * 12.0, 2.0)) * 0.2;

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
  // Accretion disk
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

        vec2 noiseCoord = vec2(angle * 2.0 + uTime * 0.3, nr * 8.0 - uTime * 0.1);
        float turb = fbm(noiseCoord) * 0.8 + 0.2;
        float turb2 = fbm(noiseCoord * 1.5 + vec2(42.0, 17.0)) * 0.6;

        float spiral = sin(angle * 4.0 + uTime * 0.6 - nr * 15.0) * 0.5 + 0.5;
        float spiral2 = sin(angle * 7.0 - uTime * 0.4 + nr * 10.0) * 0.5 + 0.5;

        float fade = smoothstep(1.0, 0.0, nr) * smoothstep(0.0, 0.12, nr);

        float doppler = sin(angle + uTime * 0.6) * 0.5 + 0.5;

        float beamFactor = 0.5 + doppler * doppler * 1.2;

        vec3 hotColor = mix(vec3(1.0, 0.85, 0.5), vec3(0.7, 0.85, 1.0), doppler * 0.5);
        vec3 midColor = mix(vec3(1.0, 0.5, 0.2), vec3(0.5, 0.3, 1.0), doppler * 0.6);
        vec3 coolColor = vec3(0.25, 0.1, 0.5);

        vec3 color = mix(hotColor, midColor, smoothstep(0.0, 0.45, nr));
        color = mix(color, coolColor, smoothstep(0.35, 1.0, nr));

        float pattern = mix(spiral, spiral2, 0.4) * turb + turb2 * 0.3;
        float brightness = fade * (0.3 + pattern * 0.6) * beamFactor;

        float hotSpots = pow(turb, 3.0) * smoothstep(0.3, 0.0, nr) * 2.0;
        color += vec3(1.0, 0.9, 0.7) * hotSpots * beamFactor;

        gl_FragColor = vec4(color * (1.0 + pattern * 0.6), min(brightness * 1.2, 1.0));
      }
    `,
  });
  const accretionDisk = new THREE.Mesh(new THREE.RingGeometry(1.1, 4.5, 256, 4), diskMat);
  accretionDisk.rotation.x = -Math.PI * 0.42;
  scene.add(accretionDisk);

  // Secondary disk (gravitationally lensed back-side)
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
        float nr = (vRadius - 0.65) / 0.6;

        vec2 noiseCoord = vec2(angle * 2.0 - uTime * 0.4, nr * 6.0 + uTime * 0.15);
        float turb = fbm(noiseCoord) * 0.7 + 0.3;

        float fade = smoothstep(1.0, 0.2, nr) * smoothstep(0.0, 0.2, nr);

        float doppler = sin(angle + uTime * 0.6) * 0.5 + 0.5;
        float beaming = 0.3 + doppler * doppler * 2.0;

        vec3 hotColor = mix(vec3(1.0, 0.7, 0.3), vec3(0.6, 0.7, 1.0), doppler * 0.6);
        vec3 color = hotColor * turb * beaming;

        float alpha = fade * turb * 0.3;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const secondaryDiskUpper = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 1.3, 128, 2), secondaryDiskMat
  );
  secondaryDiskUpper.rotation.x = Math.PI * 0.08;
  secondaryDiskUpper.position.y = 0.1;
  scene.add(secondaryDiskUpper);

  const secondaryDiskLower = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 1.3, 128, 2), secondaryDiskMat.clone()
  );
  secondaryDiskLower.rotation.x = -Math.PI * 0.08;
  secondaryDiskLower.position.y = -0.1;
  scene.add(secondaryDiskLower);

  // ---------------------------------------------------------------------------
  // Package particles
  // ---------------------------------------------------------------------------
  const PKG_COUNT = packages.length;
  const DECOR_COUNT = 120;
  const TOTAL = PKG_COUNT + DECOR_COUNT;

  const pkgGeo = new THREE.BufferGeometry();
  const pkgPositions = new Float32Array(TOTAL * 3);
  const pkgColors = new Float32Array(TOTAL * 3);
  const pkgSizes = new Float32Array(TOTAL);

  interface ParticleState {
    angle: number;
    radius: number;
    y: number;
    speed: number;
    drift: number;
    isPackage: boolean;
    baseRadius: number;
  }
  const particleState: ParticleState[] = [];

  function initParticle(i: number, isPackage: boolean) {
    const angle = Math.random() * Math.PI * 2;
    const radius = isPackage ? 4.0 + Math.random() * 8.0 : 5.0 + Math.random() * 15.0;
    const y = (Math.random() - 0.5) * (isPackage ? 2.0 : 8.0);
    const speed = isPackage ? 0.10 + Math.random() * 0.165 : 0.013 + Math.random() * 0.053;
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
  const trailPositions: Float32Array[] = [];
  const trailGeometries: THREE.BufferGeometry[] = [];

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
  // Earth
  // ---------------------------------------------------------------------------
  const EARTH_ORBIT_RADIUS = 4.5;
  const EARTH_ORBIT_SPEED = 0.15;
  const EARTH_ORBIT_TILT = -0.25;
  const earthPos = new THREE.Vector3();

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

        vec2 p = vUv * vec2(6.0, 4.0) + vec2(1.5, 0.8);
        float continent = fbm(p);
        float landMask = smoothstep(0.42, 0.52, continent);

        vec3 forest = vec3(0.08, 0.28, 0.1);
        vec3 desert = vec3(0.35, 0.3, 0.15);
        vec3 mountain = vec3(0.25, 0.22, 0.2);
        vec3 ice = vec3(0.85, 0.9, 0.95);

        float detail = fbm(p * 3.0);
        float latitude = abs(vUv.y - 0.5) * 2.0;

        vec3 land = mix(forest, desert, smoothstep(0.3, 0.6, detail));
        land = mix(land, mountain, smoothstep(0.65, 0.8, continent));
        land = mix(land, ice, smoothstep(0.82, 0.95, latitude));

        vec3 shallowWater = vec3(0.05, 0.2, 0.4);
        vec3 deepWater = vec3(0.02, 0.06, 0.18);
        vec3 water = mix(deepWater, shallowWater, smoothstep(0.3, 0.42, continent));

        vec3 surface = mix(water, land, landMask);

        vec3 lightDir = normalize(vec3(1.0, 0.3, 0.5));
        float NdotL = max(dot(vWorldNormal, lightDir), 0.0);
        float diffuse = NdotL * 0.7 + 0.3;

        float nightMask = smoothstep(0.1, 0.0, NdotL);
        float cities = step(0.72, fbm(p * 8.0)) * landMask * 0.8;
        vec3 cityGlow = vec3(1.0, 0.85, 0.4) * cities * nightMask;

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

  // Atmosphere
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

  // Orbit path ring
  const orbitRingGeo = new THREE.RingGeometry(EARTH_ORBIT_RADIUS - 0.02, EARTH_ORBIT_RADIUS + 0.02, 128);
  const orbitRingMat = new THREE.MeshBasicMaterial({
    color: 0x3366aa, transparent: true, opacity: 0.08, side: THREE.DoubleSide,
  });
  const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
  orbitRing.rotation.x = -Math.PI * 0.5 + EARTH_ORBIT_TILT;
  scene.add(orbitRing);

  // ---------------------------------------------------------------------------
  // Install beam system
  // ---------------------------------------------------------------------------
  const MAX_BEAMS = 3;
  const BEAM_POINTS = 40;

  interface Beam {
    line: THREE.Line;
    geo: THREE.BufferGeometry;
    mat: THREE.LineBasicMaterial;
    positions: Float32Array;
    head: THREE.Points;
    headGeo: THREE.BufferGeometry;
    active: boolean;
    progress: number;
    pkg: PackageData | null;
    startPos: THREE.Vector3;
    controlPos: THREE.Vector3;
    targetSnapshot: THREE.Vector3;
  }

  const installBeams: Beam[] = [];

  function createBeam(): Beam {
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
      targetSnapshot: new THREE.Vector3(),
    };
  }

  for (let i = 0; i < MAX_BEAMS; i++) installBeams.push(createBeam());

  function launchBeam(beam: Beam) {
    const pkg = packages[Math.floor(Math.random() * packages.length)];
    beam.pkg = pkg;
    beam.active = true;
    beam.progress = 0;

    const ejectAngle = Math.random() * Math.PI * 2;
    const ejectR = 0.7 + Math.random() * 0.4;
    beam.startPos.set(
      Math.cos(ejectAngle) * ejectR,
      Math.sin(ejectAngle) * ejectR * 0.3,
      Math.sin(ejectAngle) * ejectR * 0.5
    );

    beam.targetSnapshot.copy(earthPos);

    const mid = beam.startPos.clone().add(beam.targetSnapshot).multiplyScalar(0.5);
    mid.y += 1.5 + Math.random();
    mid.x += (Math.random() - 0.5) * 2;
    mid.z += (Math.random() - 0.5) * 2;
    beam.controlPos.copy(mid);

    beam.mat.color.setHSL(0.38 + Math.random() * 0.05, 0.85, 0.55);

    callbacks.onInstallLog?.(`Fetching ${pkg.name} from gargantua...`, false);
  }

  function bezier(out: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) {
    const it = 1 - t;
    out.x = it * it * a.x + 2 * it * t * b.x + t * t * c.x;
    out.y = it * it * a.y + 2 * it * t * b.y + t * t * c.y;
    out.z = it * it * a.z + 2 * it * t * b.z + t * t * c.z;
  }

  const _beamTmp = new THREE.Vector3();

  function updateBeam(beam: Beam) {
    if (!beam.active) return;

    beam.progress += 0.007;

    beam.targetSnapshot.lerp(earthPos, 0.05);

    if (beam.progress >= 1) {
      beam.active = false;
      beam.mat.opacity = 0;
      beam.head.visible = false;

      callbacks.onPulseArea51?.(true);
      callbacks.onInstallLog?.(`Installed ${beam.pkg!.name} ✓`, true);
      setTimeout(() => callbacks.onPulseArea51?.(false), 600);
      return;
    }

    beam.head.visible = true;
    const p = beam.progress;

    bezier(_beamTmp, beam.startPos, beam.controlPos, beam.targetSnapshot, p);
    const hArr = beam.headGeo.attributes.position.array as Float32Array;
    hArr[0] = _beamTmp.x; hArr[1] = _beamTmp.y; hArr[2] = _beamTmp.z;
    beam.headGeo.attributes.position.needsUpdate = true;

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
  // Raycaster
  // ---------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points!.threshold = 0.4;
  const mouseNDC = new THREE.Vector2(9999, 9999);
  let hoveredPkg = -1;
  let hoveredEarth = false;

  const handleMouseMove = (e: MouseEvent) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (camState.mode === "zoom-earth") return;

    raycaster.setFromCamera(mouseNDC, camera);

    const earthHits = raycaster.intersectObject(earth);
    hoveredEarth = earthHits.length > 0;

    const pkgHits = raycaster.intersectObject(pkgPoints);
    let found = -1;
    for (const hit of pkgHits) {
      if (hit.index !== undefined && hit.index < PKG_COUNT) { found = hit.index; break; }
    }

    if (hoveredEarth) {
      callbacks.onHoverEarth?.(true, e.clientX, e.clientY);
      hoveredPkg = -1;
      canvas.style.cursor = "pointer";
    } else if (found >= 0) {
      hoveredPkg = found;
      callbacks.onHoverPackage?.(packages[found], e.clientX, e.clientY);
      canvas.style.cursor = "pointer";
    } else {
      hoveredPkg = -1;
      callbacks.onHoverPackage?.(null, 0, 0);
      callbacks.onHoverEarth?.(false, 0, 0);
      canvas.style.cursor = "default";
    }
  };

  const handleClick = () => {
    if (camState.mode === "zoom-earth") {
      returnHomeFn();
      callbacks.onClickBackground?.();
      return;
    }
    if (camState.mode === "zoom-pkg") {
      closePackageDetailFn();
      callbacks.onClickBackground?.();
      return;
    }
    if (hoveredEarth) {
      callbacks.onClickEarth?.();
    } else if (hoveredPkg >= 0) {
      callbacks.onClickPackage?.(hoveredPkg, packages[hoveredPkg]);
    }
  };

  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("click", handleClick);

  // ---------------------------------------------------------------------------
  // Mouse gravity
  // ---------------------------------------------------------------------------
  const mouseWorld = new THREE.Vector3();
  const mouseGravityStrength = 0.15;
  const mouseGravityRadius = 3.0;

  function updateMouseWorldPos() {
    const ndc = new THREE.Vector3(mouseNDC.x, mouseNDC.y, 0.5);
    ndc.unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    mouseWorld.copy(camera.position).add(dir.multiplyScalar(dist));
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let scrollProgress = 0;
  let searchMatchIndices = new Set<number>();
  let isSearching = false;
  let zoomedPkgIndex = -1;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function smoothDamp(current: number, target: number, speed: number): number {
    return current + (target - current) * Math.min(speed, 1);
  }

  function smoothstepJS(x: number): number {
    x = Math.max(0, Math.min(1, x));
    return x * x * (3 - 2 * x);
  }

  // ---------------------------------------------------------------------------
  // Camera mode functions (exposed via API)
  // ---------------------------------------------------------------------------
  function zoomToPackageFn(index: number) {
    if (camState.mode === "zoom-pkg") return;
    zoomedPkgIndex = index;
    camState.mode = "zoom-pkg";
  }

  function zoomToEarthFn() {
    if (camState.mode === "zoom-earth") return;
    camState.mode = "zoom-earth";
  }

  function returnHomeFn() {
    camState.mode = "returning";
  }

  function closePackageDetailFn() {
    camState.mode = "returning";
    zoomedPkgIndex = -1;
  }

  // ---------------------------------------------------------------------------
  // Animation loop
  // ---------------------------------------------------------------------------
  const clock = new THREE.Clock();
  let animFrameId: number;
  let paused = false;
  let throttled = false;
  let frameCount = 0;

  // Pause when tab is hidden
  const handleVisibility = () => {
    if (document.hidden) {
      paused = true;
      clock.stop();
    } else {
      paused = false;
      clock.start();
      animFrameId = requestAnimationFrame(animate);
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);

  function animate() {
    if (paused) return;
    animFrameId = requestAnimationFrame(animate);

    // Throttle to ~15fps when scrolled past the canvas
    frameCount++;
    if (throttled && frameCount % 4 !== 0) return;

    const dt = Math.min(clock.getDelta(), 0.1); // cap to avoid jumps after tab switch
    const t = clock.elapsedTime;

    // Background
    starField.material.uniforms.uTime.value = t;
    nebulaMat.uniforms.uTime.value = t;

    // Black hole & accretion disk
    accretionDisk.rotation.z = t * 0.05;
    glowRingMat.uniforms.uTime.value = t;
    photonRingMat.uniforms.uTime.value = t;
    diskMat.uniforms.uTime.value = t;
    secondaryDiskMat.uniforms.uTime.value = t;
    if (secondaryDiskLower.material !== secondaryDiskMat) {
      (secondaryDiskLower.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    }

    // Gravitational lensing
    const bhScreenPos = new THREE.Vector3(0, 0, 0).project(camera);
    lensingPass.uniforms.uBhScreen.value.set(
      bhScreenPos.x * 0.5 + 0.5,
      bhScreenPos.y * 0.5 + 0.5
    );
    lensingPass.uniforms.uStrength.value = Math.max(1.0 - scrollProgress * 2, 0);

    // Earth orbit
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

    // Particles
    const posArr = pkgGeo.attributes.position.array as Float32Array;
    const colArr = pkgGeo.attributes.color.array as Float32Array;
    const sizeArr = pkgGeo.attributes.size.array as Float32Array;

    const isZoomed = camState.mode === "zoom-pkg" || camState.mode === "zoom-earth";

    updateMouseWorldPos();

    for (let i = 0; i < TOTAL; i++) {
      const s = particleState[i];
      s.angle += s.speed * dt;
      if (!isZoomed) {
        s.radius += s.drift * dt * 30;
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

      // Mouse gravity
      if (s.isPackage && !isZoomed) {
        const dx = mouseWorld.x - px;
        const dy = mouseWorld.y - py;
        const dz = mouseWorld.z - pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < mouseGravityRadius && dist > 0.1) {
          const force = mouseGravityStrength / (dist * dist + 0.5);
          px += dx * force * dt;
          py += dy * force * dt;
          pz += dz * force * dt;
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
          if (searchMatchIndices.has(i)) {
            colArr[i * 3] = 0.3 * alpha;
            colArr[i * 3 + 1] = 1.0 * alpha;
            colArr[i * 3 + 2] = 0.5 * alpha;
            sizeArr[i] = 5.0;
          } else {
            colArr[i * 3] = 0.15 * alpha;
            colArr[i * 3 + 1] = 0.1 * alpha;
            colArr[i * 3 + 2] = 0.25 * alpha;
            sizeArr[i] = 1.5;
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

    // Install beams
    if (t > nextInstallTime && camState.mode !== "zoom-earth") {
      const freeBeam = installBeams.find((b) => !b.active);
      if (freeBeam) {
        launchBeam(freeBeam);
        nextInstallTime = t + 3 + Math.random() * 3;
      }
    }
    for (const beam of installBeams) updateBeam(beam);

    // Camera
    const lerpSpeed = 0.03;

    const scrollZoom = scrollProgress * 12;
    const scrollY_offset = scrollProgress * 4;
    const scrollFov = 60 + scrollProgress * 20;

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

    camera.fov = smoothDamp(camera.fov, scrollFov, 0.05);
    camera.updateProjectionMatrix();

    isSearching = searchMatchIndices.size > 0;

    composer.render();
  }

  animate();

  // ---------------------------------------------------------------------------
  // Resize
  // ---------------------------------------------------------------------------
  const handleResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    pkgMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    lensingPass.uniforms.uAspect.value = w / h;

    // Adjust bloom for small screens
    const isPortrait = w < h;
    bloom.strength = isPortrait ? 0.6 : 1.0;
    bloom.radius = isPortrait ? 0.3 : 0.45;
  };
  window.addEventListener("resize", handleResize);

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------
  function cleanup() {
    paused = true;
    cancelAnimationFrame(animFrameId);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("resize", handleResize);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
    renderer.dispose();
    composer.dispose();
  }

  // ---------------------------------------------------------------------------
  // API
  // ---------------------------------------------------------------------------
  const _projTmp = new THREE.Vector3();

  const api: SceneAPI = {
    setSearchMatches(indices: Set<number>) {
      searchMatchIndices = indices;
    },
    getPackageScreenPos(index: number) {
      const posArr = pkgGeo.attributes.position.array as Float32Array;
      _projTmp.set(posArr[index * 3], posArr[index * 3 + 1], posArr[index * 3 + 2]);
      _projTmp.project(camera);

      const sx = (_projTmp.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-_projTmp.y * 0.5 + 0.5) * window.innerHeight;

      if (_projTmp.z > 1 || sx < -50 || sx > window.innerWidth + 50 || sy < -20 || sy > window.innerHeight + 20) {
        return null;
      }
      return { x: sx, y: sy };
    },
    getPackagePositions() {
      return pkgGeo.attributes.position.array as Float32Array;
    },
    getCamera() {
      return camera;
    },
    zoomToPackage: zoomToPackageFn,
    zoomToEarth: zoomToEarthFn,
    returnHome: returnHomeFn,
    closePackageDetail: closePackageDetailFn,
    getCameraMode() {
      return camState.mode;
    },
    setScrollProgress(progress: number) {
      scrollProgress = progress;
      // Throttle rendering when canvas is mostly scrolled out of view
      throttled = progress > 0.8;
    },
    getPkgCount() {
      return PKG_COUNT;
    },
  };

  return { cleanup, api };
}
