import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import CAR from './lib/car.geo.js';


import G from './geo3.js';
/* паркинг: 2 уровня (−1, −2), 230 мест — из общей схемы geo3data.js */
const D3 = window.GEO3;
if (D3 && !G.stalls.some(s => s.lv === -3)) { D3.stalls.filter(s => s.lv === -3).forEach(s => G.stalls.push(s)); G.WIN3 = D3.WIN3; G.lifts3 = D3.lifts; G.evac3 = D3.evac; G.gap3 = D3.gap; G.bands3 = D3.bands; G.WU3 = D3.WU; }
const M = window.SHEV, UI = window.SHEV_UI, UNITS = M.units();
const viewer = document.getElementById('viewer'), canvas = document.getElementById('cv');
const tip = document.getElementById('vtip'), info = document.getElementById('vinfo');

/* ---------- координаты: локальная система участка (x — на восток от границы по ул. Амангельды, y — на север) ---------- */
const YM = (G.Y0 + G.Y1) / 2, XM = G.D / 2;
const wx = x => x - XM, wz = y => -(y - YM);
const ground = y => (817.6 - 2.0 * (y - 13.95) / 125) - 817.75;   // тротуар ул. Амангельды относительно ±0,000 = 817,75 (дом стоит ровно)
const SECZ = {1: 0, 2: 0, 3: 0, 4: 0};          // единый уровень ±0,000 = 817,75
const LV = {1: 0, 1.5: 3.9}; for (let f = 2; f <= 9; f++) LV[f] = 7.0 + (f - 2) * 3.3;
const FH = f => f === 1 ? 3.9 : f === 1.5 ? 3.1 : 3.3, ROOF = 33.4, PAR = 34.6;
const SHELLS = [1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9];
const PK = {P1: -4.2, P2: -7.5};   // абс. 813,55 / 810,25

/* ---------- renderer / scene ---------- */
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
window.__shev = {scene, THREE};   // для экспорта в GLB (Blender)
const camera = new THREE.PerspectiveCamera(32, 1, 1.5, 5000);
camera.position.set(-2, 190, 215);
const controls = new OrbitControls(camera, canvas);
controls.target.set(-14, 0, -12); controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.maxPolarAngle = 1.5; controls.minDistance = 18; controls.maxDistance = 520;
// захват и перенос: левая кнопка / один палец — двигать по земле; правая / два пальца — вращать и приближать
controls.dampingFactor = 0.14; controls.zoomSpeed = 1.7; controls.panSpeed = 1.15; controls.rotateSpeed = 0.75; controls.screenSpacePanning = false;
const MODES = { pan: {m:{LEFT:THREE.MOUSE.PAN, MIDDLE:THREE.MOUSE.DOLLY, RIGHT:THREE.MOUSE.ROTATE}, t:{ONE:THREE.TOUCH.PAN, TWO:THREE.TOUCH.DOLLY_ROTATE}},
                rot: {m:{LEFT:THREE.MOUSE.ROTATE, MIDDLE:THREE.MOUSE.DOLLY, RIGHT:THREE.MOUSE.PAN}, t:{ONE:THREE.TOUCH.ROTATE, TWO:THREE.TOUCH.DOLLY_PAN}} };
function setDragMode(k){ controls.mouseButtons = MODES[k].m; controls.touches = MODES[k].t; document.querySelectorAll('#vmode button').forEach(b => b.classList.toggle('on', b.dataset.k===k)); }
// активация: модель не перехватывает прокрутку страницы, пока по ней не нажали
let v3active = false; const gate = document.getElementById('vgate');
function setActive(on){ v3active = on; controls.enabled = on && !window.__cineOn; canvas.style.touchAction = on ? 'none' : 'pan-y'; if(gate) gate.classList.toggle('hide', on); document.getElementById('viewer').classList.toggle('active', on); }

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.5, 0.55, 0.82); composer.addPass(bloom);
composer.addPass(new OutputPass());
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const sky = new Sky(); sky.scale.setScalar(3000); scene.add(sky);
/* ---------- панорама Алматы: хребет Заилийского Алатау на юге, предгорья и город по кругу ---------- */
const PANO = new THREE.Mesh(new THREE.CylinderGeometry(1300, 1300, 300, 96, 1, true), new THREE.MeshBasicMaterial({transparent: true, side: THREE.BackSide, fog: false, toneMapped: false, depthWrite: false}));
PANO.position.y = 140; PANO.renderOrder = -1; scene.add(PANO);
const FARG = new THREE.Mesh(new THREE.CircleGeometry(1500, 64), new THREE.MeshBasicMaterial({color: 0x8a9478, fog: false, toneMapped: false})); FARG.rotation.x = -Math.PI / 2; FARG.position.y = -2.2; scene.add(FARG);
const panoTex = {};
function drawPano(mode){
  const W = 6144, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), R = rng(1234);
  const P = {day: {far: '#9fb4c9', rock: '#7d93aa', snow: '#f7f9fc', foot: '#6d8a63', hz: 'rgba(214,226,238,0)', hz2: 'rgba(214,226,238,.9)', bld: '#c9bfae', lit: 0}, dusk: {far: '#a98fa6', rock: '#6f5f7d', snow: '#ffd9bd', foot: '#4d5a45', hz: 'rgba(230,170,140,0)', hz2: 'rgba(230,170,140,.85)', bld: '#8c7364', lit: .5}, night: {far: '#27324a', rock: '#151c2e', snow: '#566684', foot: '#0f1a18', hz: 'rgba(16,24,38,0)', hz2: 'rgba(16,24,38,.9)', bld: '#141a24', lit: 1}}[mode];
  const ph = Array.from({length: 40}, () => R() * 6.283), baseY = H * 0.8;
  const ridge = (u, seed, amp, kmax) => { let v = 0, n = 0; for (let k = 1; k <= kmax; k++) { const a = 1 / Math.pow(k, 0.85); v += a * Math.sin(6.283 * k * u + ph[(k + seed) % 40]); n += a; } return v / n; };
  const env = u => 0.5 + 0.5 * Math.cos(6.283 * u);                 // u = 0 — юг (хребет), север — низкие холмы
  const layer = (seed, hMin, hMax, col, snow) => { const pts = []; let top = H; for (let x = 0; x <= W; x += 4) { const u = x / W, h = H * (hMin + (hMax - hMin) * env(u) * (0.55 + 0.45 * ridge(u, seed, 1, 38)) + 0.02 * ridge(u * 7, seed + 3, 1, 12)); const y = baseY - h; pts.push([x, y]); top = Math.min(top, y); }
    const gr = g.createLinearGradient(0, top, 0, baseY); gr.addColorStop(0, snow ? P.snow : col); gr.addColorStop(snow ? 0.22 : 0.1, snow ? P.snow : col); gr.addColorStop(snow ? 0.34 : 0.4, col); gr.addColorStop(1, col);
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, H); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(W, H); g.closePath(); g.fill(); };
  layer(1, 0.04, 0.62, P.far, true); layer(11, 0.03, 0.42, P.rock, true);
  const hz = g.createLinearGradient(0, baseY - H * 0.25, 0, baseY); hz.addColorStop(0, P.hz); hz.addColorStop(1, P.hz2); g.fillStyle = hz; g.fillRect(0, baseY - H * 0.25, W, H * 0.25);
  layer(23, 0.02, 0.13, P.foot, false);
  g.fillStyle = P.foot; g.fillRect(0, baseY - 2, W, H - baseY + 2);
  for (let x = 0; x < W; x += 3 + R() * 14) { const bh = 5 + R() * (22 + 40 * (R() > 0.93)), bw = 6 + R() * 16, y = baseY + 2 - bh + 8; g.fillStyle = P.bld; g.fillRect(x, y, bw, bh + 40);
    if (P.lit) { g.fillStyle = `rgba(255,214,140,${P.lit * 0.85})`; for (let wy = y + 3; wy < y + bh; wy += 5) for (let wx2 = x + 2; wx2 < x + bw - 2; wx2 += 4) if (R() > 0.55) g.fillRect(wx2, wy, 1.6, 2.2); } }
  for (let x = 0; x < W; x += 5 + R() * 9) { g.fillStyle = ['#46613c', '#3c5634', '#587348'][(R() * 3) | 0]; if (mode === 'night') g.fillStyle = '#0c1612'; const r = 5 + R() * 9; g.beginPath(); g.arc(x, baseY + 14 + R() * 20, r, 0, 6.283); g.fill(); }
  const fade = g.createLinearGradient(0, H - 70, 0, H); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, P.foot); g.fillStyle = fade; g.fillRect(0, H - 70, W, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping; return t;
}
function setPano(mode){ if (!panoTex[mode]) panoTex[mode] = drawPano(mode); PANO.material.map = panoTex[mode]; PANO.material.needsUpdate = true; FARG.material.color.set({day: 0x8f9c7e, dusk: 0x4d5a45, night: 0x0f1a18}[mode]); }
const sunDir = new THREE.Vector3();
const hemi = new THREE.HemisphereLight(0xdbe6f2, 0x5d4a35, 0.7); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.6); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left:-170,right:170,top:170,bottom:-170,near:20,far:700});
sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.04;
scene.add(sun, sun.target);

