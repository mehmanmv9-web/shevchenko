/* ШЕВЧЕНКО — карта участков (ПДП Ж5): превью в разделе «Расположение», по нажатию раскрывается на весь экран.
   Leaflet подгружается только когда блок подходит к экрану; если CDN недоступен — карта остаётся картинкой-заглушкой. */
(function(){
const card=document.getElementById('aksuCard'); if(!card) return;
const mapEl=document.getElementById('aksuMap'), ph=document.getElementById('aksuPh');
let map=null, started=false, big=false, parcels=null, topo=null, labelGroup=null, view='clean';
const LIBS=[['https://unpkg.com/leaflet@1.9.4/dist/','sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=','sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='],['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/']];
function loadScript(src,sri){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;if(sri){s.integrity=sri;s.crossOrigin=''}s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function loadCss(href,sri){const l=document.createElement('link');l.rel='stylesheet';l.href=href;if(sri){l.integrity=sri;l.crossOrigin=''}document.head.appendChild(l)}
function loadData(){return window.PARCEL_DATA?Promise.resolve():loadScript('aksu/data.js')}
async function loadLeaflet(){
  if(window.L&&L.map) return;
  for(const [base,jsSri,cssSri] of LIBS){ try{ loadCss(base+'leaflet.css',cssSri); await loadScript(base+'leaflet.js',jsSri); if(window.L&&L.map) return; }catch(e){} }
  throw new Error('leaflet');
}
function build(){
  const D=window.PARCEL_DATA;
  map=L.map(mapEl,{zoomControl:false,maxZoom:21,attributionControl:true,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false,tap:false});
  map.attributionControl.setPrefix(false);
  const sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:21,attribution:'© Esri, Maxar'});
  const lab=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:21,opacity:.9});
  const osm=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
  const carto=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'© OpenStreetMap, © CARTO'});
  L.layerGroup([sat,lab]).addTo(map);
  topo=L.imageOverlay('aksu/topo2019_overlay.png',D.overlayBounds,{opacity:.6,interactive:false});
  const s065={color:'#3f8a5c',weight:3.2,fillColor:'#3f8a5c',fillOpacity:.14}, sPk={color:'#e0a243',weight:3.2,fillColor:'#e0a243',fillOpacity:.2};
  const p065=L.polygon(D.parcel065,s065).bindPopup('<div class="aksu-pop"><h4>ПДП Ж5 · участок 0,65 га — ул. Амангельды, 78</h4><table><tr><td>Кадастровый №</td><td><b>20:311:016:133</b></td></tr><tr><td>Площадь</td><td>0,6500 га</td></tr><tr><td>Право</td><td>частная собственность</td></tr><tr><td>Документ</td><td>Кадастровый паспорт от 02.10.2023</td></tr></table></div>',{maxWidth:300});
  const pPk=L.polygon(D.parking,sPk).bindPopup('<div class="aksu-pop"><h4>Участок 0,2286 га</h4><table><tr><td>Кадастровый №</td><td><b>20:311:016:165</b></td></tr><tr><td>Площадь</td><td>0,2286 га</td></tr><tr><td>Право</td><td>аренда до 15.06.2062</td></tr><tr><td>Назначение</td><td>автопарковка</td></tr><tr><td>Документ</td><td>Гос. акт № 0006372</td></tr></table></div>',{maxWidth:300});
  p065.addTo(map);pPk.addTo(map);parcels=L.featureGroup([p065,pPk]);window.__aksu={map,p065,pPk};
  const aside=[D.label065[0]+0.0001,D.label065[1]-0.00068];
  labelGroup=L.layerGroup([L.polyline([aside,D.label065],{color:'#fff',weight:1.4,dashArray:'3 4',opacity:.9,interactive:false}),
    L.marker(aside,{icon:L.divIcon({className:'',html:'<div class="aksu-lbl">ПДП Ж5</div>',iconSize:[90,26],iconAnchor:[45,13]}),interactive:false})]).addTo(map);
  L.control.layers({'Спутник':L.layerGroup([sat,lab]),'Схема OSM':osm,'Светлая схема':carto},null,{position:'topright',collapsed:true}).addTo(map);
  map.zoomCtl=L.control.zoom({position:'bottomright',zoomInTitle:'+',zoomOutTitle:'−'});
  map.on('popupopen',()=>{ if(!big) map.closePopup(); });
  map.options.minZoom=2;
  fit(); card.classList.add('ready');
  document.getElementById('akClean').onclick=()=>setView('clean');
  document.getElementById('akTopo').onclick=()=>setView(view==='topo'?'clean':'topo');
  const op=document.getElementById('akOp');op.oninput=()=>{topo.setOpacity(op.value/100);document.getElementById('akOpV').textContent=op.value+'%'};
  document.getElementById('akFit').onclick=()=>fly(parcels,null,2.4);
  [p065,pPk].forEach(g=>g.on('click',e=>{ if(big){ L.DomEvent.stop(e); fly(g,g,2.4); } }));
  document.querySelectorAll('#aksuPanel [data-p]').forEach(b=>b.onclick=()=>{const t=b.dataset.p==='1'?p065:pPk;fly(t,t,2.4)});
}
let flyTok=0;
function fly(layer,pop,dur){ const t=++flyTok; map.closePopup(); map.flyToBounds(layer.getBounds().pad(layer===parcels?.45:.8),{duration:dur||3.4,easeLinearity:.18,maxZoom:19});
  if(pop) map.once('moveend',()=>{ if(t===flyTok&&big) pop.openPopup(); }); }
