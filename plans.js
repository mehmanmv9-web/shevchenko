/* Планировки квартир и типового этажа: концептуальные схемы с расстановкой мебели (векторные, из презентации планировочных решений) */
(function(){
const M=window.SHEV, PD=window.SHEV_PLANDATA||{};
const FF="'Cormorant Garamond',Georgia,serif";
let cv=null;
function measure(txt,fs,cls){ cv=cv||document.createElement('canvas').getContext('2d'); cv.font=(cls==='pn'?'700 ':'600 ')+fs+'px '+FF; const up=cls==='pn'?txt.toUpperCase():txt; return cv.measureText(up).width+(cls==='pn'?.12:.04)*fs*up.length; }
function fitSize(txt,fs,mw,cls){ const w=measure(txt,fs,cls); return w>mw?Math.max(5.5,fs*mw/w):fs; }
const D=(s,mul)=>s.replace(/<text class="(pn|pa|pm)" ([^>]*?)font-size="([\d.]+)" data-mw="([\d.]+)"([^>]*)>([^<]*)<\/text>/g,(m,c,a,fs,mw,b,t)=>{
  const f=+fs, g=+(f*(mul||1.2)).toFixed(2), n=fitSize(t.replace(/&amp;/g,'&'),g,+mw,c);
  return `<text class="${c}" ${a}font-size="${n.toFixed(2)}" data-fs="${g}" data-mw="${mw}"${b}>${t}</text>`; });
const CACHE={};
window.SHEV_planSVG=function(k){ const d=PD[k]; if(!d) return ''; return CACHE[k]||(CACHE[k]=D(d.svg).replace('<svg class="shplan"','<svg class="shplan" role="img" aria-label="Планировка квартиры с расстановкой мебели"')); };
window.SHEV_typicalFloor=function(){ const d=PD.typ; return d?(CACHE.typ||(CACHE.typ=D(d.svg,1.75).replace('<svg class="shplan"','<svg class="shplan" role="img" aria-label="Типовой этаж: 3 квартиры на площадке"'))):''; };
/* подгонка подписей после перевода интерфейса */
const refit=t=>{ if(!t.getAttribute||!t.getAttribute('data-fs')) return; const fs=+t.getAttribute('data-fs'), mw=+t.getAttribute('data-mw'), c=t.getAttribute('class'); const n=fitSize(t.textContent,fs,mw,c); t.setAttribute('font-size',n.toFixed(2)); };
new MutationObserver(ms=>{ const seen=new Set(); ms.forEach(m=>{ const el=m.target.nodeType===3?m.target.parentNode:m.target; if(el&&el.closest&&el.closest('svg.shplan')){ const t=el.closest('text'); if(t&&!seen.has(t)){ seen.add(t); refit(t);} } }); }).observe(document.documentElement,{subtree:true,characterData:true,childList:true});
const RANK={e:0,h:1,l:2,b:3,w:4,t:5};
window.SHEV_planOrder=function(k){ const d=PD[k]; if(!d) return []; const o=d.rooms.map((r,j)=>Object.assign({j},r)).filter(r=>r.t!=='o'&&r.i!=null).map(r=>({i:r.i,n:r.n,m:r.m,t:r.t,x:r.x,y:r.y}));
  const mas=r=>/Мастер-спальня/.test(r.n)?0:1; return o.sort((a,b)=>(RANK[a.t]-RANK[b.t])||(a.t==='b'?mas(a)-mas(b):0)||a.y-b.y||a.x-b.x); };
window.SHEV_planRooms=function(k){ const d=PD[k]; return d?d.rooms.map(r=>[r.n,r.m,r.t]):[]; };
window.SHEV_roomsTable=function(k){ const r=window.SHEV_planRooms(k); const tot=M.TYPES[k].total; const f=v=>v.toFixed(1).replace('.',',');
  return '<table class="rooms num">'+r.map(x=>`<tr><td>${x[0]}</td><td>${f(x[1])} м²</td></tr>`).join('')+`<tr class="sum"><td>Общая площадь квартиры</td><td>${f(tot)} м²</td></tr></table>`; };
window.SHEV_PLAN_NOTE='Концептуальная планировка с расстановкой мебели. Общая площадь включает стены и инженерные шахты; финальные решения — по проектной документации.';
})();

/* увеличение плана по нажатию */
document.addEventListener('click',e=>{ const sv=e.target.closest&&e.target.closest('svg.shplan'); if(!sv||e.target.closest('.shzoom')||e.target.closest('.tr2')) return;
  const o=document.createElement('div'); o.className='shzoom'; o.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(246,241,231,.97);overflow:auto;padding:18px;cursor:zoom-out';
  const c=sv.cloneNode(true); c.style.cssText='width:max(100%,1100px);height:auto;display:block;margin:0 auto;max-width:1700px;background:#FBF9F5;border-radius:12px'; o.appendChild(c);
  const x=document.createElement('button'); x.textContent='✕'; x.setAttribute('aria-label','Закрыть'); x.style.cssText='position:fixed;top:14px;right:18px;width:44px;height:44px;border-radius:50%;border:1px solid #A8864F;background:#fff;font-size:20px;cursor:pointer;z-index:2'; o.appendChild(x);
  o.onclick=()=>o.remove(); document.addEventListener('keydown',function k(ev){ if(ev.key==='Escape'){o.remove();document.removeEventListener('keydown',k);} }); document.body.appendChild(o); });