/* ---------- textures ---------- */
const loader = new THREE.TextureLoader();
const aniso = renderer.capabilities.getMaxAnisotropy();
function tex(url, fn){ const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; if(fn) fn(t); return t; }
function ctex(c, srgb=true){ const t = new THREE.CanvasTexture(c); if(srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; }
function rng(seed){ let s = seed>>>0 || 1; return () => ((s = Math.imul(s ^ (s>>>15), 2246822507) + 0x9e3779b9 >>> 0) % 100000) / 100000; }

/* ---------- материалы ---------- */
const stone = new THREE.MeshStandardMaterial({color:0xF1E8D8, roughness:0.8, envMapIntensity:0.5});
const stoneDark = new THREE.MeshStandardMaterial({color:0xDCCDB2, roughness:0.85});
const leafMat = new THREE.MeshStandardMaterial({color:0x4f6e3a, roughness:0.95, flatShading:true});
const blossomMat = new THREE.MeshStandardMaterial({color:0xE9B9C9, roughness:0.95, flatShading:true});
const trunkMat = new THREE.MeshStandardMaterial({color:0x5a4430, roughness:1});
const paveMat = new THREE.MeshStandardMaterial({color:0xE9DFCB, roughness:0.9});
const lawnMat = new THREE.MeshStandardMaterial({color:0x6f9a4c, roughness:1});
const asphMat = new THREE.MeshStandardMaterial({color:0x4a4d50, roughness:0.95});
const walkMat = new THREE.MeshStandardMaterial({color:0xC9C2B4, roughness:0.95});
const waterMat = new THREE.MeshStandardMaterial({color:0x7fb6d6, roughness:0.15, metalness:0.2});
/* ---------- «живые» поверхности: процедурные текстуры (асфальт, плитка, газон, фасады соседних домов) ---------- */
function ptex(w, h, draw, rx, ry){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; }
const noise = (g, w, h, n, cols, sz) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(Math.random() * w, Math.random() * h, sz, sz); } };
asphMat.map = ptex(512, 512, (g, w, h) => { g.fillStyle = '#4b4d50'; g.fillRect(0, 0, w, h); noise(g, w, h, 9000, ['#5a5c60', '#3d3f42', '#6a6c70', '#34363a'], 2); }, 1 / 6, 1 / 6); asphMat.color.set(0xffffff);
paveMat.map = ptex(512, 512, (g, w, h) => { g.fillStyle = '#e4d9c3'; g.fillRect(0, 0, w, h); noise(g, w, h, 3000, ['#d8ccb4', '#efe6d2', '#cfc3aa'], 3); g.strokeStyle = 'rgba(120,105,80,.55)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); } }, 1 / 4.8, 1 / 4.8); paveMat.color.set(0xffffff);
walkMat.map = ptex(512, 512, (g, w, h) => { g.fillStyle = '#c4bcad'; g.fillRect(0, 0, w, h); noise(g, w, h, 3000, ['#b8b0a0', '#d0c9bb', '#aaa292'], 3); g.strokeStyle = 'rgba(90,84,72,.5)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke(); }, 1 / 2.4, 1 / 2.4); walkMat.color.set(0xffffff);
lawnMat.map = ptex(512, 512, (g, w, h) => { g.fillStyle = '#6b9648'; g.fillRect(0, 0, w, h); noise(g, w, h, 14000, ['#5d8a3c', '#7aa655', '#4f7b32', '#86b060'], 2); }, 1 / 5, 1 / 5); lawnMat.color.set(0xffffff);
const grassMat = lawnMat.clone(); grassMat.map = lawnMat.map.clone(); grassMat.map.needsUpdate = true;
const FACADE_TINTS = [['#f0e2c6', '#a98a66'], ['#e8dcc6', '#9a8268'], ['#f4ead2', '#a58c70'], ['#dcc3a2', '#8c6f56'], ['#e9d6b8', '#a07f5c']];
const nbMats = FACADE_TINTS.map(([wall, win], k) => {
  const f = ptex(256, 256, (g, w, h) => { g.fillStyle = wall; g.fillRect(0, 0, w, h); noise(g, w, h, 1200, [wall, 'rgba(0,0,0,.05)', 'rgba(255,255,255,.07)'], 3);
    g.fillStyle = '#2a3340'; for (const [x] of [[40], [150]]) { g.fillRect(x, 60, 66, 150); g.fillStyle = 'rgba(230,200,140,.35)'; g.fillRect(x + 4, 64, 58, 70); g.fillStyle = '#2a3340'; g.fillStyle = win; g.fillRect(x - 6, 205, 78, 10); g.fillStyle = '#2a3340'; }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - 6, w, 6); }, 1 / 7.2, 1 / 3.3);
  return new THREE.MeshStandardMaterial({map: f, roughness: 0.92, envMapIntensity: 0.4, emissive: 0xffffff, emissiveMap: f, emissiveIntensity: 0.28}); });
const nbRoof = new THREE.MeshStandardMaterial({color: 0xb3ab9d, roughness: 1});
const nbMat = nbMats[0];
const glowM = new THREE.MeshStandardMaterial({color:0xfff2d8, emissive:0xffc27a, emissiveIntensity:0});
const postM = new THREE.MeshStandardMaterial({color:0x1d1a16, metalness:0.6, roughness:0.5});
const deckMat = new THREE.MeshStandardMaterial({color:0xB48B5E, roughness:0.85});
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
const m4 = new THREE.Matrix4();

/* ---------- фото-фасады: подиум (1 этаж + антресоль) + 8 жилых ---------- */
const PODF = 0.233, UPF = (1 - PODF) / 8;
const facTex = {};   // фото-фасады больше не используются: дом построен геометрией
const photoMats = [];
function photoMat(side, f, rep = 1, offX = 0){
  const v0 = f === 1 ? 0 : f === 1.5 ? PODF * 3.9 / 7.0 : PODF + (f - 2) * UPF;
  const vh = f === 1 ? PODF * 3.9 / 7.0 : f === 1.5 ? PODF * 3.1 / 7.0 : UPF;
  const t = facTex[side].clone(), tn = facTex[side + 'Night'].clone();
  for (const x of [t, tn]) { x.wrapS = THREE.RepeatWrapping; x.repeat.set(rep, vh); x.offset.set(offX, v0); x.needsUpdate = true; }
  const m = new THREE.MeshStandardMaterial({color:0x000000, emissiveMap:t, emissive:0xffffff, emissiveIntensity:1, roughness:0.9, metalness:0, toneMapped:false});
  m.userData = {day:t, night:tn}; photoMats.push(m); return m;
}

/* ---------- здание ---------- */
const bld = new THREE.Group(); scene.add(bld);
const shells = [], picks = [];
function quadV(x0, z0, x1, z1, yb, h, mat){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(x1 - x0, z1 - z0), h), mat); m.position.set((x0 + x1) / 2, yb + h / 2, (z0 + z1) / 2);
  m.rotation.y = Math.atan2(-(z1 - z0), x1 - x0); return m;
}
function floorQuad(x0, x1, y0, y1, h, mat, uv){
  const P = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P.flatMap(([x, y]) => [wx(x), h, wz(y)]), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(P.flatMap(([x, y]) => uv(x, y)), 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.material.side = THREE.DoubleSide; return m;
}
/* ---------- угловые панорамные эркеры: цельное остекление с балюстрадой, как на фото ---------- */
function cornerTex(night){ const c = document.createElement('canvas'); c.width = 300; c.height = 330; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 330); gr.addColorStop(0, night ? '#ffb961' : '#e9a85e'); gr.addColorStop(0.55, night ? '#ffd9a0' : '#f2c488'); gr.addColorStop(1, night ? '#c98642' : '#a8743c'); g.fillStyle = gr; g.fillRect(0, 0, 300, 330);
  const rg = g.createRadialGradient(150, 70, 4, 150, 70, 130); rg.addColorStop(0, 'rgba(255,248,215,.95)'); rg.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = rg; g.fillRect(0, 0, 300, 330);
  g.strokeStyle = 'rgba(70,40,18,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(150, 0); g.lineTo(150, 52); g.stroke(); g.fillStyle = 'rgba(255,240,200,.95)'; g.beginPath(); g.ellipse(150, 60, 22, 9, 0, 0, 6.283); g.fill();
  g.fillStyle = 'rgba(60,34,16,.55)'; g.fillRect(40, 205, 90, 60); g.fillRect(180, 195, 80, 70); g.fillStyle = 'rgba(45,70,40,.65)'; g.beginPath(); g.arc(270, 235, 26, 0, 6.283); g.fill();
  g.fillStyle = '#1d1712'; for (const x of [0, 100, 200, 294]) g.fillRect(x - 3, 0, 9, 330); g.fillRect(0, 0, 300, 8);
  g.fillStyle = '#c9b48a'; g.fillRect(0, 262, 300, 68); g.fillStyle = '#1d1712'; g.fillRect(0, 262, 300, 7); g.fillRect(0, 296, 300, 5); for (let x = 8; x < 300; x += 14) g.fillRect(x, 268, 3, 28);
  g.fillStyle = '#d8c7a0'; g.fillRect(0, 301, 300, 29);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const cornerMat = new THREE.MeshStandardMaterial({color: 0x000000, emissive: 0xffffff, emissiveMap: cornerTex(false), emissiveIntensity: 1, roughness: 0.5, metalness: 0, toneMapped: false, side: THREE.DoubleSide});
cornerMat.userData = {day: cornerTex(false), night: cornerTex(true)}; cornerMat.emissiveMap = cornerMat.userData.day; photoMats.push(cornerMat);
const pierMat = new THREE.MeshStandardMaterial({color: 0xa68a62, roughness: 0.9, emissive: 0x4a3b26, emissiveIntensity: 0.6});
const planUV = (x, y) => [(G.Y1 - y) / (G.Y1 - G.Y0), 1 - x / G.D];
/* ====================== ПРОЦЕДУРНЫЙ ФАСАД (геометрия, без фото-текстур) ======================
   Каждый подъезд собирается из пилястр, окон с коваными ограждениями, угловых панорамных эркеров с балконами и цветами,
   витрин подиума, входной арки с люстрой, балюстрады и карниза — по композиции с вашего чертежа и визуализаций. */
function interiorTex(kind, night){
  const W = {win: 256, pano: 512, store: 256, arch: 256}[kind], H = {win: 384, pano: 384, store: 512, arch: 400}[kind];
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), R = rng(kind.length * 977 + (night ? 5 : 1));
  const warm = night ? ['#ffe2b0', '#ffbf6a', '#b97a35'] : ['#f6dcae', '#e8bd7e', '#b0824c'];
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, warm[0]); gr.addColorStop(0.55, warm[1]); gr.addColorStop(1, warm[2]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,248,222,.95)'; g.fillRect(0, 0, W, H * 0.045);                       // подсветка карниза потолка
  const cur = (x0, x1) => { const cg = g.createLinearGradient(x0, 0, x1, 0); cg.addColorStop(0, 'rgba(150,118,84,.85)'); cg.addColorStop(1, 'rgba(214,186,148,.55)'); g.fillStyle = cg; g.fillRect(Math.min(x0, x1), 0, Math.abs(x1 - x0), H * 0.9);
    g.strokeStyle = 'rgba(90,64,40,.35)'; g.lineWidth = 1; for (let x = Math.min(x0, x1) + 3; x < Math.max(x0, x1); x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 1, H * 0.9); g.stroke(); } };
  const cw = kind === 'pano' ? W * 0.07 : W * 0.17; cur(0, cw); cur(W, W - cw);
  const lustre = (cx, cy, s) => { g.strokeStyle = 'rgba(90,60,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, 0); g.lineTo(cx, cy); g.stroke();
    const rg = g.createRadialGradient(cx, cy + s * .5, 2, cx, cy + s * .5, s * 2.4); rg.addColorStop(0, 'rgba(255,250,224,1)'); rg.addColorStop(1, 'rgba(255,226,160,0)'); g.fillStyle = rg; g.fillRect(cx - s * 2.5, cy - s, s * 5, s * 4.4);
    for (let t = 0; t < 3; t++) { g.fillStyle = 'rgba(255,248,214,.95)'; g.beginPath(); g.ellipse(cx, cy + t * s * .55, s * (1.1 - t * .2), s * .16, 0, 0, 6.283); g.fill(); for (let i = -3; i <= 3; i++) { g.fillStyle = 'rgba(255,255,236,.95)'; g.fillRect(cx + i * s * .26 * (1 - t * .2), cy + t * s * .55, 2, s * .38); } } };
  const sofa = (x, y, w, hh) => { g.fillStyle = 'rgba(96,74,56,.82)'; g.beginPath(); g.roundRect(x, y, w, hh, 6); g.fill(); g.fillStyle = 'rgba(122,98,76,.85)'; g.beginPath(); g.roundRect(x + w * .04, y - hh * .5, w * .92, hh * .6, 6); g.fill(); };
  const plant = (x, y, r) => { g.fillStyle = 'rgba(48,74,40,.85)'; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.fillStyle = 'rgba(70,52,36,.9)'; g.fillRect(x - r * .25, y + r * .6, r * .5, r * .9); };
  if (kind === 'pano') { lustre(W * .5, H * .1, 16); lustre(W * .22, H * .12, 11); lustre(W * .78, H * .12, 11); sofa(W * .3, H * .66, W * .4, H * .1); g.fillStyle = 'rgba(70,50,34,.85)'; g.fillRect(W * .44, H * .8, W * .12, H * .03); plant(W * .12, H * .72, 18); plant(W * .88, H * .72, 18); g.fillStyle = 'rgba(80,60,44,.5)'; g.fillRect(W * .55, H * .3, W * .14, H * .2); }
  else if (kind === 'store') { lustre(W * .5, H * .06, 14); g.fillStyle = 'rgba(255,236,190,.55)'; for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) g.fillRect(W * (.2 + i * .15), H * (.34 + r * .11), W * .1, H * .05); g.fillStyle = 'rgba(80,58,40,.8)'; for (let r = 0; r < 4; r++) g.fillRect(W * .18, H * (.39 + r * .11), W * .64, 3); sofa(W * .3, H * .8, W * .4, H * .06); }
  else if (kind === 'arch') { lustre(W * .5, H * .22, 26); g.fillStyle = 'rgba(86,60,40,.7)'; g.fillRect(W * .12, H * .64, W * .76, H * .02); g.fillStyle = 'rgba(255,230,170,.6)'; g.fillRect(W * .2, H * .5, W * .6, H * .12); g.fillStyle = 'rgba(70,52,36,.85)'; g.fillRect(W * .36, H * .72, W * .28, H * .08); plant(W * .14, H * .7, 14); plant(W * .86, H * .7, 14); }
  else { g.fillStyle = 'rgba(255,240,200,.5)'; g.fillRect(W * .3, H * .3, W * .4, H * .15); g.fillStyle = 'rgba(76,56,40,.5)'; g.fillRect(W * .32, H * .32, W * .36, H * .11); lustre(W * .5, H * .14, 9); sofa(W * .28, H * .68, W * .44, H * .09); plant(W * .8, H * .7, 12); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function glassMat(kind){ const d = interiorTex(kind, false), n = interiorTex(kind, true), m = new THREE.MeshStandardMaterial({color: 0x000000, emissive: 0xffffff, emissiveMap: d, emissiveIntensity: 1, roughness: 0.4, toneMapped: false}); m.userData = {day: d, night: n}; photoMats.push(m); return m; }
function railTex(kind){
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d');
  if (kind === 'iron') { g.strokeStyle = '#1a1511'; g.fillStyle = '#1a1511'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 8); g.lineTo(512, 8); g.moveTo(0, 122); g.lineTo(512, 122); g.stroke(); g.lineWidth = 3;
    for (let x = 6; x < 512; x += 32) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, 122); g.stroke(); g.beginPath(); g.arc(x + 16, 40, 12, 0, 6.283); g.stroke(); g.beginPath(); g.arc(x + 16, 90, 12, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(x + 4, 64); g.quadraticCurveTo(x + 16, 52, x + 28, 64); g.quadraticCurveTo(x + 16, 76, x + 4, 64); g.stroke(); } }
  else { g.fillStyle = '#efe3c8'; g.fillRect(0, 0, 512, 14); g.fillRect(0, 112, 512, 16); for (let x = 8; x < 512; x += 24) { g.beginPath(); g.moveTo(x + 6, 14); g.quadraticCurveTo(x - 2, 40, x + 5, 62); g.quadraticCurveTo(x + 14, 90, x + 6, 112); g.lineTo(x + 12, 112); g.quadraticCurveTo(x + 22, 90, x + 13, 62); g.quadraticCurveTo(x + 20, 40, x + 12, 14); g.closePath(); g.fill(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const FM = {
  cream: new THREE.MeshStandardMaterial({color: 0xf1e6cc, roughness: 0.82, envMapIntensity: 0.6, emissive: 0x2b2216, emissiveIntensity: 0.55}),
  dark: new THREE.MeshStandardMaterial({color: 0x2a2018, roughness: 0.5, metalness: 0.45}),
  plinth: new THREE.MeshStandardMaterial({color: 0x56473a, roughness: 0.8}),
  win: glassMat('win'), pano: glassMat('pano'), store: glassMat('store'), arch: glassMat('arch'),
  rail: new THREE.MeshStandardMaterial({map: railTex('iron'), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5}),
  balus: new THREE.MeshStandardMaterial({map: railTex('stone'), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.85, emissive: 0x2b2216, emissiveIntensity: 0.4}),
  lamp: new THREE.MeshBasicMaterial({color: 0xffd48c, toneMapped: false}),
  planter: new THREE.MeshStandardMaterial({color: 0xe9e1d2, roughness: 0.8}),
  plant: new THREE.MeshStandardMaterial({color: 0x3d5e2f, roughness: 0.95}),
  cone: new THREE.MeshStandardMaterial({color: 0x2c5030, roughness: 0.95})
};
const FG = {box: new THREE.BoxGeometry(1, 1, 1), plane: new THREE.PlaneGeometry(1, 1), cyl: new THREE.CylinderGeometry(1, 1, 1, 10), ball: new THREE.IcosahedronGeometry(1, 1), cone: new THREE.ConeGeometry(1, 1, 9)};
const FTYPE = {box: ['box', 'cream'], dark: ['box', 'dark'], plinth: ['box', 'plinth'], win: ['plane', 'win'], pano: ['plane', 'pano'], store: ['plane', 'store'], rail: ['plane', 'rail'], balus: ['plane', 'balus'], lamp: ['ball', 'lamp'], planter: ['cyl', 'planter'], plant: ['ball', 'plant'], cone: ['cone', 'cone']};
const _Y = new THREE.Vector3(0, 1, 0), _bm = new THREE.Matrix4(), _sm = new THREE.Matrix4();
function archShape(w, hr){ const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, hr); sh.absarc(0, hr, w / 2, 0, Math.PI, false); sh.lineTo(-w / 2, 0); return sh; }
function bayList(W, ends, kind){
  const nom = {pano: 4.9, win: 3.2, pil: 0.8, jp: 0.4}; let seq;
  if (kind === 'long') seq = [...(ends[0] === 'pano' ? ['pano'] : ['jp', 'win']), 'pil', 'win', 'pil', 'win', 'pil', 'win', 'pil', 'win', 'pil', ...(ends[1] === 'pano' ? ['pano'] : ['win', 'jp'])];
  else seq = ['pano', 'pil', 'win', 'pil', 'win', 'pil', 'win', 'pil', 'pano'];
  const fixed = seq.reduce((a, t) => a + (t === 'pil' || t === 'jp' ? nom[t] : 0), 0), flex = seq.reduce((a, t) => a + (t === 'pil' || t === 'jp' ? 0 : nom[t]), 0), k = (W - fixed) / flex;
  let u = 0; return seq.map(t => { const w = (t === 'pil' || t === 'jp') ? nom[t] : nom[t] * k, b = {t, w, c: u + w / 2}; u += w; return b; });
}
function buildFacadeFloor(grp, s, f, yb0, h, joinLo, joinHi){
  const A = {}, ya = s.y0, yb = s.y0 + s.L, pod = f === 1 || f === 1.5;
  const frame = (O, N) => ({O, N, T: new THREE.Vector3().crossVectors(_Y, N)});
  const faces = [
    {F: frame(new THREE.Vector3(wx(0), 0, wz(yb)), new THREE.Vector3(-1, 0, 0)), W: s.L, kind: 'long', ends: [joinHi ? 'j' : 'pano', joinLo ? 'j' : 'pano'], arch: true},
    {F: frame(new THREE.Vector3(wx(G.D), 0, wz(ya)), new THREE.Vector3(1, 0, 0)), W: s.L, kind: 'long', ends: [joinLo ? 'j' : 'pano', joinHi ? 'j' : 'pano'], arch: false},
    s.sgn > 0 ? {F: frame(new THREE.Vector3(wx(0), 0, wz(ya)), new THREE.Vector3(0, 0, 1)), W: G.D, kind: 'short', ends: ['pano', 'pano'], arch: false}
              : {F: frame(new THREE.Vector3(wx(G.D), 0, wz(yb)), new THREE.Vector3(0, 0, -1)), W: G.D, kind: 'short', ends: ['pano', 'pano'], arch: false}
  ];
  for (const fc of faces) {
    const {F, W} = fc, P = new THREE.Vector3(), put = (type, u, y, d, sx, sy, sz) => { P.copy(F.O).addScaledVector(F.T, u).addScaledVector(F.N, d); P.y = y;
      _bm.makeBasis(F.T, _Y, F.N); _bm.setPosition(P.x, P.y, P.z); _sm.makeScale(sx, sy, sz); (A[type] = A[type] || []).push(_bm.clone().multiply(_sm)); };
    const bays = bayList(W, fc.ends, fc.kind), uc = W / 2, ARCH = fc.arch && pod, zone = 3.1;
    if (f === 1) put('plinth', W / 2, yb0 + 0.35, 0.12, W, 0.7, 0.26); else put('box', W / 2, yb0 + 0.17, 0.2, W, 0.34, 0.46);
    if (f === 9) { put('box', W / 2, yb0 + h - 0.2, 0.34, W + 0.1, 0.42, 0.85); put('balus', W / 2, yb0 + h + 0.55, 0.62, W, 1.1, 1); }
    for (const b of bays) {
      const inArch = ARCH && Math.abs(b.c - uc) < zone + b.w / 2 - 0.2;
      if (b.t === 'pil' || b.t === 'jp') {
        put('box', b.c, yb0 + h / 2, 0.13, b.w, h, 0.26); put('box', b.c, yb0 + h - 0.27, 0.2, b.w + 0.25, 0.34, 0.42); put('box', b.c, yb0 + 0.58, 0.18, b.w + 0.14, 0.3, 0.34);
        if (!pod && b.t === 'pil') put('lamp', b.c, yb0 + 1.7, 0.34, 0.1, 0.17, 0.1);
        if (f === 1 && b.t === 'pil' && !(ARCH && Math.abs(b.c - uc) < zone + 0.4)) { put('dark', b.c, yb0 + 0.55, 1.15, 0.5, 0.7, 0.5); put('cone', b.c, yb0 + 1.95, 1.15, 0.5, 2.3, 0.5); }
        continue; }
      if (pod) {
        if (inArch) { if (f === 1) put('lamp', b.c, yb0 + 3.3, 0.36, 0.13, 0.22, 0.13); continue; }
        const gw = b.w - 0.35, gh = f === 1 ? h - 0.95 : h - 0.75, gy = f === 1 ? yb0 + 0.72 + gh / 2 : yb0 + 0.42 + gh / 2;
        put('dark', b.c, gy, 0.0, gw + 0.18, gh + 0.18, 0.08); put('store', b.c, gy, 0.06, gw, gh, 1);
        for (let i = 1; i <= 2; i++) put('dark', b.c - gw / 2 + gw * i / 3, gy, 0.1, 0.07, gh, 0.1);
        put('dark', b.c, gy + gh * 0.16, 0.1, gw, 0.07, 0.1);
        if (f === 1.5) put('rail', b.c, yb0 + 0.42 + 0.5, 0.34, b.w - 0.2, 0.95, 1);
        continue; }
      if (b.t === 'win') {
        put('dark', b.c, yb0 + 1.9, 0.05, 1.74, 2.62, 0.1); put('win', b.c, yb0 + 1.9, 0.11, 1.5, 2.4, 1); put('dark', b.c, yb0 + 1.9, 0.14, 0.06, 2.4, 0.06);
        put('box', b.c, yb0 + 0.5, 0.2, 2.0, 0.1, 0.4); put('box', b.c, yb0 + 3.17, 0.14, 2.0, 0.16, 0.3);
        put('rail', b.c, yb0 + 0.34 + 0.5, 0.4, 1.95, 0.95, 1);
      } else {   // угловой панорамный эркер с балконом
        const pw = b.w, gh = h - 0.75;
        put('box', b.c, yb0 + 0.15, 0.52, pw, 0.3, 1.04);
        put('pano', b.c, yb0 + 0.32 + gh / 2, -0.12, pw - 0.5, gh, 1);
        for (let i = 0; i <= 4; i++) put('dark', b.c - (pw - 0.5) / 2 + (pw - 0.5) * i / 4, yb0 + 0.32 + gh / 2, -0.09, 0.09, gh + 0.06, 0.12);
        put('dark', b.c, yb0 + 0.32 + gh, -0.09, pw - 0.4, 0.1, 0.14);
        put('rail', b.c, yb0 + 0.3 + 0.5, 1.02, pw, 1.0, 1);
        for (const sx of [-1, 1]) { put('planter', b.c + sx * (pw / 2 - 0.45), yb0 + 0.55, 0.78, 0.26, 0.5, 0.26); put('plant', b.c + sx * (pw / 2 - 0.45), yb0 + 1.05, 0.78, 0.42, 0.42, 0.42); }
        put('planter', b.c, yb0 + 0.55, 0.78, 0.22, 0.4, 0.22); put('plant', b.c, yb0 + 0.98, 0.78, 0.3, 0.3, 0.3); }
    }
    if (fc.arch && f === 1) {   // входная группа: арка с люстрой, двери, фонари, ступени
      const AW = 4.3, HR = 4.2, geoE = (sh, d) => new THREE.ExtrudeGeometry(sh, {depth: d, bevelEnabled: false});
      const base = new THREE.Matrix4(); P.copy(F.O).addScaledVector(F.T, uc).addScaledVector(F.N, 0); P.y = yb0; base.makeBasis(F.T, _Y, F.N); base.setPosition(P.x, P.y, P.z);
      const place = (geo, mat, dz) => { const m = new THREE.Mesh(geo, mat); m.matrixAutoUpdate = false; m.matrix.copy(base).multiply(new THREE.Matrix4().makeTranslation(0, 0, dz)); grp.add(m); m.castShadow = true; return m; };
      const sur = archShape(AW + 1.1, HR); const hole = archShape(AW, HR); sur.holes.push(new THREE.Path(hole.getPoints(24).reverse()));
      place(geoE(sur, 0.36), FM.cream, 0); place(geoE(archShape(AW + 0.16, HR), 0.06), FM.dark, 0.0);
      const gg = new THREE.ShapeGeometry(archShape(AW, HR), 24); { const pos = gg.attributes.position, uv = new Float32Array(pos.count * 2); for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) + AW / 2) / AW; uv[i * 2 + 1] = pos.getY(i) / (HR + AW / 2); } gg.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
      place(gg, FM.arch, 0.08);
      for (const [x, y, w, hh] of [[0, 1.5, 0.07, 3.0], [-AW / 4, 1.5, 0.05, 3.0], [AW / 4, 1.5, 0.05, 3.0], [0, 3.0, AW, 0.08], [0, HR, AW, 0.08], [0, HR + AW / 4, 0.06, AW / 2]]) put('dark', uc + x, yb0 + y + (hh > 3 ? 0 : 0), 0.14, w, hh, 0.1);
      put('box', uc, yb0 + 0.1, 1.0, AW + 1.3, 0.2, 2.0); put('box', uc, yb0 + 0.03, 1.5, AW + 2.2, 0.06, 3.0);
      for (const sx of [-1, 1]) { put('dark', uc + sx * (AW / 2 + 0.55), yb0 + 3.35, 0.45, 0.06, 0.1, 0.22); put('lamp', uc + sx * (AW / 2 + 0.55), yb0 + 3.3, 0.55, 0.14, 0.24, 0.14); }
      for (const sx of [-1, 1]) for (const dx of [1.9, 2.6]) { put('dark', uc + sx * (AW / 2 + dx), yb0 + 0.5, 1.4, 0.55, 0.65, 0.55); put('cone', uc + sx * (AW / 2 + dx), yb0 + 1.9, 1.4, 0.5, 2.1, 0.5); }
    }
    if (fc.arch && f === 2) { put('box', uc, yb0 + 0.17, 0.62, 5.0, 0.34, 1.24); put('balus', uc, yb0 + 0.34 + 0.5, 1.2, 5.0, 1.0, 1); for (const sx of [-1, 1]) { put('box', uc + sx * 2.5, yb0 + 0.9, 1.2, 0.3, 1.5, 0.3); put('plant', uc + sx * 2.5, yb0 + 1.85, 1.2, 0.36, 0.36, 0.36); } }
  }
  for (const [type, arr] of Object.entries(A)) { const [g, m] = FTYPE[type], im = new THREE.InstancedMesh(FG[g], FM[m], arr.length); arr.forEach((mt, i) => im.setMatrixAt(i, mt)); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; im.castShadow = ['box', 'dark', 'plinth', 'planter'].includes(type); grp.add(im); }
  const wall = new THREE.Mesh(new THREE.BoxGeometry(G.D - 0.04, h, s.L - 0.04), FM.cream); wall.position.set(wx(G.D / 2), yb0 + h / 2, wz((ya + yb) / 2)); wall.castShadow = true; wall.receiveShadow = true; grp.add(wall);
  for (const xx of [0, G.D]) { const yc = s.sgn > 0 ? ya : yb, ox = xx === 0 ? -1 : 1; const pier = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.5), FM.cream); pier.position.set(wx(xx) + ox * 0.12, yb0 + h / 2, wz(yc) + (s.sgn > 0 ? 1 : -1) * 0.12); grp.add(pier); }
}