function fit(){ if(map&&parcels) map.fitBounds(parcels.getBounds().pad(big?.45:.4),{animate:false}); }
function setView(v){ view=v;
  document.getElementById('akClean').classList.toggle('on',v==='clean');document.getElementById('akTopo').classList.toggle('on',v==='topo');
  document.getElementById('akOpW').style.display=v==='topo'?'block':'none';
  if(map.hasLayer(topo)) map.removeLayer(topo);
  if(v==='topo'){topo.addTo(map);map.removeLayer(labelGroup)} else labelGroup.addTo(map);
}
function interact(on){ ['dragging','scrollWheelZoom','doubleClickZoom','boxZoom','keyboard','touchZoom'].forEach(k=>map[k]&&map[k][on?'enable':'disable']()); if(on){map.zoomCtl.addTo(map)}else{map.zoomCtl.remove();map.closePopup()} }
const home=card.parentNode, mark=document.createComment('aksu'); let back=null;
function open(){ if(big) return; big=true;
  home.insertBefore(mark,card); back=document.createElement('div'); back.className='aksu-back'; back.onclick=close; document.body.appendChild(back); document.body.appendChild(card);
  card.classList.add('fs'); document.documentElement.classList.add('aksu-lock'); requestAnimationFrame(()=>back.classList.add('on'));
  if(map){ const t=++flyTok; map.closePopup(); map.invalidateSize(false); interact(true); const c=parcels.getBounds().getCenter();
    setTimeout(()=>{ if(!big||t!==flyTok) return; map.invalidateSize(false); map.setView([18,c.lng],2,{animate:false});
      setTimeout(()=>{ if(big&&t===flyTok) fly(parcels,null,4.2); },1300); },260); }
}
function close(){ if(!big) return; big=false;
  card.classList.remove('fs'); document.documentElement.classList.remove('aksu-lock');
  if(mark.parentNode) mark.parentNode.insertBefore(card,mark); mark.remove(); if(back){back.remove();back=null}
  if(map){ flyTok++; map.stop(); interact(false); map.invalidateSize(false); fit(); }
}
card.addEventListener('click',e=>{ if(!big && !e.target.closest('.aksu-x')) { open(); e.preventDefault(); } });
card.addEventListener('keydown',e=>{ if(!big&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open()} });
document.getElementById('aksuX').onclick=e=>{e.stopPropagation();close()};
addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
new ResizeObserver(()=>{ if(map){ map.invalidateSize(false); if(!big) fit(); } }).observe(mapEl);
async function start(){ if(started) return; started=true;
  try{ await loadData(); await loadLeaflet(); build(); }catch(e){ card.classList.add('failed'); started=false; }
}
if('IntersectionObserver' in window){ new IntersectionObserver((es,o)=>{ if(es.some(x=>x.isIntersecting)){ o.disconnect(); start(); } },{rootMargin:'400px'}).observe(card); } else start();
card.addEventListener('pointerenter',start,{once:true});
card.addEventListener('click',()=>{ if(!started) start(); });
})();
