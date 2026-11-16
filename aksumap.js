/* ШЕВЧЕНКО — карта участков (ПДП Ж5): превью в разделе «Расположение», по нажатию раскрывается на весь экран.
   Leaflet подгружается только когда блок подходит к экрану; если CDN недоступен — карта остаётся картинкой-заглушкой. */
(function(){
const card=document.getElementById('aksuCard'); if(!card) return;
const mapEl=document.getElementById('aksuMap'), ph=document.getElementById('aksuPh');
const INFO={
 p1:{t:'ПДП Ж5 · участок 0,656 га — ул. Амангельды, 78',h:'<p class="src" style="margin:0 0 8px">Кадастровый паспорт объекта недвижимости (земельный участок), составлен по состоянию на 02.10.2023, заказ № 002248211479</p><table class="doc"><tr><td>Адрес</td><td>г. Алматы, Алмалинский район, ул. Амангельды, д. 78</td></tr><tr><td>Регистрационный код адреса</td><td>0201300117981009</td></tr><tr><td>Кадастровый номер</td><td><b>20:311:016:133</b></td></tr><tr><td>Номер кадастрового дела</td><td>2000/290712</td></tr><tr><td>Форма собственности</td><td>частная; вид права — частная собственность</td></tr><tr><td>Площадь</td><td><b>0,6560 га</b></td></tr><tr><td>Категория земель</td><td>земли населённых пунктов</td></tr><tr><td>Целевое назначение</td><td>бизнес-центр, многоквартирный (многоэтажный) жилой комплекс с коммерческими помещениями</td></tr><tr><td>Функциональная зона</td><td>в паспорте не указана</td></tr><tr><td>Ограничения и обременения</td><td>обеспечить беспрепятственный доступ на участок эксплуатирующим службам и предприятиям для технического обслуживания и ремонта инженерных сетей</td></tr><tr><td>Делимость</td><td>неделимый</td></tr></table>'},
 p2:{t:'Участок 0,2286 га — аренда, автопарковка',h:'<p class="src" style="margin:0 0 8px">Акт на право временного возмездного (долгосрочного) землепользования (аренды) № 0006372</p><table class="doc"><tr><td>Кадастровый номер</td><td><b>20-311-016-165</b></td></tr><tr><td>Право</td><td>временное возмездное землепользование (аренда) на срок до 15 июня 2062 года</td></tr><tr><td>Площадь</td><td><b>0,2286 га</b></td></tr><tr><td>Категория земель</td><td>земли населённых пунктов (городов, посёлков и сельских населённых пунктов)</td></tr><tr><td>Целевое назначение</td><td>для эксплуатации и обслуживания автопарковки</td></tr><tr><td>Адрес</td><td>южнее ул. Жамбыла, восточнее ул. Амангельды, Алмалинский район</td></tr><tr><td>Ограничения и обременения</td><td>обеспечить беспрепятственный доступ на участок эксплуатирующим службам и предприятиям для технического обслуживания и ремонта инженерных сетей; соблюдать режим использования земель в охранной зоне сетей телекоммуникаций АО «Казахтелеком»; без права отчуждения до выкупа у государства права временного возмездного долгосрочного землепользования</td></tr><tr><td>Делимость</td><td>неделимый</td></tr><tr><td>Смежные участки</td><td>с одной стороны — улица; с другой — земли населённых пунктов и участок 20-311-016-133</td></tr></table>'},
 pdp:{t:'ПДП Ж5 — что это значит',h:'<p>По закону ПДП — градостроительный проект для отдельных частей территорий и функциональных зон населённых пунктов (Правила разработки градостроительных проектов, РК). Он определяет, что и как можно строить на каждом участке: назначение земли, красные линии улиц, этажность, инженерные сети.</p><p>Ж5 — код зоны в ПДП Алматы: жилая многоэтажная застройка 6–12 этажей. Наш дом в 9 этажей укладывается в эту зону.</p><p class="src">Источники: Правила разработки градостроительных проектов (РК); Алматыгенплан.</p>'}};
const dlg=document.getElementById('aksuDlg'); let dlgAt=0;
let pend=null;
function showInfo(k){ const i=INFO[k]; if(!i) return; pend=null; dlg.dataset.k=k; dlg.querySelector('h4').textContent=i.t; dlg.querySelector('.aksu-db').innerHTML=i.h; dlg.hidden=false; dlgAt=Date.now(); }
function hideInfo(){ pend=null; if(dlg.hidden) return false; dlg.hidden=true; dlg.dataset.k=''; return true; }
dlg.querySelector('.aksu-dx').onclick=e=>{ e.stopPropagation(); hideInfo(); };
dlg.addEventListener('click',e=>e.stopPropagation());
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
  const p065=L.polygon(D.parcel065,s065);
  const pPk=L.polygon(D.parking,sPk);
  p065.addTo(map);pPk.addTo(map);parcels=L.featureGroup([p065,pPk]);window.__aksu={map,p065,pPk};
  const aside=[D.label065[0]+0.0001,D.label065[1]-0.00068]; window.__aksuLbl=aside;
  labelGroup=L.layerGroup([L.polyline([aside,D.label065],{color:'#fff',weight:1.4,dashArray:'3 4',opacity:.9,interactive:false}),
    L.marker(aside,{icon:L.divIcon({className:'aksu-lblw',html:'<div class="aksu-lbl">ПДП Ж5<b>?</b></div>',iconSize:[0,0],iconAnchor:[0,0]}),keyboard:false,riseOnHover:true}).on('click',e=>{ L.DomEvent.stop(e); if(!big) return; if(!dlg.hidden&&dlg.dataset.k==='pdp'){ ++flyTok; hideInfo(); } else { ++flyTok; map.stop(); showInfo('pdp'); } })]).addTo(map);
  L.control.layers({'Спутник':L.layerGroup([sat,lab]),'Схема OSM':osm,'Светлая схема':carto},null,{position:'topright',collapsed:true}).addTo(map);
  map.zoomCtl=L.control.zoom({position:'bottomright',zoomInTitle:'+',zoomOutTitle:'−'});
  map.on('click',()=>{ if(Date.now()-dlgAt>250) hideInfo(); });
  map.options.minZoom=2;
  const dot=L.marker(parcels.getBounds().getCenter(),{icon:L.divIcon({className:'',html:'<div class="aksu-dot"><i></i></div>',iconSize:[28,28],iconAnchor:[14,14]}),keyboard:false}).addTo(map);
  dot.on('click',e=>{ L.DomEvent.stop(e); fly(parcels,null,4.2); });
  const sd=()=>{ const el=dot.getElement(); if(el) el.style.display=map.getZoom()<9?'':'none'; }; map.on('zoomend',sd); sd();
  fit(); card.classList.add('ready');
  document.getElementById('akClean').onclick=()=>setView('clean');
  document.getElementById('akTopo').onclick=()=>setView(view==='topo'?'clean':'topo');
  const op=document.getElementById('akOp');op.oninput=()=>{topo.setOpacity(op.value/100);document.getElementById('akOpV').textContent=op.value+'%'};
  document.getElementById('akFit').onclick=()=>fly(parcels,null,2.4);
  [p065,pPk].forEach(g=>g.on('click',e=>{ if(big){ L.DomEvent.stop(e); fly(g,g===p065?'p1':'p2',2.4); } }));
  document.querySelectorAll('#aksuPanel [data-p]').forEach(b=>b.onclick=()=>{if(b.dataset.p==='pdp'){ fly(parcels,'pdp',2.8); return; } const t=b.dataset.p==='1'?p065:pPk;fly(t,b.dataset.p==='1'?'p1':'p2',2.4)});
}
let flyTok=0;
function fly(layer,pop,dur){
  // повторное нажатие на ту же кнопку: окно открыто (или ещё «едет») — закрываем, и ничего не двигаем; следующее нажатие откроет снова
  if(pop && ((!dlg.hidden && dlg.dataset.k===pop) || pend===pop)){ ++flyTok; hideInfo(); return; }
  const t=++flyTok; map.closePopup(); hideInfo(); map.stop(); pend=pop||null;
  const bd=layer.getBounds().pad(layer===parcels?.45:.8), tz=Math.min(19,map.getBoundsZoom(bd)), tc=bd.getCenter();
  const cz=map.getZoom(), sz=map.getSize(), off=map.project(tc,cz).subtract(map.project(map.getCenter(),cz));
  let ms=0;
  if(Math.abs(off.x)<2 && Math.abs(off.y)<2 && Math.abs(tz-cz)<0.05){ ms=0; }               // уже там — просто показать окно
  else if(cz>=14 && Math.abs(tz-cz)<=2.5 && Math.abs(off.x)<sz.x*1.5 && Math.abs(off.y)<sz.y*1.5){ map.setView(tc,tz,{animate:true,duration:1.3,easeLinearity:.3,noMoveStart:true}); ms=1300; }
  else { const d=dur||3.4; map.flyTo(tc,tz,{duration:d,easeLinearity:.18}); ms=d*1000; }
  // окно открываем по таймеру, а не по moveend: если двигаться некуда, moveend не приходит
  if(pop) setTimeout(()=>{ if(t===flyTok&&big) showInfo(pop); },ms+(ms?220:40)); }
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
  if(map){ const t=++flyTok; map.closePopup();hideInfo(); map.invalidateSize(false); interact(true); const c=parcels.getBounds().getCenter();
    setTimeout(()=>{ if(!big||t!==flyTok) return; map.invalidateSize(false); map.setView([18,c.lng],2,{animate:false});
    },260); }
}
function close(){ if(!big) return; big=false;
  card.classList.remove('fs'); hideInfo(); document.documentElement.classList.remove('aksu-lock');
  if(mark.parentNode) mark.parentNode.insertBefore(card,mark); mark.remove(); if(back){back.remove();back=null}
  if(map){ flyTok++; map.stop(); interact(false); map.invalidateSize(false); fit(); }
}
card.addEventListener('click',e=>{ if(!big && !e.target.closest('.aksu-x')) { open(); e.preventDefault(); } });
card.addEventListener('keydown',e=>{ if(!big&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open()} });
document.getElementById('aksuX').onclick=e=>{e.stopPropagation();close()};
addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(!hideInfo()) close(); } });
let focus=false;
new ResizeObserver(()=>{ if(map){ map.invalidateSize(false); if(!big&&!focus) fit(); } }).observe(mapEl);
const pb=document.getElementById('pdpBtn'), pf=document.getElementById('pdpFull');
if(pb){ pb.onclick=()=>{ const on=pf.hidden; pf.hidden=!on; pb.setAttribute('aria-expanded',on); pb.classList.toggle('on',on); focus=on;
    if(map&&!big){ if(on) map.flyTo(window.__aksuLbl,18,{duration:2.6,easeLinearity:.2}); else map.flyToBounds(parcels.getBounds().pad(.4),{duration:1.6}); } };
  document.getElementById('pdpShow').onclick=()=>{ focus=false; open(); setTimeout(()=>{ if(big) fly(parcels,'pdp',3.8); },1100); }; }
async function start(){ if(started) return; started=true;
  try{ await loadData(); await loadLeaflet(); build(); }catch(e){ card.classList.add('failed'); started=false; }
}
if('IntersectionObserver' in window){ new IntersectionObserver((es,o)=>{ if(es.some(x=>x.isIntersecting)){ o.disconnect(); start(); } },{rootMargin:'400px'}).observe(card); } else start();
card.addEventListener('pointerenter',start,{once:true});
card.addEventListener('click',()=>{ if(!started) start(); });
})();