for (const s of G.sects) {
  const z = SECZ[s.n], ya = s.y0, yb = s.y0 + s.L, rep = 1;
  const joinLo = G.sects.some(o => o !== s && Math.abs(o.y0 + o.L - ya) < 0.4), joinHi = G.sects.some(o => o !== s && Math.abs(o.y0 - yb) < 0.4);   // стык двух подъездов в одном блоке
  for (const f of SHELLS) {
    const grp = new THREE.Group(), yb0 = z + LV[f], h = FH(f);
    buildFacadeFloor(grp, s, f, yb0, h, joinLo, joinHi);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(G.D - 0.1, 0.3, s.L - 0.1), stone); slab.position.set(wx(G.D / 2), yb0 + h - 0.16, wz((ya + yb) / 2)); slab.receiveShadow = true; grp.add(slab);
    grp.traverse(o => { if (o.isMesh) o.castShadow = true; });
    bld.add(grp); shells.push({o: grp, fl: f});
  }
  const roof = new THREE.Group(), yr = z + ROOF;
  { const pl = new THREE.Mesh(new THREE.BoxGeometry(G.D, 2.5, s.L), new THREE.MeshStandardMaterial({color: 0x77706a, roughness: 0.9})); pl.position.set(wx(G.D / 2), -1.25, wz((ya + yb) / 2)); bld.add(pl); shells.push({o: pl, fl: 1}); }   // гранитный цоколь до тротуара
  const deck = new THREE.Mesh(new THREE.BoxGeometry(G.D, 0.3, s.L), deckMat); deck.position.set(wx(G.D / 2), yr + 0.15, wz((ya + yb) / 2)); deck.receiveShadow = true; roof.add(deck);
  const cc = s.core, gl = [[ya + 1.6, cc[2] - 1.2], [cc[3] + 1.2, yb - 1.6]];
  for (const [g0, g1] of gl) { const lawn = new THREE.Mesh(new THREE.BoxGeometry(16, 0.32, g1 - g0), lawnMat); lawn.position.set(wx(G.D / 2), yr + 0.2, wz((g0 + g1) / 2)); roof.add(lawn); }
  for (const yy of gl.map(g => (g[0] + g[1]) / 2)) {
    const r = new THREE.Group(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; r.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8), stone), Math.cos(a) * 2.1, 1.4, Math.sin(a) * 2.1)); }
    r.add(at(new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), stone), 0, 2.8, 0)); r.position.set(wx(G.D / 2), yr + 0.3, wz(yy)); roof.add(r);
  }
  const c = s.core, hd = new THREE.Mesh(new THREE.BoxGeometry(c[1] - c[0], 3.6, c[3] - c[2]), stoneDark); hd.position.set(wx((c[0] + c[1]) / 2), yr + 1.8, wz((c[2] + c[3]) / 2)); roof.add(hd);
  for (let yy = ya + 2; yy < yb - 1; yy += 3) for (const xx of [1.3, G.D - 1.3]) roof.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), leafMat), wx(xx), yr + 1.4, wz(yy)));
  for (const [x0, x1, y0, y1] of [[0, G.D, ya, ya + 0.25], [0, G.D, yb - 0.25, yb], [0, 0.25, ya, yb], [G.D - 0.25, G.D, ya, yb]].filter((e, i) => !(i === 0 && joinLo) && !(i === 1 && joinHi))) { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 1.2, y1 - y0), stone); b.position.set(wx((x0 + x1) / 2), yr + 0.6, wz((y0 + y1) / 2)); roof.add(b); }
  roof.traverse(o => { if (o.isMesh) o.castShadow = true; });
  bld.add(roof); shells.push({o: roof, fl: 10});
}

