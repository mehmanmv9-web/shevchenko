/* ШЕВЧЕНКО — карта участка: схема квартала из 3D-модели + ссылки на Google / Яндекс / 2GIS */
(function(){
const LAT = 43.24622, LON = 76.93258;             // центр участка (ул. Амангельды, 78 — угол Шевченко)
const PC = {x:10.0, z:0.5};                        // центр участка в координатах 3D-сцены, м
const M_LAT = 111132, M_LON = 111320*Math.cos(LAT*Math.PI/180);
const geo = (x,z) => [LAT - (z-PC.z)/M_LAT, LON + (x-PC.x)/M_LON];
const IMG = {x0:-120, x1:120, z0:-120, z1:120};    // границы рендера img/site-top.jpg
const PLOT = [[-24.17, -85.93], [18.86, -85.2], [18.6, -76.83], [18.6, -76.83], [18.51, -69.53], [18.37, -58.87], [27.19, -40.79], [30.54, -30.32], [32.65, 4.24], [43.86, 4.08], [44.07, 40.77], [37.07, 41.04], [36.98, 52.96], [22.61, 53.07], [22.69, 76.04], [17.84, 76.1], [-6.49, 76.38], [-12.0, 76.45], [-12.0, 85.55], [-23.43, 85.55]];  // участки 20-311-016-133 + 165 по кадастру и топосъёмке (v3)
const LINKS = {
  google: `https://www.google.com/maps/place/${LAT},${LON}/@${LAT},${LON},18z`,
  yandex: `https://yandex.kz/maps/162/almaty/?ll=${LON}%2C${LAT}&z=18&pt=${LON}%2C${LAT}%2Cpm2rdl`,
  '2gis': `https://2gis.kz/almaty/geo/${LON}%2C${LAT}?m=${LON}%2C${LAT}%2F18`,
  apple: `https://maps.apple.com/?ll=${LAT},${LON}&q=${encodeURIComponent('ШЕВЧЕНКО · ул. Амангельды, 78')}&z=18&t=h`
};
const EMBED = {
  google: `https://maps.google.com/maps?q=${LAT},${LON}&z=18&t=k&output=embed`,
  yandex: `https://yandex.kz/map-widget/v1/?ll=${LON}%2C${LAT}&z=18&pt=${LON}%2C${LAT}%2Cpm2rdl`,
  '2gis': `https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(JSON.stringify({pos:{lat:LAT,lon:LON,zoom:18},opt:{city:'almaty'},org:''}))}`
};
const NAMES = {google:'Google Maps', yandex:'Яндекс Карты', '2gis':'2GIS', apple:'Apple Maps'};
// встраивать чужие карты можно только на собственном домене сайта
const canEmbed = !/(claude\.ai|claudeusercontent|anthropic|localhost|127\.0\.0\.1|^$)/.test(location.hostname);

const view = document.getElementById('mapview'); if(!view) return;
document.getElementById('mcoord').textContent = `${LAT.toFixed(5)}, ${LON.toFixed(5)}`;
document.getElementById('mapbtns').innerHTML =
  `<a class="g" href="${LINKS.google}" target="_blank" rel="noopener"><i>G</i>Открыть в Google Maps</a>`+
  `<a class="y" href="${LINKS.yandex}" target="_blank" rel="noopener"><i>Я</i>Открыть в Яндекс Картах</a>`+
  `<a class="d" href="${LINKS['2gis']}" target="_blank" rel="noopener"><i>2</i>Открыть в 2GIS</a>`+
  `<a class="a" href="${LINKS.apple}" target="_blank" rel="noopener"><i></i>Открыть в Apple Maps</a>`;

// ---- схема: окрестные улицы (м), центр сцены 3D = (0,0); север вверх
const ST = [ // [x0,z0,x1,z1,width,name]
  [-36,-900,-36,900,22,'ул. Амангельды'], [-900,-93,900,-93,18,'ул. Жамбыла'], [-900,97,900,97,18,'ул. Шевченко']];
const svgNS = 'http://www.w3.org/2000/svg', el = (t,a,p) => { const e = document.createElementNS(svgNS,t); for(const k in a) e.setAttribute(k,a[k]); if(p) p.appendChild(e); return e; };
const svg = el('svg',{xmlns:svgNS}); view.appendChild(svg);
const defs = el('defs',{},svg);
const pat = el('pattern',{id:'blk',width:40,height:40,patternUnits:'userSpaceOnUse'},defs); el('rect',{width:40,height:40,fill:'#e7e1d3'},pat); el('rect',{x:4,y:4,width:14,height:20,fill:'#d6cdb9'},pat); el('rect',{x:22,y:8,width:14,height:26,fill:'#d9d0bd'},pat);
el('rect',{x:-1000,y:-1000,width:2000,height:2000,fill:'url(#blk)'},svg);
const gStreet = el('g',{},svg);
ST.forEach(s => { el('line',{x1:s[0],y1:s[1],x2:s[2],y2:s[3],stroke:'#fbfaf6','stroke-width':s[4]+8},gStreet); });
ST.forEach(s => { el('line',{x1:s[0],y1:s[1],x2:s[2],y2:s[3],stroke:'#9aa0a3','stroke-width':s[4]},gStreet); });
el('image',{href:'img/site-top.jpg',x:IMG.x0,y:IMG.z0,width:IMG.x1-IMG.x0,height:IMG.z1-IMG.z0,preserveAspectRatio:'none'},svg);
el('rect',{x:IMG.x0,y:IMG.z0,width:IMG.x1-IMG.x0,height:IMG.z1-IMG.z0,fill:'none',stroke:'rgba(255,255,255,.7)','stroke-width':1.5},svg);
const pts = PLOT.map(p=>p.join(',')).join(' ');
el('polygon',{points:pts,fill:'rgba(227,200,148,.22)',stroke:'none'},svg);
el('polygon',{points:pts,fill:'none',stroke:'#E3C894','stroke-width':3.2,'stroke-dasharray':'7 4',class:'plot'},svg);
const labels = el('g',{'font-family':'Manrope,Inter,system-ui,sans-serif','font-weight':700},svg);
const L = []; // [x,z,text,kind,rot]
L.push([-36,-40,'ул. Амангельды','st',-90],[60,-93,'ул. Жамбыла','st',0],[60,97,'ул. Шевченко','st',0]);
L.push([0,-41.6,'Подъезд 1','b',0],[0,0,'Подъезд 2','b',0],[0,41.6,'Подъезд 3','b',0],[30,16,'Двор-сад','p',0]);
const pin = el('g',{},svg);
function drawLabels(){
  const k = vb[2]/60; labels.innerHTML = '';
  L.forEach(([x,z,t,kind,rot]) => { const fs = kind==='st' ? k*1.05 : k*1.3;
    if(kind==='st' && vb[2] > 700) return;
    const tx = el('text',{x,y:z,'font-size':fs,'text-anchor':'middle','dominant-baseline':'middle',fill:kind==='st'?'#2f3a35':'#fff',stroke:kind==='st'?'#fbfaf6':'rgba(20,30,25,.85)','stroke-width':fs*0.28,'paint-order':'stroke',transform:rot?`rotate(${rot} ${x} ${z})`:''},labels); tx.textContent = t; });
  pin.innerHTML = ''; const s = k*0.9, cx = PC.x, cz = -62 - s*0.2;
  el('path',{d:`M${cx} ${cz} c ${-s*1.4} ${-s*1.6} ${-s*1.9} ${-s*2.6} ${-s*1.9} ${-s*3.6} a ${s*1.9} ${s*1.9} 0 1 1 ${s*3.8} 0 c 0 ${s} ${-s*0.5} ${s*2} ${-s*1.9} ${s*3.6} z`,fill:'#A8864F',stroke:'#fff','stroke-width':s*0.25},pin);
  el('circle',{cx,cy:cz-s*3.6,r:s*0.75,fill:'#fff'},pin);
  const tt = el('text',{x:cx,y:cz-s*6.4,'font-size':k*1.25,'text-anchor':'middle',fill:'#1F3A2E',stroke:'#fff','stroke-width':k*0.4,'paint-order':'stroke','font-weight':800,'font-family':'Manrope,Inter,sans-serif'},pin); tt.textContent = 'ШЕВЧЕНКО · участок';
  // масштабная линейка и север
  const sb = [10,20,50,100,200,500].find(v => v > vb[2]/9) || 500, bx = vb[0]+vb[2]*0.04, by = vb[1]+vb[3]*0.95;
  el('rect',{x:bx-k*0.4,y:by-k*1.6,width:sb+k*0.8,height:k*2.3,fill:'rgba(255,255,255,.85)',rx:k*0.3},labels);
  el('line',{x1:bx,y1:by,x2:bx+sb,y2:by,stroke:'#1F3A2E','stroke-width':k*0.25},labels);
  const st = el('text',{x:bx+sb/2,y:by-k*0.45,'font-size':k*0.9,'text-anchor':'middle',fill:'#1F3A2E'},labels); st.textContent = sb+' м';
  const nx = vb[0]+vb[2]*0.95, ny = vb[1]+vb[3]*0.1; el('circle',{cx:nx,cy:ny,r:k*1.6,fill:'rgba(255,255,255,.9)'},labels);
  el('path',{d:`M${nx} ${ny-k*1.2} L${nx+k*0.6} ${ny+k*0.6} L${nx} ${ny+k*0.2} L${nx-k*0.6} ${ny+k*0.6} z`,fill:'#A8864F'},labels);
  const nt = el('text',{x:nx,y:ny+k*1.25,'font-size':k*0.7,'text-anchor':'middle',fill:'#1F3A2E'},labels); nt.textContent = 'N';
}
// ---- zoom / pan
const HOMEVB = [-175,-150,330,0]; let vb;
function fit(){ const r = view.getBoundingClientRect(), ar = r.height/Math.max(1,r.width); vb = [HOMEVB[0], HOMEVB[1], HOMEVB[2], HOMEVB[2]*ar]; const need = 260; if(vb[3] < need){ const w = need/ar; vb = [-25.5-w/2, -130, w, need]; } else vb[1] = -5 - vb[3]/2; apply(); }
function apply(){ svg.setAttribute('viewBox', vb.join(' ')); drawLabels(); }
function zoom(f, cx, cy){ const r = view.getBoundingClientRect(); const px = cx==null ? 0.5 : (cx-r.left)/r.width, py = cy==null ? 0.5 : (cy-r.top)/r.height;
  const nw = Math.min(1600, Math.max(40, vb[2]*f)), nh = nw*vb[3]/vb[2]; const wx = vb[0]+px*vb[2], wy = vb[1]+py*vb[3]; vb = [wx-px*nw, wy-py*nh, nw, nh]; apply(); }
let active=false; const box=document.getElementById('mapbox'), mg=document.getElementById('mgate');
function setActive(on){ active=on; box.classList.toggle('active',on); mg.classList.toggle('hide',on); }
mg.onclick=()=>setActive(true); document.getElementById('mdone').onclick=()=>setActive(false);
new IntersectionObserver(es=>es.forEach(e=>{ if(e.intersectionRatio<0.25) setActive(false); }),{threshold:[0,0.25,0.5]}).observe(box);
view.addEventListener('wheel', e => { if(!active) return; e.preventDefault(); zoom(Math.exp(e.deltaY*0.0015), e.clientX, e.clientY); }, {passive:false});
const ptrs = new Map(); let last = null, pinch = null;
view.addEventListener('pointerdown', e => { if(!active) return; view.setPointerCapture(e.pointerId); ptrs.set(e.pointerId,[e.clientX,e.clientY]); view.classList.add('drag'); last = [e.clientX,e.clientY]; if(ptrs.size===2){ const [a,b] = [...ptrs.values()]; pinch = Math.hypot(a[0]-b[0],a[1]-b[1]); } });
view.addEventListener('pointermove', e => { if(!active||!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===2){ const [a,b] = [...ptrs.values()], d = Math.hypot(a[0]-b[0],a[1]-b[1]); if(pinch){ zoom(pinch/d,(a[0]+b[0])/2,(a[1]+b[1])/2); } pinch = d; return; }
  const r = view.getBoundingClientRect(), dx = (e.clientX-last[0])/r.width*vb[2], dy = (e.clientY-last[1])/r.height*vb[3]; vb[0]-=dx; vb[1]-=dy; last = [e.clientX,e.clientY]; apply(); });
const up = e => { ptrs.delete(e.pointerId); if(ptrs.size<2) pinch = null; if(!ptrs.size) view.classList.remove('drag'); else last = [...ptrs.values()][0]; };
view.addEventListener('pointerup', up); view.addEventListener('pointercancel', up);
function zoomAnim(f){ const n=9, step=Math.pow(f,1/n); let i=0; const tick=()=>{ zoom(step); if(++i<n) requestAnimationFrame(tick); }; tick(); }
document.getElementById('mzin').onclick = () => zoomAnim(0.6); document.getElementById('mzout').onclick = () => zoomAnim(1/0.6); document.getElementById('mzreset').onclick = fit;
new ResizeObserver(() => { if(vb){ const r = view.getBoundingClientRect(); vb[3] = vb[2]*r.height/Math.max(1,r.width); apply(); } }).observe(view);
fit();
// ---- вкладки карт
const ext = document.getElementById('mapext');
document.getElementById('maptabs').onclick = e => { const b = e.target.closest('button'); if(!b) return;
  document.querySelectorAll('#maptabs button').forEach(x => x.classList.toggle('on', x===b)); const m = b.dataset.m;
  if(m==='plan'){ ext.classList.remove('show'); ext.innerHTML = ''; return; }
  ext.classList.add('show');
  if(canEmbed && EMBED[m]){ ext.innerHTML = `<iframe src="${EMBED[m]}" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`; return; }
  ext.innerHTML = `<div class="card"><h4>${NAMES[m]}</h4><p>Откроется в новой вкладке — участок уже отмечен, масштаб — квартал.</p>
    <div class="mapbtns"><a class="${({google:'g',yandex:'y','2gis':'d',apple:'a'})[m]}" href="${LINKS[m]}" target="_blank" rel="noopener"><i>${({google:'G',yandex:'Я','2gis':'2',apple:''})[m]}</i>Открыть ${NAMES[m]}</a></div>
    <p class="small" style="margin:14px 0 0"><a href="#" id="mback">← Вернуться к схеме квартала</a></p></div>`;
  document.getElementById('mback').onclick = ev => { ev.preventDefault(); document.querySelector('#maptabs button[data-m="plan"]').click(); };
};
window.__shevMap = {geo, LINKS};
})();
