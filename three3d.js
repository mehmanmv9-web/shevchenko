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
const nbMat = new THREE.MeshStandardMaterial({color:0xE8E2D6, roughness:0.9});
const glowM = new THREE.MeshStandardMaterial({color:0xfff2d8, emissive:0xffc27a, emissiveIntensity:0});
const postM = new THREE.MeshStandardMaterial({color:0x1d1a16, metalness:0.6, roughness:0.5});
const deckMat = new THREE.MeshStandardMaterial({color:0xB48B5E, roughness:0.85});
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
const m4 = new THREE.Matrix4();

/* ---------- фото-фасады: подиум (1 этаж + антресоль) + 8 жилых ---------- */
const PODF = 0.233, UPF = (1 - PODF) / 8;
const facTex = {long: tex('img/fac-long.jpg'), short: tex('img/fac-short.jpg'), longNight: tex('img/fac-long-night.jpg'), shortNight: tex('img/fac-short-night.jpg')};
const photoMats = [];
function photoMat(side, f, rep = 1){
  const v0 = f === 1 ? 0 : f === 1.5 ? PODF * 3.9 / 7.0 : PODF + (f - 2) * UPF;
  const vh = f === 1 ? PODF * 3.9 / 7.0 : f === 1.5 ? PODF * 3.1 / 7.0 : UPF;
  const t = facTex[side].clone(), tn = facTex[side + 'Night'].clone();
  for (const x of [t, tn]) { x.wrapS = THREE.RepeatWrapping; x.repeat.set(rep, vh); x.offset.set(0, v0); x.needsUpdate = true; }
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
const planUV = (x, y) => [(G.Y1 - y) / (G.Y1 - G.Y0), 1 - x / G.D];
for (const s of G.sects) {
  const z = SECZ[s.n], ya = s.y0, yb = s.y0 + s.L, rep = 1;
  for (const f of SHELLS) {
    const grp = new THREE.Group(), yb0 = z + LV[f], h = FH(f);
    grp.add(quadV(wx(0), wz(yb), wx(0), wz(ya), yb0, h, photoMat('long', f, rep)));
    grp.add(quadV(wx(G.D), wz(ya), wx(G.D), wz(yb), yb0, h, photoMat('long', f, rep)));
    if (s.sgn > 0) grp.add(quadV(wx(0), wz(ya), wx(G.D), wz(ya), yb0, h, photoMat('short', f)));
    else grp.add(quadV(wx(G.D), wz(yb), wx(0), wz(yb), yb0, h, photoMat('short', f)));
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
  for (const [x0, x1, y0, y1] of [[0, G.D, ya, ya + 0.25], [0, G.D, yb - 0.25, yb], [0, 0.25, ya, yb], [G.D - 0.25, G.D, ya, yb]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 1.2, y1 - y0), stone); b.position.set(wx((x0 + x1) / 2), yr + 0.6, wz((y0 + y1) / 2)); roof.add(b); }
  roof.traverse(o => { if (o.isMesh) o.castShadow = true; });
  bld.add(roof); shells.push({o: roof, fl: 10});
}

/* ---------- планы этажей ---------- */
const planTex = {typ: tex('img/tex3-typ.jpg'), L1: tex('img/tex3-L1.jpg'), L2: tex('img/tex3-L2.jpg'), P1: tex('img/tex3-P1.jpg'), P2: tex('img/tex3-P2.jpg')};
const plates = {};
const pk = G.park, parkUV = (x, y) => [(pk.YN - y) / (pk.YN - pk.YS), 1 - x / pk.WUX];
function plate(key, texKey, hOf){
  const g = new THREE.Group();
  if (texKey[0] === 'P') g.add(floorQuad(0, pk.WUX, pk.YS, pk.YN, hOf(), new THREE.MeshBasicMaterial({map: planTex[texKey], toneMapped: false}), parkUV));
  else for (const s of G.sects) g.add(floorQuad(0, G.D, s.y0, s.y0 + s.L, hOf(s), new THREE.MeshBasicMaterial({map: planTex[texKey], toneMapped: false}), planUV));
  g.visible = false; scene.add(g); plates[key] = g; return g;
}
for (let f = 2; f <= 9; f++) plate(f, 'typ', s => LV[f] + 0.02);
plate(1, 'L1', s => 0.02); plate(1.5, 'L2', s => LV[1.5] + 0.02);
plate('P1', 'P1', () => PK.P1 + 0.02); plate('P2', 'P2', () => PK.P2 + 0.02);
const ovMat = c => new THREE.MeshBasicMaterial({color: c, transparent: true, opacity: 0, depthWrite: false});
for (const u of UNITS) {
  const idx = ((+u.no.split('-')[1]) - 1) % 4 + 1;
  const a = G.apts.find(q => q.sec === u.section && q.idx === idx); const ovs = [];
  for (const r of a.rects) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(r[1] - r[0], 1.2, r[3] - r[2]), ovMat(M.TYPES[u.type].color));
    box.position.set(wx((r[0] + r[1]) / 2), SECZ[u.section] + LV[u.floor] + 0.6, wz((r[2] + r[3]) / 2)); box.userData = {unit: u, ovs}; ovs.push(box); plates[u.floor].add(box); picks.push(box);
  }
}
const stallPicks = [];
for (const st of G.stalls) {
  const lv = 'P' + (-st.lv), r = st.r;
  const box = new THREE.Mesh(new THREE.BoxGeometry(r[1] - r[0] - 0.1, 1.4, r[3] - r[2] - 0.1), ovMat(st.cat === 'res' ? 0xB8955A : st.cat === 'com' ? 0x3D6FA8 : 0x2E8B7E));
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
const groundM = new THREE.Mesh(gr, new THREE.MeshStandardMaterial({color: 0xB9B3A6, roughness: 1})); groundM.receiveShadow = true; site.add(groundM);
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
  const pg = new THREE.Group(); for (let x = -1; x <= 22; x += 2.6) pg.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, yb - ya + 1), deckMat), wx(x), sy(ym) + 4.4, wz(ym)));
  for (const [x, y] of [[-1, ya - 0.4], [-1, yb + 0.4], [22, ya - 0.4], [22, yb + 0.4]]) pg.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.4, 0.3), deckMat), wx(x), sy(ym) + 2.2, wz(y)));
  site.add(pg);
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
function tree(x, y, big = 1, blossom = false){
  const t = new THREE.Group(); t.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 2.4 * big, 6), trunkMat), 0, 1.2 * big, 0));
  t.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(1.9 * big, 0), blossom ? blossomMat : leafMat), 0, 3.3 * big, 0));
  t.position.set(wx(x), sy(y), wz(y)); t.traverse(o => { if (o.isMesh) o.castShadow = true; }); site.add(t);
}
for (let y = -4; y < 158; y += 7) { tree(-3.0, y, 0.85); tree(-11.0, y + 3.5, 0.85, (y + 4) % 21 === 0); }
[[26.5, 30], [26.5, 50], [26.5, 72], [26.5, 96], [26.5, 118], [36, 30], [43, 30], [36, 46], [53, 47], [40, 58], [48, 66.5], [36, 85], [42, 99], [36, 112]].forEach(([x, y], i) => tree(x, y, 1.1, i % 3 === 0));
for (let y = 0; y < 160; y += 14) { site.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4, 6), postM), wx(-1.2), sy(y) + 2, wz(y)));
  const l = at(new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glowM), wx(-1.2), sy(y) + 4.1, wz(y)); l.userData.lamp = true; site.add(l); }