/* ---------- планы этажей ---------- */
const planTex = {typ: tex('img/tex3-typ.jpg'), L1: tex('img/tex3-L1.jpg'), L2: tex('img/tex3-L2.jpg'), P1: tex('img/tex3-P1.jpg'), P2: tex('img/tex3-P2.jpg')};
const plates = {};
const pk = G.park, parkUV = (x, y) => [(pk.YN - y) / (pk.YN - pk.YS), 1 - x / pk.WUX];
function plate(key, texKey, hOf){
  const g = new THREE.Group();
  if (texKey[0] === 'P') g.add(floorQuad(0, pk.WUX, pk.YS, pk.YN, hOf(), new THREE.MeshBasicMaterial({map: planTex[texKey], toneMapped: false, transparent: texKey === 'P3'}), parkUV));
  else for (const s of G.sects) g.add(floorQuad(0, G.D, s.y0, s.y0 + s.L, hOf(s), new THREE.MeshBasicMaterial({map: planTex[texKey], toneMapped: false}), planUV));
  g.visible = false; scene.add(g); plates[key] = g; return g;
}
for (let f = 2; f <= 9; f++) { const g = new THREE.Group(); g.visible = false; scene.add(g); plates[f] = g; }
plate(1, 'L1', s => 0.02); plate(1.5, 'L2', s => LV[1.5] + 0.02);
plate('P1', 'P1', () => PK.P1 + 0.02); plate('P2', 'P2', () => PK.P2 + 0.02);
const ovMat = c => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: 0, depthWrite: false});
/* схематичные контуры квартир: этаж подъезда делится на верхнюю и нижнюю зону вокруг ядра, ширина — пропорционально площади */
function schemRects(u){
  const sc = G.sects.find(q => q.n === u.section), us = UNITS.filter(q => q.section === u.section && q.floor === u.floor).sort((p, q) => p.pos - q.pos);
  const nTop = Math.ceil(us.length / 2), top = us.slice(0, nTop), bot = us.slice(nTop), inTop = top.includes(u), arr = inTop ? top : bot;
  const tot = arr.reduce((a, q) => a + q.area, 0), x0 = 0.5, W = 21.4; let x = x0;
  for (const q of arr) { const w = W * q.area / tot; if (q === u) { const y0 = inTop ? sc.y0 + 0.4 : sc.core[3] + 0.2, y1 = inTop ? sc.core[2] - 0.2 : sc.y0 + sc.L - 0.4; return [x + 0.12, x + w - 0.12, y0, y1]; } x += w; }
}
const flatMat = c => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: 0.78, depthWrite: false, toneMapped: false});
for (const f of [2, 3, 4, 5, 6, 7, 8, 9]) for (const s of G.sects) {
  const core = new THREE.Mesh(new THREE.PlaneGeometry(9.6, s.core[3] - s.core[2]), new THREE.MeshBasicMaterial({color: 0xd9d2c2, toneMapped: false}));
  core.rotation.x = -Math.PI / 2; core.position.set(wx(11.2), LV[f] + 0.05, wz((s.core[2] + s.core[3]) / 2)); plates[f].add(core);
}
for (const u of UNITS) {
  const r = schemRects(u), ovs = [];
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(r[1] - r[0], r[3] - r[2]), flatMat(M.TYPES[u.type].color));
  fl.rotation.x = -Math.PI / 2; fl.position.set(wx((r[0] + r[1]) / 2), LV[u.floor] + 0.06, wz((r[2] + r[3]) / 2)); plates[u.floor].add(fl);
  const box = new THREE.Mesh(new THREE.BoxGeometry(r[1] - r[0], 1.2, r[3] - r[2]), ovMat(M.TYPES[u.type].color));
  box.position.set(wx((r[0] + r[1]) / 2), SECZ[u.section] + LV[u.floor] + 0.6, wz((r[2] + r[3]) / 2)); box.userData = {unit: u, ovs}; ovs.push(box); plates[u.floor].add(box); picks.push(box);
}
const stallPicks = []; const PAK = (M.parkAssign && M.parkAssign() || {cat: {}}).cat;
for (const st of G.stalls) {
  const lv = 'P' + (-st.lv), r = st.r;
  const box = new THREE.Mesh(new THREE.BoxGeometry(r[1] - r[0] - 0.1, 1.4, r[3] - r[2] - 0.1), ovMat((PAK[st.no]||st.cat) === 'extra' ? 0xE0B84A : (PAK[st.no]||st.cat) === 'apt' ? 0xB8955A : (PAK[st.no]||st.cat) === 'com' ? 0x3D6FA8 : 0x2E8B7E));
  box.position.set(wx((r[0] + r[1]) / 2), PK[lv] + 0.7, wz((r[2] + r[3]) / 2)); box.userData = {stall: st}; plates[lv].add(box); stallPicks.push(box);
}
const carParts = [], streetCars = [];
for (const lv of ['P1', 'P2']) carParts.push({g: plates[lv], pl: G.stalls.filter(s => 'P' + (-s.lv) === lv && (s.no * 7) % 10 < 6).map(s => ({x: wx((s.r[0] + s.r[1]) / 2), y: PK[lv] + 0.02, z: wz((s.r[2] + s.r[3]) / 2), rot: s.r[0] < 15 ? Math.PI / 2 : -Math.PI / 2}))});

/* ---------- участок, улицы, двор ---------- */
const site = new THREE.Group(); scene.add(site);
function polyMesh(pts, h, mat){
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(wx(x), -wz(y))));
  const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.position.y = h; m.receiveShadow = true; return m;
}
const gr = new THREE.PlaneGeometry(460, 460, 1, 46); gr.rotateX(-Math.PI / 2);
{ const gp = gr.attributes.position; for (let i = 0; i < gp.count; i++) gp.setY(i, ground(YM - gp.getZ(i)) - 0.3); gr.computeVertexNormals(); }
grassMat.map.repeat.set(460 / 8, 460 / 8); grassMat.color.set(0xd9d6bb);
const groundM = new THREE.Mesh(gr, grassMat); groundM.receiveShadow = true; site.add(groundM);
const sy = y => ground(y);
function flat(pts, mat, dy = 0){ const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length; return polyMesh(pts, sy(cy) + dy, mat); }
site.add(flat([[-40, -30], [-17.5, -30], [-17.5, 200], [-40, 200]], asphMat, 0.01));
site.add(flat([[-17.5, -30], [-12.6, -30], [-12.6, 200], [-17.5, 200]], walkMat, 0.06));
site.add(flat([[-40, 163.6], [90, 162.0], [90, 185], [-40, 185]], asphMat, 0.01));
site.add(flat([[-40, -15.8], [90, -16.6], [90, -40], [-40, -40]], asphMat, 0.01));
site.add(flat([[-40, -9.4], [90, -10.2], [90, -16.6], [-40, -15.8]], walkMat, 0.06));
site.add(flat([[-40, 162.4], [90, 160.9], [90, 162.0], [-40, 163.6]], walkMat, 0.06));
site.add(flat(G.p165, paveMat, 0.05));
site.add(flat(G.p133, lawnMat, 0.04));
site.add(flat([[22.4, 0.4], [34.6, 0.4], [34.6, 23.4], [22.4, 23.4]], paveMat, 0.07));
site.add(flat([[0, 0.4], [22.4, 0.4], [22.4, G.Y0], [0, G.Y0]], paveMat, 0.07));
site.add(flat([[0, G.Y1], [22.4, G.Y1], [22.4, 153.2], [-0.1, 153]], paveMat, 0.07));
site.add(flat([[-9.2, -9.1], [-5.0, -9.1], [-5.0, 161.8], [-9.2, 161.8]], new THREE.MeshStandardMaterial({color: 0x9db37a, roughness: 1}), 0.09));
site.add(flat([[28.5, 0.4], [32.7, 0.4], [32.7, 96], [28.5, 96]], new THREE.MeshStandardMaterial({color: 0x9db37a, roughness: 1}), 0.08));
{ // рампа въезда/выезда паркинга в разрыве между блоками (с ул. Амангельды), над ней — пергола
  const ya = G.rampA[0], yb = G.rampA[1], ym = (ya + yb) / 2;
  const rp = new THREE.Mesh(new THREE.BoxGeometry(32, 0.25, yb - ya), new THREE.MeshStandardMaterial({color: 0x55585c, roughness: 0.8})); rp.position.set(wx(6.8), sy(ym) + 0.12, wz(ym)); site.add(rp);
  for (const yy of [ya - 0.15, yb + 0.15]) { const wl = new THREE.Mesh(new THREE.BoxGeometry(24, 1.1, 0.3), stone); wl.position.set(wx(10.6), sy(ym) + 0.55, wz(yy)); site.add(wl); }
}
const cy = y => sy(y) + 0.1;
site.add(at(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.6, 32), stone), wx(46), cy(52) + 0.3, wz(52)));
site.add(at(new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.1, 32), waterMat), wx(46), cy(52) + 0.62, wz(52)));
{ const gaz = new THREE.Group(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; gaz.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 3.2, 8), stone), Math.cos(a) * 2.7, 1.6, Math.sin(a) * 2.7)); }
  gaz.add(at(new THREE.Mesh(new THREE.SphereGeometry(3.1, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), stone), 0, 3.2, 0)); gaz.position.set(wx(38.6), cy(104), wz(104)); site.add(gaz); }