for (const nb of G.nb) { const sh = new THREE.Shape(nb.poly.map(([x, y]) => new THREE.Vector2(wx(x), -wz(y))));
  const g = new THREE.ExtrudeGeometry(sh, {depth: nb.h, bevelEnabled: false}); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, nbMat); m.position.y = sy(nb.poly.reduce((s, p) => s + p[1], 0) / nb.poly.length); m.castShadow = m.receiveShadow = true; site.add(m); }
[[-75, 20, 30, 90, 22], [-75, 120, 30, 50, 15], [70, 140, 30, 30, 26], [78, 40, 24, 50, 40], [10, 200, 70, 20, 18], [10, -55, 70, 20, 20], [-75, -40, 30, 40, 12]].forEach(([x, y, w, l, h]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), nbMat); m.position.set(wx(x), sy(y) + h / 2, wz(y)); m.castShadow = m.receiveShadow = true; site.add(m); });
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
  site.visible = !park; ghost.visible = park;
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
  info.innerHTML = `<h4>Паркинг ${lv}</h4><div class="big">${n} мест</div><p class="small" style="color:#B9C4BB;margin-top:6px">Всего ${G.stalls.length} мест на 2 уровнях — на 70 больше, чем в таблице (160): +$2.100.000. ${lv === -1 ? 'На −1 — торговый цоколь коммерции.' : ''} Нажмите на место — номер, размер, назначение.</p><div class="seg" style="margin-top:10px"><button id="vclose">Закрыть</button></div>`;
  info.classList.add('show'); document.getElementById('vclose').onclick = () => info.classList.remove('show');
}
const CAT = {res: 'жителям — по 2 на квартиру', guest: 'гостевое / МГН'};
function selStall(b, silent){
  if (selSt) selSt.material.opacity = 0; selSt = b;
  if (!b) return; b.material.opacity = 0.65; const st = b.userData.stall;
  info.innerHTML = `<h4>Машино-место № ${st.no}</h4><div class="big num">${st.cat === 'guest' ? 'гостевое' : UI.usd(30000)}</div>
  <table class="num"><tr><td>Уровень</td><td>${{'-1': '−1 · абс. 813,55', '-2': '−2 · абс. 810,25'}[st.lv]}</td></tr><tr><td>Размер места</td><td>${UI.nf(st.w, 2)} × ${UI.nf(st.l, 2)} м</td></tr>
  <tr><td>Норма РК (СП РК 3.03-105)</td><td>≥ 2,50 × 5,30 м</td></tr><tr><td>Назначение</td><td>${CAT[st.cat]}</td></tr><tr><td>Проезд</td><td>6,0 м, двусторонний</td></tr><tr><td>Высота в чистоте</td><td>не менее 2,6 м</td></tr></table>
  <div class="seg" style="margin-top:10px"><button id="vclose">Закрыть</button></div>`;
  info.classList.add('show'); document.getElementById('vclose').onclick = () => { info.classList.remove('show'); selStall(null); };
}
window.addEventListener('shevprice', () => { if (selected) { const m = selected; selected = null; select(m); } });
function select(mesh){
  if (selected) selected.userData.ovs.forEach(o => o.material.opacity = 0);
  selected = mesh;
  if (!mesh) { if (typeof level === 'number' && level >= 2) info.classList.remove('show'); return; }
  mesh.userData.ovs.forEach(o => o.material.opacity = 0.45);
  const u = mesh.userData.unit, v = M.TYPES[u.type], rr = (u.end && v.rEnd) ? v.rEnd : v.r;
  info.innerHTML = `<h4>Квартира ${u.no} · ${u.type}</h4><div class="big num">${UI.usd(u.price)}</div>
   <div class="small" style="color:#B9C4BB;margin-top:4px">${UI.nf(u.area, 1)} м² × ${UI.usd(u.pm2)}/м² · ≈ ${UI.nf(u.price * M.DEF.fx / 1e6, 1)} млн ₸</div>
   <table class="num"><tr><td>Тип</td><td>${v.name}</td></tr><tr><td>Этаж / подъезд</td><td>${u.floor} / ${u.section}</td></tr>
   ${rr.map(r => `<tr><td>${r[0]}</td><td>${UI.nf(r[1], 1)} м²</td></tr>`).join('')}<tr class="sum"><td>Общая площадь квартиры</td><td>${UI.nf(u.area, 1)} м²</td></tr></table>
   <img src="img/type-${u.type}.jpg" alt=""><div class="seg" style="margin-top:10px"><button id="vcard">Подробнее</button><button id="vclose">Закрыть</button></div>`;
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
document.getElementById('vlegend').innerHTML = M.TYPE_KEYS.map(t => `<span><i style="background:${M.TYPES[t].color}"></i>${t} · ${UI.nf(M.TYPES[t].total, 1)}</span>`).join('');
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
  sky.visible = !L.night; scene.background = L.night ? new THREE.Color(0x0b1420) : null;
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
const camPath = new THREE.CatmullRomCurve3([P(-150, 160, 120), P(-60, 150, 40), P(-35, 120, 8), P(-30, 70, 6), P(-30, 20, 8), P(-25, -20, 25), P(30, -40, 45), P(80, 40, 50), P(75, 120, 60), P(20, 200, 70), P(-90, 190, 100)], true);
const lookPath = new THREE.CatmullRomCurve3([P(12, 70, 6), P(6, 120, 12), P(0, 110, 12), P(0, 70, 10), P(0, 40, 10), P(10, 30, 10), P(20, 50, 10), P(30, 70, 10), P(20, 90, 10), P(12, 100, 10), P(12, 80, 6)], true);
let cine = null;
function startCinema(){ goLevelSilent('all'); cine = {t0: performance.now(), dur: 50000}; lb.classList.add('on'); cineBtn.classList.add('on'); window.__cineOn = true; controls.enabled = false; info.classList.remove('show'); if (lightKey === 'day') setLight('dusk'); }
function stopCinema(){ if (!cine) return; cine = null; lb.classList.remove('on'); cineBtn.classList.remove('on'); window.__cineOn = false; controls.enabled = v3active; controls.target.copy(lookPath.getPointAt(0)); }
function goLevelSilent(l){ level = l; apply(); }
cineBtn.onclick = () => cine ? stopCinema() : startCinema();
canvas.addEventListener('wheel', stopCinema, {passive: true});

/* ---------- выбор ---------- */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let downAt = null;
function pickFrom(ev, arr){ const r = canvas.getBoundingClientRect(); ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera);
  const h = ray.intersectObjects(arr.filter(m => m.parent.visible), false)[0]; return h ? h.object : null; }
function tipAt(ev, html){ const r = viewer.getBoundingClientRect(); tip.innerHTML = html; tip.style.display = 'block'; tip.style.left = (ev.clientX - r.left + 14) + 'px'; tip.style.top = (ev.clientY - r.top + 14) + 'px'; }
canvas.addEventListener('pointermove', ev => {
  if (isPark()) { const o = pickFrom(ev, stallPicks); if (o) { const s = o.userData.stall; tipAt(ev, `<b>№ ${s.no}</b> · ${UI.nf(s.w, 2)} × ${UI.nf(s.l, 2)} м · ${CAT[s.cat]}`); canvas.style.cursor = 'pointer'; } else { tip.style.display = 'none'; canvas.style.cursor = 'grab'; } return; }
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
  if (cine) { const k = Math.max(0, (t - cine.t0) / cine.dur); if (k >= 1) stopCinema(); else { camera.position.copy(camPath.getPointAt(k)); controls.target.copy(lookPath.getPointAt(k)); camera.lookAt(controls.target); } }
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