site.add(polyMesh([[34, 62.8], [43.5, 62.8], [43.5, 72], [34, 72]], cy(67) + 0.05, new THREE.MeshStandardMaterial({color: 0xE6C696, roughness: 1})));
site.add(polyMesh([[45.5, 62.8], [55.5, 62.8], [55.5, 71.8], [45.5, 71.8]], cy(67) + 0.05, new THREE.MeshStandardMaterial({color: 0xC9A98A, roughness: 1})));
for (const [a, b] of [[[22.4, 40], [50, 40]], [[22.4, 62], [55, 62]], [[22.4, 110], [36, 110]]]) site.add(polyMesh([[a[0], a[1] - 1.1], [b[0], a[1] - 1.1], [b[0], a[1] + 1.1], [a[0], a[1] + 1.1]], cy(a[1]) + 0.06, paveMat));
site.add(polyMesh([[37.7, 24], [39.5, 24], [39.5, 80], [37.7, 80]], cy(52) + 0.06, paveMat));
const LEAVES = [0x4a6b34, 0x587a3b, 0x3f5e2d, 0x66853f].map(c => new THREE.MeshStandardMaterial({color: c, roughness: 0.95}));
const BLOSS = [0xE9B9C9, 0xF0C7D3, 0xDDA4B8].map(c => new THREE.MeshStandardMaterial({color: c, roughness: 0.95}));
function tree(x, y, big = 1, blossom = false){
  const t = new THREE.Group(), r = rng(((x * 73 + y * 31) | 0) + 7); const hh = (2.6 + r() * 1.2) * big;
  t.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.14 * big, 0.26 * big, hh, 7), trunkMat), 0, hh / 2, 0));
  const set = blossom ? BLOSS : LEAVES, n = 6 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = (0.4 + r() * 1.5) * big, rad = (1.1 + r() * 0.9) * big;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 1), set[(r() * set.length) | 0]); m.scale.y = 0.85; t.add(at(m, Math.cos(a) * d, hh + 0.4 * big + r() * 2.2 * big, Math.sin(a) * d)); }
  t.rotation.y = r() * 6.28; t.position.set(wx(x), sy(y), wz(y)); t.traverse(o => { if (o.isMesh) o.castShadow = true; }); site.add(t);
}
for (let y = -4; y < 158; y += 8) { tree(-3.0, y, 1.0); tree(-11.0, y + 4, 1.05, (y + 4) % 24 === 0); }
for (let y = 6; y < 156; y += 9) { tree(31.5, y, 0.9 + (y % 3) * 0.1); }
[[26.5, 30], [26.5, 50], [26.5, 72], [26.5, 96], [26.5, 118], [36, 30], [43, 30], [36, 46], [53, 47], [40, 58], [48, 66.5], [36, 85], [42, 99], [36, 112]].forEach(([x, y], i) => tree(x, y, 1.1, i % 3 === 0));
for (let y = 0; y < 160; y += 14) { site.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4, 6), postM), wx(-1.2), sy(y) + 2, wz(y)));
  const l = at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glowM), wx(-1.2), sy(y) + 4.1, wz(y)); l.userData.lamp = true; site.add(l); }
let nbK = 0;
function nbBlock(poly, h, y){ const sh = new THREE.Shape(poly.map(([x, yy]) => new THREE.Vector2(wx(x), -wz(yy))));
  const g = new THREE.ExtrudeGeometry(sh, {depth: h, bevelEnabled: false}); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, [nbRoof, nbMats[(nbK++) % nbMats.length]]); m.position.y = y; m.castShadow = m.receiveShadow = true; site.add(m);
  const e = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, {depth: 0.5, bevelEnabled: false}), new THREE.MeshStandardMaterial({color: 0xa59d8f, roughness: 1})); e.geometry.rotateX(-Math.PI / 2); e.position.y = y + h; site.add(e); }
for (const nb of G.nb) nbBlock(nb.poly, nb.h, sy(nb.poly.reduce((s, p) => s + p[1], 0) / nb.poly.length));
[[-75, 20, 30, 90, 22], [-75, 120, 30, 50, 15], [70, 140, 30, 30, 26], [78, 40, 24, 50, 40], [10, 200, 70, 20, 18], [10, -55, 70, 20, 20], [-75, -40, 30, 40, 12]].forEach(([x, y, w, l, h]) => nbBlock([[x - w / 2, y - l / 2], [x + w / 2, y - l / 2], [x + w / 2, y + l / 2], [x - w / 2, y + l / 2]], h, sy(y)));
function label(text, x, y, h = 3){ const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,26,22,.78)'; g.beginPath(); g.roundRect(4, 14, 1016, 100, 50); g.fill(); g.fillStyle = '#F3E9D6'; g.font = '600 60px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 512, 66);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: ctex(c), depthTest: false})); sp.scale.set(24, 3, 1); sp.position.set(wx(x), sy(y) + h, wz(y)); sp.renderOrder = 5; site.add(sp); }
label('ул. Амангельды', -26, 60); label('ул. Жамбыла', 12, 172); label('ул. Шевченко', 12, -24);
for (let y = -20; y < 190; y += 9) streetCars.push({x: wx(y % 18 ? -26 : -22.5), y: sy(y) + 0.02, z: wz(y), rot: y % 18 ? 0 : Math.PI});

// load the car model (Draco-compressed glTF, embedded) and build instanced fleets
const CAR_COLORS = [0x0d0d0f, 0xf2f2f0, 0xa31d1d, 0x1c2a44, 0x9aa0a6, 0x1f3b2c, 0xe8b100, 0x2b2b2e, 0x6b0f1a, 0xd9d6cf, 0x0e1b2e, 0xc45a12];
(async () => {
  // модель машины хранится как обычные массивы геометрии (без бинарного файла модели)
  const car = new THREE.Group();
  for(const d of CAR){ const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(d.p, 3));
    if(d.n) g.setAttribute('normal', new THREE.Float32BufferAttribute(d.n, 3)); if(d.i) g.setIndex(d.i); if(!d.n) g.computeVertexNormals();
    const mt = new THREE.MeshStandardMaterial({color:new THREE.Color(d.c[0],d.c[1],d.c[2]), metalness:d.mt, roughness:d.r, emissive:new THREE.Color(d.e[0],d.e[1],d.e[2]), transparent:d.c[3]<1, opacity:d.c[3]});
    const m = new THREE.Mesh(g, mt); m.name = d.name; m.matrixAutoUpdate = false; m.matrix.fromArray(d.m); car.add(m); }
  const bodyM = new THREE.MeshPhysicalMaterial({color:0xffffff, metalness:0.85, roughness:0.32, clearcoat:1, clearcoatRoughness:0.04, envMapIntensity:1.2});
  const detailM = new THREE.MeshStandardMaterial({color:0xdddddd, metalness:1, roughness:0.3});
  const glassM = new THREE.MeshPhysicalMaterial({color:0x0c1014, metalness:0.2, roughness:0.04, transparent:true, opacity:0.62, envMapIntensity:1.5});
  car.traverse(o => { if(!o.isMesh) return; if(o.name==='body') o.material = bodyM; else if(o.name==='glass') o.material = glassM; else if(o.name==='detail') o.material = detailM;
    else if(o.name.startsWith('other_de') || o.name.startsWith('other_e25f')) { o.material = new THREE.MeshStandardMaterial({color:0x9a0000, emissive:0x550000, roughness:0.3}); } });
  car.position.set(0,0,0); car.rotation.set(0,0,0); car.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(car), size = box.getSize(new THREE.Vector3());
  const alongX = size.x > size.z; // model length axis
  const parts = []; car.traverse(o => { if(o.isMesh) parts.push(o); });
  const ao = tex('img/ferrari_ao.png'); const aoM = new THREE.MeshBasicMaterial({map:ao, blending:THREE.MultiplyBlending, toneMapped:false, transparent:true, depthWrite:false});
  const aoG = new THREE.PlaneGeometry(0.655*4, 1.3*4).rotateX(-Math.PI/2); if(alongX) aoG.rotateY(Math.PI/2);
  function fleet(pl, parent, shadows){
    const base = new THREE.Matrix4(), rot = new THREE.Matrix4(), cc = new THREE.Color();
    for(const p of parts){
      const im = new THREE.InstancedMesh(p.geometry, p.material, pl.length);
      pl.forEach((c,i) => { rot.makeRotationY(c.rot + (alongX ? Math.PI/2 : 0)); base.makeTranslation(c.x, c.y, c.z).multiply(rot).multiply(p.matrixWorld); im.setMatrixAt(i, base);
        if(p.material === bodyM) im.setColorAt(i, cc.setHex(CAR_COLORS[(i*7 + Math.round(c.x*3)) % CAR_COLORS.length])); });
      im.castShadow = shadows; im.receiveShadow = false; parent.add(im);
    }
    const sh = new THREE.InstancedMesh(aoG, aoM, pl.length); pl.forEach((c,i) => { m4.makeTranslation(c.x, c.y+0.02, c.z).multiply(new THREE.Matrix4().makeRotationY(c.rot)); sh.setMatrixAt(i, m4); }); sh.renderOrder = 2; parent.add(sh);
  }
  carParts.forEach(cp => fleet(cp.pl, cp.g, false));
  fleet(streetCars, site, true);
  window.__carsReady = true;
})().catch(e => console.warn('car model', e));

/* ---------- состояние ---------- */
let level = 'all', selected = null, hovered = null, selSt = null;
const ghost = new THREE.Group(); ghost.visible = false; scene.add(ghost);
for (const s of G.sects) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(G.D, PAR, s.L)), new THREE.LineBasicMaterial({color: 0xE3C894, transparent: true, opacity: 0.55})); e.position.set(wx(G.D / 2), PAR / 2, wz(s.y0 + s.L / 2)); ghost.add(e); }
const isPark = () => level === 'P1' || level === 'P2';
function apply(){
  document.querySelectorAll('#vfloors button').forEach(b => b.classList.toggle('on', b.dataset.f === String(level)));
  Object.values(plates).forEach(p => p.visible = false);
  const park = isPark(), isFloor = typeof level === 'number';
  if (plates[level]) plates[level].visible = true;
  shells.forEach(s => s.o.visible = !park && !(isFloor && s.fl >= level));
  site.visible = !park; ghost.visible = park; PANO.visible = !park; FARG.visible = !park;
  if (!isFloor || level < 2) select(null);
  if (!park) selStall(null, true);
  if (level === 1 || level === 1.5) showCom(level); else if (park) showPark(); else info.classList.remove('show');
  if (park) { scene.fog = null; sky.visible = false; scene.background = new THREE.Color(0x15191b); } else setLight(lightKey);
}
function showCom(f){
  const E = Object.entries(M.COMM), sum = k => E.reduce((t, [, v]) => t + v[k], 0), m2 = x => `${UI.nf(x, 2)} м²`;
  const rows = E.map(([n, v]) => `<tr><td>${n}</td><td>${m2(v.L1)}</td><td>${m2(v.MZ)}</td><td>${m2(v.B1)}</td><td><b>${m2(v.L1 + v.MZ + v.B1)}</b></td></tr>`).join('');
  const all = sum('L1') + sum('MZ') + sum('B1');
  info.innerHTML = `<h4>Первый этаж · коммерция и лобби</h4><div class="comtab"><table><tr class="hd"><th>Помещение</th><th>1 этаж</th><th>Антресоль</th><th>Цоколь</th><th>Всего</th></tr>${rows}<tr class="sum"><td>Итого</td><td>${m2(sum('L1'))}</td><td>${m2(sum('MZ'))}</td><td>${m2(sum('B1'))}</td><td>${m2(all)}</td></tr></table></div>
  <p class="small" style="color:#B9C4BB;margin-top:8px">${E.length} помещений коммерции на трёх уровнях: первый этаж, антресоль и цоколь. Витрины выходят на ул. Амангельды; в каждом подъезде — лобби со входом с улицы.</p><div class="seg" style="margin-top:10px"><button id="vclose">Закрыть</button></div>`;
  info.classList.add('show'); document.getElementById('vclose').onclick = () => info.classList.remove('show');
}
function showPark(){
  const lv = -(+level[1]), n = G.stalls.filter(s => s.lv === lv).length, c = G.cells.filter(s => s.lv === lv);
  info.innerHTML = `<h4>Паркинг ${lv}</h4><div class="big">${n} мест</div><p class="small" style="color:#B9C4BB;margin-top:6px"><span>Всего ${G.stalls.length} мест на 2 уровнях (−1, −2): по 2 на квартиру и 7 гостевых; места сверх нормы — в продажу или под кладовые.</span> ${lv === -1 ? '<span>На −1 — торговый цоколь коммерции.</span>' : ''} <span>Нажмите на место — номер, размер, назначение.</span></p><div class="seg" style="margin-top:10px"><button id="vclose">Закрыть</button></div>`;
  info.classList.add('show'); document.getElementById('vclose').onclick = () => info.classList.remove('show');
}
const CAT = {res: 'жителям — по 2 на квартиру', apt: 'закреплено за квартирой (2 на квартиру)', extra: 'сверх нормы — свободное, на продажу', guest: 'гостевое / МГН'};
function selStall(b, silent){
  if (selSt) selSt.material.opacity = 0; selSt = b;
  if (!b) return; b.material.opacity = 0.65; const st = b.userData.stall;
  info.innerHTML = `<h4>Машино-место № ${st.no}</h4><div class="big num">${(PAK[st.no]||st.cat) === 'guest' ? 'гостевое' : (PAK[st.no]||st.cat) === 'apt' ? 'в составе квартиры' : UI.usd(30000)}</div>
  <table class="num"><tr><td>Уровень</td><td>${{'-1': '−1 · абс. 813,55', '-2': '−2 · абс. 810,25'}[st.lv]}</td></tr><tr><td>Размер места</td><td>${UI.nf(st.w, 2)} × ${UI.nf(st.l, 2)} м</td></tr>
  <tr><td>Норма РК (СП РК 3.03-105)</td><td>≥ 2,50 × 5,30 м</td></tr><tr><td>Назначение</td><td>${CAT[PAK[st.no] || st.cat]}</td></tr><tr><td>Проезд</td><td>6,0 м, двусторонний</td></tr><tr><td>Высота в чистоте</td><td>не менее 2,6 м</td></tr></table>
  <div class="seg" style="margin-top:10px"><button id="vclose">Закрыть</button></div>`;
  info.classList.add('show'); document.getElementById('vclose').onclick = () => { info.classList.remove('show'); selStall(null); };
}
window.addEventListener('shevprice', () => { if (selected) { const m = selected; selected = null; select(m); } });
function select(mesh){
  if (selected) selected.userData.ovs.forEach(o => o.material.opacity = 0);
  selected = mesh;
  if (!mesh) { if (typeof level === 'number' && level >= 2) info.classList.remove('show'); return; }
  mesh.userData.ovs.forEach(o => o.material.opacity = 0.45);
  const u = mesh.userData.unit, v = M.TYPES[u.type];
  info.innerHTML = `<h4>Квартира ${u.no} · ${v.rooms}-комнатная</h4><div class="big num">${UI.usd(u.price)}</div>
   <div class="small" style="color:#B9C4BB;margin-top:4px">${UI.nf(u.area, 1)} м² × ${UI.usd(u.pm2)}/м² · ≈ ${UI.nf(u.price * M.DEF.fx / 1e6, 1)} млн ₸</div>
   <table class="num"><tr><td>Тип</td><td>${v.name}</td></tr><tr><td>Этаж / подъезд</td><td>${u.floor} / ${u.section}</td></tr>
   <tr class="sum"><td>Общая площадь</td><td>${UI.nf(u.area, 1)} м²</td></tr></table>
   <div class="pplan" style="margin-top:10px;background:#FBF9F5;border-radius:10px;padding:4px;cursor:zoom-in">${window.SHEV_planSVG ? window.SHEV_planSVG(u.type) : ''}</div>
   <div class="seg" style="margin-top:10px"><button id="vcard">Подробнее</button><button id="vclose">Закрыть</button></div>`;
  info.classList.add('show');
  document.getElementById('vcard').onclick = () => window.SHEV_unitCard(u.no);
  document.getElementById('vclose').onclick = () => select(null);
}
let tw = null;
function flyTo(pos, target, ms = 1400){ tw = {t0: performance.now(), ms, p0: camera.position.clone(), q0: controls.target.clone(), p1: pos, q1: target}; }
const HOME = [new THREE.Vector3(-175, 125, 115), new THREE.Vector3(8, 6, 0)];
function goLevel(l){
  stopCinema(); level = l; controls.autoRotate = false; rotBtn.classList.remove('on'); apply();
  if (l === 'all') flyTo(...HOME.map(v => v.clone()));
  else if (isPark()) flyTo(new THREE.Vector3(-80, PK[l] + 90, 50), new THREE.Vector3(0, PK[l], 0));
  else flyTo(new THREE.Vector3(-85, LV[l] + 100, 55), new THREE.Vector3(0, LV[l], 0));
}

/* ---------- UI ---------- */
const FL = [['P2', '−2'], ['P1', '−1'], [1, '1'], ...M.FLOORS.map(f => [f, String(f)]), ['all', 'Весь дом']];
const fb = document.getElementById('vfloors');
fb.innerHTML = FL.map(f => `<button data-f="${f[0]}" class="${f[0] === 'all' ? 'wide' : ''}">${f[1]}</button>`).join('');
fb.onclick = e => { const b = e.target.closest('button'); if (!b) return; const v = b.dataset.f; goLevel(/^[\d.]+$/.test(v) ? +v : v); };
document.getElementById('vlegend').innerHTML = M.TYPE_KEYS.map(t => `<span><i style="background:${M.TYPES[t].color}"></i>${M.TYPES[t].rooms}-к · ${UI.nf(M.TYPES[t].total, 0)} м²</span>`).join('');
const rotBtn = document.getElementById('vrot');
setDragMode('pan'); setActive(false);
document.getElementById('vmode').onclick = e => { const b = e.target.closest('button'); if (b) setDragMode(b.dataset.k); };
if (gate) gate.onclick = () => { stopCinema(); setActive(true); };
document.getElementById('vdone').onclick = () => setActive(false);
new IntersectionObserver(es => es.forEach(e => { if (e.intersectionRatio < 0.25) setActive(false); }), {threshold: [0, 0.25, 0.5]}).observe(viewer);
function zoomBy(f){ stopCinema(); controls.autoRotate = false; rotBtn.classList.remove('on');
  const d = camera.position.clone().sub(controls.target), L = THREE.MathUtils.clamp(d.length() * f, controls.minDistance, controls.maxDistance);
  flyTo(controls.target.clone().add(d.setLength(L)), controls.target.clone(), 280); }
document.getElementById('vzin').onclick = () => zoomBy(0.62);
document.getElementById('vzout').onclick = () => zoomBy(1.6);
document.getElementById('vzhome').onclick = () => { stopCinema(); goLevel('all'); };
rotBtn.onclick = () => { controls.autoRotate = !controls.autoRotate; rotBtn.classList.toggle('on', controls.autoRotate); };
const fMats = {}, glassWarm = new THREE.MeshStandardMaterial();
const LIGHT = {
  day:   {el:42, az:205, turb:4, ray:1.2, exp:0.42, sun:3.0, sunC:0xfff3e2, hemi:0.8, em:0,   lamp:0,   bloom:0.12, env:true,  night:false},
  dusk:  {el:7, az:235, turb:6, ray:2.4, exp:0.26, sun:3.4, sunC:0xffa868, hemi:0.35, em:1.1, lamp:2.4, bloom:0.22, env:true, night:false},
  night: {el:-8, az:250, turb:2, ray:0.5, exp:0.75, sun:0.35, sunC:0x8aa4d0, hemi:0.22, em:0.75, lamp:3.0, bloom:0.55, env:false, night:true}
};
let lightKey = 'dusk';
function setLight(k){
  lightKey = k; const L = LIGHT[k];
  const phi = THREE.MathUtils.degToRad(90 - L.el), th = THREE.MathUtils.degToRad(L.az); sunDir.setFromSphericalCoords(1, phi, th);
  const u = sky.material.uniforms; u.sunPosition.value.copy(sunDir); u.turbidity.value = L.turb; u.rayleigh.value = L.ray; u.mieCoefficient.value = 0.006; u.mieDirectionalG.value = 0.82;
  sky.visible = !L.night; scene.background = L.night ? new THREE.Color(0x0b1420) : null; setPano(k);
  scene.fog = new THREE.Fog(L.night ? 0x0b1420 : (k==='dusk'?0xb98a72:0xcfdbe6), 600, 2400);
  const sp = L.night ? new THREE.Vector3(-0.4,0.8,-0.3) : sunDir.clone(); sp.y = Math.max(sp.y, 0.12);
  sun.position.copy(sp.multiplyScalar(300)); sun.intensity = L.sun; sun.color.setHex(L.sunC); hemi.intensity = L.hemi;
  renderer.toneMappingExposure = L.exp; scene.environment = L.env ? envTex : null;
  Object.values(fMats).forEach(m => m.emissiveIntensity = L.em);
  const PH = {day:1.7, dusk:1.9, night:1.15}[k]; photoMats.forEach(m => { const t = k==='night' ? m.userData.night : m.userData.day; if(m.emissiveMap !== t){ m.emissiveMap = t; m.needsUpdate = true; } m.emissiveIntensity = PH; }); glowM.emissiveIntensity = L.lamp; glassWarm.emissiveIntensity = L.em*0.8;
  bld.traverse(o => { if(o.userData.lamp) o.material.emissiveIntensity = L.lamp; });
  bloom.strength = L.bloom;
  document.querySelectorAll('#vlight button').forEach(b => b.classList.toggle('on', b.dataset.l === k));
}
document.getElementById('vlight').onclick = e => { const b = e.target.closest('button'); if(b) setLight(b.dataset.l); };

/* ---------- cinema ---------- */

/* ---------- кинооблёт ---------- */
const lb = document.getElementById('letterbox'), cineBtn = document.getElementById('vcine');
const P = (x, y, h) => new THREE.Vector3(wx(x), h, wz(y));
const camPath = new THREE.CatmullRomCurve3([P(-150, 160, 120), P(-60, 150, 40), P(-35, 120, 8), P(-30, 70, 6), P(-30, 20, 8), P(-25, -20, 25), P(30, -40, 45), P(80, 40, 50), P(75, 120, 60), P(20, 200, 70), P(-90, 190, 100),
  P(-60, 240, 62), P(60, 250, 56), P(135, 150, 66), P(135, 0, 60), P(40, -115, 55), P(-110, -70, 55), P(-155, 70, 75)], true);
const lookPath = new THREE.CatmullRomCurve3([P(12, 70, 6), P(6, 120, 12), P(0, 110, 12), P(0, 70, 10), P(0, 40, 10), P(10, 30, 10), P(20, 50, 10), P(30, 70, 10), P(20, 90, 10), P(12, 100, 10), P(12, 80, 6),
  P(11, 100, 22), P(11, 80, 24), P(11, 60, 22), P(11, 40, 24), P(11, 60, 22), P(11, 90, 24), P(11, 110, 22)], true);
let cine = null;
function startCinema(){ goLevelSilent('all'); cine = {t0: performance.now(), dur: 85000}; lb.classList.add('on'); cineBtn.classList.add('on'); window.__cineOn = true; controls.enabled = false; info.classList.remove('show'); if (lightKey === 'day') setLight('dusk'); }
function stopCinema(){ if (!cine) return; cine = null; lb.classList.remove('on'); cineBtn.classList.remove('on'); window.__cineOn = false; controls.enabled = v3active; controls.target.copy(lookPath.getPoint(0)); }
function goLevelSilent(l){ level = l; apply(); }
cineBtn.onclick = () => cine ? stopCinema() : startCinema();
canvas.addEventListener('wheel', stopCinema, {passive: true});

/* ---------- выбор ---------- */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let downAt = null;
function pickFrom(ev, arr){ const r = canvas.getBoundingClientRect(); ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera);
  const h = ray.intersectObjects(arr.filter(m => m.parent.visible), false)[0]; return h ? h.object : null; }
function tipAt(ev, html){ const r = viewer.getBoundingClientRect(); tip.innerHTML = html; tip.style.display = 'block'; tip.style.left = (ev.clientX - r.left + 14) + 'px'; tip.style.top = (ev.clientY - r.top + 14) + 'px'; }
canvas.addEventListener('pointermove', ev => {
  if (isPark()) { const o = pickFrom(ev, stallPicks); if (o) { const s = o.userData.stall; tipAt(ev, `<b>№ ${s.no}</b> · ${UI.nf(s.w, 2)} × ${UI.nf(s.l, 2)} м · ${CAT[PAK[s.no] || s.cat]}`); canvas.style.cursor = 'pointer'; } else { tip.style.display = 'none'; canvas.style.cursor = 'grab'; } return; }
  if (typeof level !== 'number' || level < 2) { tip.style.display = 'none'; return; }
  const o = pickFrom(ev, picks); if (o === hovered) { if (o) tipAt(ev, tip.innerHTML); return; }
  const sameSel = m => selected && m && m.userData.unit === selected.userData.unit;
  if (hovered && !sameSel(hovered)) hovered.userData.ovs.forEach(x => x.material.opacity = 0); hovered = o; canvas.style.cursor = o ? 'pointer' : 'grab';
  if (o) { if (!sameSel(o)) o.userData.ovs.forEach(x => x.material.opacity = 0.22); const u = o.userData.unit; tipAt(ev, `<b>${u.no}</b> · ${M.TYPES[u.type].rooms}-комн. · ${UI.nf(u.area, 1)} м² · ${UI.usd(u.price)}`); }
  else tip.style.display = 'none';
});
canvas.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; stopCinema(); controls.autoRotate = false; rotBtn.classList.remove('on'); });
canvas.addEventListener('pointerup', ev => { if (!downAt || Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) > 5) return;
  if (isPark()) { selStall(pickFrom(ev, stallPicks)); return; }
  if (typeof level === 'number' && level >= 2) { const o = pickFrom(ev, picks); select(o); if (o) { const wp = o.getWorldPosition(new THREE.Vector3()); flyTo(new THREE.Vector3(wp.x - 30, wp.y + 30, wp.z + 14), wp.clone(), 1200); } } });
canvas.addEventListener('pointerleave', () => tip.style.display = 'none');
window.SHEV3D = { focus(no){ const u = UNITS.find(x => x.no === no); if (!u) return; goLevel(u.floor); const m = picks.find(p => p.userData.unit.no === no); select(m);
    const wp = m.getWorldPosition(new THREE.Vector3()); flyTo(new THREE.Vector3(wp.x - 40, wp.y + 40, wp.z + 22), wp.clone()); },
  stall(no){ const b = stallPicks.find(p => p.userData.stall.no === no); if (!b) return; goLevel('P' + (-b.userData.stall.lv)); selStall(b);
    const wp = b.getWorldPosition(new THREE.Vector3()); flyTo(new THREE.Vector3(wp.x - 22, wp.y + 28, wp.z + 12), wp.clone()); } };

/* ---------- цикл ---------- */
camera.position.copy(HOME[0]); controls.target.copy(HOME[1]);
function resize(){ const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); camera.aspect = w / h; camera.fov = w / h < 0.75 ? 50 : (w / h < 1.1 ? 40 : 32); camera.updateProjectionMatrix(); }
new ResizeObserver(resize).observe(canvas); resize();
let running = false, autoCineDone = false;
new IntersectionObserver(es => { running = es[0].isIntersecting; if (running && !autoCineDone) { autoCineDone = true; setTimeout(() => { if (level === 'all' && !cine) startCinema(); }, 600); } }, {threshold: 0.35}).observe(viewer);
const ease = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
function loop(t){
  requestAnimationFrame(loop); if (!running) return;
  if (cine) { const k = Math.max(0, (t - cine.t0) / cine.dur); if (k >= 1) stopCinema(); else { camera.position.copy(camPath.getPoint(k)); controls.target.copy(lookPath.getPoint(k)); camera.lookAt(controls.target); } }
  else { if (tw) { const k = Math.min(1, (t - tw.t0) / tw.ms), e = ease(k); camera.position.lerpVectors(tw.p0, tw.p1, e); controls.target.lerpVectors(tw.q0, tw.q1, e); if (k >= 1) tw = null; } controls.update(); }
  composer.render();
}
setLight('dusk'); apply(); requestAnimationFrame(loop);
document.getElementById('vload')?.remove();
window.__shev3d = {scene, camera, renderer, startCinema, stopCinema, goLevel, setLight, wx, wz,
  shot(p, t, fov = 32){ stopCinema(); tw = null; camera.fov = fov; camera.updateProjectionMatrix(); camera.position.set(...p); controls.target.set(...t); controls.update(); camera.lookAt(controls.target); composer.render(); return renderer.domElement.toDataURL('image/jpeg', 0.92); },
  renderTop(ppm = 6){ const GX0 = -120, GX1 = 120, GZ0 = -120, GZ1 = 120, w = (GX1 - GX0) * ppm, h = (GZ1 - GZ0) * ppm, cam = new THREE.OrthographicCamera(GX0, GX1, -GZ0, -GZ1, 1, 1000);
    cam.position.set(0, 500, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    const old = renderer.getSize(new THREE.Vector2()); renderer.setPixelRatio(1); renderer.setSize(w, h, false); renderer.render(scene, cam);
    const url = renderer.domElement.toDataURL('image/jpeg', 0.86); renderer.setSize(old.x, old.y, false); resize(); return {url, GX0, GX1, GZ0, GZ1}; } };
