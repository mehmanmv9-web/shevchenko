(function(){
const M=window.SHEV, T=M.TYPES, K=M.TYPE_KEYS;
const $=s=>document.querySelector(s)||document.createElement('div');
const nf=(x,d=0)=>x.toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d}).replace(/\u00a0/g,'\u202f');
const usd=(x,d=0)=>{const r=Math.round(x*Math.pow(10,d))/Math.pow(10,d); return (r<0?'−$':'$')+nf(Math.abs(r),d);};
const mln=(x,d=2)=>{const r=Math.round(x/1e6*Math.pow(10,d))/Math.pow(10,d); return (r<0?'−$':'$')+nf(Math.abs(r),d)+' млн';};
const m2=(x,d=1)=>nf(x,d)+' м²';
const pct=(x,d=1)=>nf(x*100,d)+'%';
const U=M.units();
window.SHEV_UI={nf,usd,mln,m2,U};

/* ---------- nav / reveal / modal ---------- */
const nav=$('#nav'); const onS=()=>nav.classList.toggle('solid',scrollY>window.innerHeight*0.6); addEventListener('scroll',onS); onS();
const modal=$('#modal'), mbody=$('#mbody');
function openModal(html){mbody.innerHTML=html; modal.classList.add('show');}
$('#mx').onclick=()=>modal.classList.remove('show');
modal.addEventListener('click',e=>{if(e.target===modal) modal.classList.remove('show');});
addEventListener('keydown',e=>{if(e.key==='Escape') modal.classList.remove('show');});
/* smooth photo zoom (FLIP) */
const lbx=document.createElement('div'); lbx.className='lbx'; lbx.innerHTML='<div class="lbx-bg"></div><img alt=""><button class="lbx-x" aria-label="Закрыть">×</button><div class="lbx-cap"></div>'; document.body.appendChild(lbx);
const lbImg=lbx.querySelector('img'), lbCap=lbx.querySelector('.lbx-cap'); let lbSrc=null, lbTok=0, lbY=0;
function lbOpen(el){
  if(lbSrc&&lbSrc!==el){ lbSrc.style.visibility=''; }
  const tok=++lbTok; lbY=scrollY; lbx.classList.remove('in');
  lbSrc=el; const r=el.getBoundingClientRect(); lbImg.src=el.currentSrc||el.src; lbCap.textContent=el.alt||''; lbImg.style.mixBlendMode='normal'; lbImg.style.filter='none'; lbImg.style.opacity='1'; lbImg.style.background=/img\/(plan|type|var|ep|tex)/.test(lbImg.src)?'#F6F1E7':'';
  let started=false; const go=()=>{ if(tok!==lbTok||lbSrc!==el||started) return; started=true; const vw=innerWidth*0.9, vh=innerHeight*0.86, ar=lbImg.naturalWidth/lbImg.naturalHeight||r.width/r.height;
    let w=vw, h=w/ar; if(h>vh){h=vh; w=h*ar;} const tx=(innerWidth-w)/2, ty=(innerHeight-h)/2;
    lbImg.style.transition='none'; lbImg.style.left=r.left+'px'; lbImg.style.top=r.top+'px'; lbImg.style.width=r.width+'px'; lbImg.style.height=r.height+'px'; lbImg.style.objectFit=getComputedStyle(el).objectFit||'cover';
    lbx.classList.add('show'); el.style.visibility='hidden'; lbImg.offsetHeight;
    lbImg.style.transition='all .65s cubic-bezier(.22,.8,.2,1)'; lbImg.style.left=tx+'px'; lbImg.style.top=ty+'px'; lbImg.style.width=w+'px'; lbImg.style.height=h+'px'; lbImg.style.objectFit='contain';
    requestAnimationFrame(()=>lbx.classList.add('in')); };
  if(lbImg.complete && lbImg.naturalWidth) go(); else lbImg.onload=go;
  const src=(el.currentSrc||el.src), m=src.match(/img\/(ext-sunset2|park|entrance|aerial|lobby|ext-front|corridor|winter|lobby2|lift-hall|ext-sunset|ph\d\d)\.jpg/);
  if(m){ const hd=new Image(); hd.onload=()=>{ if(lbSrc===el&&tok===lbTok){ lbImg.onload=started?null:go; lbImg.src=hd.src; } }; hd.src=src.replace(/\.jpg(\?.*)?$/,'-4k.jpg'); }   // 4K-версия для полноэкранного просмотра
}
function lbClose(){ if(!lbSrc) return; const el=lbSrc, tok=++lbTok, r=el.getBoundingClientRect(); lbx.classList.remove('in');
  lbImg.style.left=r.left+'px'; lbImg.style.top=r.top+'px'; lbImg.style.width=r.width+'px'; lbImg.style.height=r.height+'px'; lbImg.style.objectFit=getComputedStyle(el).objectFit||'cover';
  setTimeout(()=>{ if(tok!==lbTok) return; lbx.classList.remove('show'); el.style.visibility=''; lbSrc=null; },620); }
lbx.addEventListener('click',lbClose); addEventListener('keydown',e=>{ if(e.key==='Escape') lbClose(); });
let lbAcc=0,lbTy=null; lbx.addEventListener('transitionend',()=>{lbAcc=0});
addEventListener('wheel',e=>{ if(!lbSrc||!lbx.classList.contains('in')) return; lbAcc+=Math.abs(e.deltaY); if(lbAcc>140){ lbAcc=0; lbClose(); } },{passive:true});
addEventListener('touchstart',e=>{ lbTy=e.touches[0].clientY; },{passive:true});
addEventListener('touchmove',e=>{ if(!lbSrc||!lbx.classList.contains('in')||lbTy==null) return; if(Math.abs(e.touches[0].clientY-lbTy)>50){ lbTy=null; lbClose(); } },{passive:true});
lbx.addEventListener('touchend',e=>{ if(lbSrc&&lbx.classList.contains('in')){ e.preventDefault(); lbClose(); } },{passive:false});
addEventListener('pagehide',()=>{ if(lbSrc){ lbSrc.style.visibility=''; lbx.classList.remove('show','in'); lbSrc=null; } });
document.addEventListener('click',e=>{const im=e.target.closest('[data-zoom]'); if(im){ e.preventDefault(); lbOpen(im); }});

/* ---------- hero ---------- */
$('#heroKpis').innerHTML=[
 ['≈66 соток','участок в «золотом квадрате»'],['9','этажей: 1 — коммерция с антресолью, 2–9 — резиденции'],[String(U.length),'резиденций от 80 до 470 м²'],['230','машиномест на 2 уровнях паркинга'],['2','машино-места к каждой квартире'],['3 года','до сдачи дома']
].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');

/* ---------- hero film ---------- */
(function(){
  const F=[['ph08','Фасад по ул. Амангельды'],['fac-long','Главный фасад'],['ph05','Арка главного входа'],['fac-long-night','Дом вечером'],['mont-zhambyl','Вид со стороны ул. Жамбыла']];
  const box=$('#film'), cap=$('#filmcap'); const AR={'ph08':1.5,'ph05':1.5,'fac-long':2048/1244,'fac-long-night':2048/1244,'mont-zhambyl':2516/1780};
  box.innerHTML=F.map(f=>`<div><i style="background-image:url(img/${f[0]}.jpg)"></i><b style="background-image:url(img/${f[0]}.jpg);aspect-ratio:${AR[f[0]]}"></b></div>`).join('');
  const els=box.querySelectorAll('div'); let i=0;
  const show=()=>{els.forEach((e,k)=>{e.classList.toggle('on',k===i); if(k===i){e.style.animation='none'; e.offsetHeight; e.style.animation='';}}); cap.textContent=F[i][1]; i=(i+1)%F.length;};
  show(); setInterval(show,7000);
})();
/* ---------- walk (cinematic tour) ---------- */
(function(){
  const S=[['ph08-4k','Фасад','Фасад по ул. Амангельды','Девять этажей светлого камня и кованых балконов.'],
   ['fac-long-night-4k','Вечер','Дом вечером','Тёплый свет окон и витрин вдоль ул. Амангельды.'],
   ['entrance-4k','Вход','Парадный портал','Арочные витрины первого этажа и бронзовые двери встречают жителей и гостей.'],
   ['ph03-4k','Паркинг','Вход и въезд в паркинг','Подземный паркинг на два уровня — машины остаются под домом.'],
   ['lobby-4k','Внутри','Лобби','Консьерж, мягкие кресла и высота 8,7 м — как в хорошем отеле.'],
   ['lobby2-4k','Ресепшен','Мрамор и консьерж','Каждого гостя встречают; посторонних в доме нет.'],
   ['lift-hall-4k','Лифтовой холл','Два лифта','Два лифта в бронзе, мраморный пол, тёплая подсветка; по сторонам — ореховые двери квартир.'],
   ['corridor-4k','Этаж','Холл этажа','Четыре двери квартир из ореха с бронзой, тёплые бра; в торце — дверь на лестницу Н2 с указателем «Выход».'],
   ['ph16-4k','Гостиная','Гостиная','Высокие окна, светлое дерево и тёплый свет.'],
   ['ph15-4k','Спальня','Спальня с видом на двор','Мягкий свет, гардеробные и тишина.'],
   ['ph18-4k','Спальня','Мастер-спальня и ванная','Просторная спальня и ванная в камне.'],
   ['ph06-4k','Квартира','Гостиная, спальня, кухня','Комнаты квартиры в едином спокойном стиле.'],
   ['ph07-4k','Квартира','Вечерний свет','Мягкое освещение гостиной и спален.'],
   ['ph10-4k','Квартира','Утренний свет','Светлые комнаты с видом на двор.'],
   ['ph17-4k','Квартира','Комнаты квартиры','Гостиная, спальни, кухня и ванная.'],
   ['fac-long-4k','Фасад','Дом целиком','Девять этажей светлого камня — ровный ритм окон и балконов.']];
  const box=$('#walkbox'), cap=$('#walkcap'), pr=$('#walkprog');
  const FIT=['fac-long-4k','fac-long-night-4k','ph08-4k','ph06-4k','ph07-4k','ph10-4k','ph17-4k','ph18-4k'];
  box.insertAdjacentHTML('afterbegin',S.map(x=>FIT.includes(x[0])?`<div class="sl fit"><img class="bgb" data-src="img/${x[0]}.jpg" alt=""><img class="fg" data-src="img/${x[0]}.jpg" alt="${x[2]}"></div>`:`<div class="sl"><img data-src="img/${x[0]}.jpg" alt="${x[2]}"></div>`).join(''));
  pr.innerHTML=S.map(()=>'<i><b></b></i>').join('');
  (function(){ const fs=document.createElement('button'); fs.id='walkfs'; fs.type='button'; fs.setAttribute('aria-label','На весь экран');
    const EX='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>', CO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
    fs.innerHTML=EX; box.appendChild(fs);
    const isFs=()=>document.fullscreenElement===box||document.webkitFullscreenElement===box||box.classList.contains('pfs');
    function sync(){ const on=isFs(); fs.innerHTML=on?CO:EX; fs.setAttribute('aria-label',on?'Свернуть':'На весь экран'); document.documentElement.classList.toggle('walkfs-on',on); }
    function enter(){ const f=box.requestFullscreen||box.webkitRequestFullscreen; if(f){ try{ const r=f.call(box); if(r&&r.catch) r.catch(()=>{box.classList.add('pfs');sync();}); }catch(e){ box.classList.add('pfs'); } } else box.classList.add('pfs'); sync(); }
    function leave(){ if(document.fullscreenElement||document.webkitFullscreenElement){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); } box.classList.remove('pfs'); sync(); }
    fs.onclick=e=>{ e.stopPropagation(); isFs()?leave():enter(); };
    ['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,sync));
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&box.classList.contains('pfs')) leave(); });
  })();
  const sl=box.querySelectorAll('.sl'), bars=pr.querySelectorAll('i'); let i=-1, timer=null, started=false;
  const ld=n=>{ const e=sl[n%S.length]; if(e) e.querySelectorAll('img[data-src]').forEach(im=>{im.src=im.dataset.src; im.removeAttribute('data-src');}); };
  function go(k){ i=k%S.length; ld(i); ld(i+1); sl.forEach((e,n)=>{e.classList.toggle('on',n===i); const im=e.querySelector('.fg')||e.querySelector('img'); if(n===i){im.style.animation='none'; im.offsetHeight; im.style.animation='';}});
    bars.forEach((b,n)=>{b.classList.toggle('done',n<i); b.classList.remove('on'); if(n===i){b.offsetHeight; b.classList.add('on');}});
    const x=S[i]; cap.innerHTML=`<div class="eyebrow">${String(i+1).padStart(2,'0')} · ${x[1]}</div><h3>${x[2]}</h3><p>${x[3]}</p>`;
    clearTimeout(timer); timer=setTimeout(()=>go(i+1),4500); }
  bars.forEach((b,n)=>b.onclick=()=>go(n));
  new IntersectionObserver(es=>{ if(es[0].isIntersecting&&!started){started=true; go(0);} },{threshold:.3}).observe(box);
})();

/* ---------- gallery ---------- */
const gal=[['fac-long','Фасад по ул. Амангельды','g-a'],['mont-zhambyl','Дом с высоты · фотомонтаж','g-b'],['entrance','Главный вход','g-c'],['fac-short','Торец · ул. Жамбыла','g-c'],['lobby','Лобби','g-c'],['fac-long-night','Дом вечером','g-d'],['corridor','Поэтажный холл','g-c'],['lift-hall','Лифтовой холл','g-c']];
$('#gallery').innerHTML=gal.map(g=>`<figure class="${g[2]}"><img src="img/${g[0]}.jpg" alt="${g[1]}" loading="lazy" data-zoom><figcaption>${g[1]}</figcaption></figure>`).join('');

/* ---------- types ---------- */
function typeHTML(t){
  const v=T[t];
  const us=U.filter(u=>u.type===t), cnt=us.length, tot=us.reduce((a,u)=>a+u.area,0);
  return `<div class="typecard"><div><div class="planbox">${window.SHEV_planSVG(t)}</div><p class="pn">${window.SHEV_PLAN_NOTE}</p></div>
    <div><div class="tt-head"><div><div class="eyebrow" style="margin:0 0 6px;color:${v.color}">${v.name}</div><div class="big num">${m2(v.total)}</div></div>
    <div class="small muted" style="text-align:right">${cnt} квартир в доме<br>${M.PARK_PER_APT} машино-места в паркинге</div></div>
    ${window.SHEV_roomsTable(t)}
    <p class="small muted" style="margin-top:10px">Площадь по типу: от ${v.range[0]} до ${v.range[1]} м²; в доме ${cnt} квартир, всего ${m2(tot)}.</p>
    
</div></div>`;
}
const tt=$('#ttabs');
tt.innerHTML=K.map((t,i)=>`<button data-t="${t}" class="${i?'':'on'}"><i style="background:${T[t].color}"></i>${T[t].rooms}-к · ${nf(T[t].total,0)} м²</button>`).join('');
tt.onclick=e=>{const b=e.target.closest('button'); if(!b) return; tt.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); $('#tcard').innerHTML=typeHTML(b.dataset.t);};
let curT='2';
tt.addEventListener('click',e=>{const b=e.target.closest('button'); if(b) curT=b.dataset.t;});
function renderTypes(){$('#tcard').innerHTML=typeHTML(curT);}
renderTypes();

/* планировка конкретной квартиры на конкретном этаже: вырезка из плана этажа подъезда (расстановка мебели у каждой своя) */
const KBOX={A:[96,96,1152,992],B:[1152,96,2221,992],C:[96,992,1152,1888],D:[1152,992,2221,1888]};
window.SHEV_cropHTML=function(sec,fl,k,noflip){
  const b=KBOX[k]; if(!b) return ''; const p=40, x0=b[0]-p, y0=b[1]-p, bw=b[2]-b[0]+2*p, bh=b[3]-b[1]+2*p, flip=!noflip&&(sec===1||sec===3);
  return `<div class="kcrop" style="aspect-ratio:${bw}/${bh};${flip?'transform:scaleY(-1);':''}"><img src="img/fl/s${sec}f${fl}.jpg" alt="Планировка квартиры ${k}, ${fl} этаж, подъезд ${sec}" style="width:${(2317/bw*100).toFixed(2)}%;left:${(-x0/bw*100).toFixed(2)}%;top:${(-y0/bh*100).toFixed(2)}%" draggable="false"></div>`;
};

/* схема этажа подъезда (условная раскладка, не в масштабе) */
window.SHEV_floorSVG=function(sec,fl,act){
  const us=U.filter(u=>u.section===sec&&u.floor===fl).sort((a,b)=>a.pos-b.pos), W=440, H=300, cx0=150, cx1=290, cy0=112, cy1=188;
  const top=us.slice(0,Math.ceil(us.length/2)), bot=us.slice(top.length);
  const band=(arr,y,h)=>{const tot=arr.reduce((s,u)=>s+u.area,0); let x=0; return arr.map(u=>{const w=W*u.area/tot, x0=x; x+=w; const c=T[u.type].color, on=act===u.no;
    return `<g data-no="${u.no}" style="cursor:pointer"><rect x="${x0+2}" y="${y+2}" width="${w-4}" height="${h-4}" rx="4" fill="${c}" fill-opacity="${on?.95:.55}" stroke="${on?'#1F3A2E':c}" stroke-width="${on?4:1.5}"/><text x="${x0+w/2}" y="${y+h/2-4}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">${u.no}</text><text x="${x0+w/2}" y="${y+h/2+14}" text-anchor="middle" font-size="12" fill="#fff">${nf(u.area,0)} м²</text></g>`;}).join('');};
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#FBF9F5;border-radius:10px">${band(top,0,cy0)}${band(bot,cy1,H-cy1)}<rect x="${cx0}" y="${cy0}" width="${cx1-cx0}" height="${cy1-cy0}" fill="#d9d2c2" stroke="#b9ae96"/><text x="${(cx0+cx1)/2}" y="${(cy0+cy1)/2+5}" text-anchor="middle" font-size="13" fill="#6b6455">ядро · 2 лифта</text></svg><p class="muted small" style="margin:6px 0 0">Схема этажа подъезда: квартиры вокруг лифтового ядра.</p>`;
};
{const hp=document.getElementById('hallplan'); if(hp) hp.innerHTML=window.SHEV_typicalFloor?window.SHEV_typicalFloor():window.SHEV_floorSVG(1,3,0);}
/* ---------- chess ---------- */
let filt='all';
function unitCard(u){
  const v=T[u.type];
  return `<div class="card"><div><div class="planbox">${window.SHEV_planSVG(u.type)}</div><p class="pn">${window.SHEV_PLAN_NOTE}</p><div style="margin-top:14px">${window.SHEV_floorSVG(u.section,u.floor,u.no)}</div></div><div>
  <div class="eyebrow" style="color:${v.color}">Квартира ${u.no} · ${v.rooms}-комнатная</div>
  <table class="rooms num"><tr><td>Этаж</td><td>${u.floor}</td></tr><tr><td>Подъезд</td><td>${M.SECTIONS[u.section-1].name}</td></tr><tr><td>Тип</td><td>${v.name}</td></tr>
  ${window.SHEV_planRooms(u.type).map(r=>`<tr><td>${r[0]}</td><td>${m2(r[1])}</td></tr>`).join('')}<tr class="sum"><td>Общая площадь</td><td>${m2(u.area)}</td></tr></table>
  <button class="btn" style="margin-top:16px" onclick="document.getElementById('modal').classList.remove('show');window.SHEV3D&&window.SHEV3D.focus('${u.no}');location.hash='s3d'">Показать в 3D</button></div></div>`;
}
window.SHEV_unitCard=no=>{const u=U.find(x=>x.no===no); if(u) openModal(unitCard(u));};
let chSec=1, chFl=5;
function renderChess(){
  const us=U.filter(u=>u.floor===chFl&&u.section===chSec).sort((x,y)=>x.pos-y.pos);
  $('#chessTools').innerHTML=`<div class="px-row"><span class="px-lab">Подъезд</span><div class="px-seg" id="pxSec">${M.SECTIONS.map(s=>`<button data-s="${s.n}" class="${s.n===chSec?'on':''}">${s.n}</button>`).join('')}</div><span class="px-lab">Этаж</span><div class="px-seg" id="pxFl">${M.FLOORS.map(f=>`<button data-f="${f}" class="${f===chFl?'on':''}">${f}</button>`).join('')}</div></div>`;
  $('#chessWrap').innerHTML=`<div class="px-grid">${us.map(u=>{const v=T[u.type]; return `<button class="px-u" data-no="${u.no}" style="--c:${v.color}"><b>${u.no}</b><span>${v.rooms}-к · ${nf(u.area,0)} м²</span></button>`;}).join('')}</div>`;
  const sel=U, A=sel.reduce((s,u)=>s+u.area,0), Pof=p=>sel.reduce((s,u)=>s+Math.round(u.area*p),0);
  $('#chessSum').innerHTML=`<div><b>${sel.length}</b><span>квартир в выборке</span></div><div><b>${nf(A,1)}</b><span>м² продаваемой площади</span></div>`;
}
/* коммерция и паркинг (из финансовой модели проекта) */
function renderExtra(){
  const COM=4628.4, PN=53, PP_=30000, OWN=37, LV=[Math.ceil(PN/2),Math.floor(PN/2)];
  let ownLeft=OWN;
  const lvl=(k,n)=>{ ownLeft=Math.min(ownLeft,PN); let cells=''; for(let i=0;i<n;i++){ const own=ownLeft>0 && k===1 ? (ownLeft--,true) : false; cells+=`<i class="${own?'own':''}" title="P${k}-${String(i+1).padStart(2,'0')}"></i>`; }
    return `<div class="xcard"><h4>Паркинг −${k}</h4><div class="sub">${n} мест</div><div class="pk">${cells}</div></div>`; };
  $('#chessExtra').innerHTML=`<div class="xh">Коммерция и паркинг</div>
    <div class="xcard"><h4>Коммерческие, ${nf(COM,1)} м²</h4><div class="com-blk">${nf(COM,1)} м²</div></div>`+lvl(1,LV[0])+lvl(2,LV[1])+`<div class="xleg"><span><i style="background:#8C9A93"></i><span>Паркинг, ${PN} мест</span></span><span><i style="background:#C9A66B"></i><span>Доля собственника участка</span> · <span>Паркинг, ${OWN} мест</span></span></div>`;
}
$('#chessTools').onclick=e=>{const b=e.target.closest('button'); if(!b) return; if(b.dataset.s) chSec=+b.dataset.s; if(b.dataset.f) chFl=+b.dataset.f; renderChess();};
$('#chessWrap').onclick=e=>{const c=e.target.closest('.px-u'); if(c) window.SHEV_unitCard(c.dataset.no);};
renderChess(); renderExtra();
// mix table
let mixSel='2';
function renderMix(){
  const stat=t=>{ const us=t==='all'?U:U.filter(u=>u.type===t); const a=us.reduce((s,u)=>s+u.area,0); return {n:us.length,a,sum:p=>us.reduce((s,u)=>s+Math.round(u.area*p),0)}; };
  const tabs=K.map(t=>`<button data-t="${t}" class="${mixSel===t?'on':''}"><i style="background:${T[t].color}"></i>${T[t].rooms}-к · ${nf(T[t].total,0)} м²</button>`).join('')+`<button data-t="all" class="${mixSel==='all'?'on':''}">Итого</button>`;
  const st=stat(mixSel), cell=(l,v)=>`<div><span>${l}</span><b>${v}</b></div>`;
  let card;
  if(mixSel==='all') card=`<div class="hd">Итого</div>`+cell('Квартир',st.n)+cell('Всего, м²',nf(st.a,1))+cell('Доля площади','100,0%'); 
  else card=`<div class="hd"><i style="background:${T[mixSel].color}"></i>${mixSel} · <span>${T[mixSel].name}</span></div>`+cell('Комнат',T[mixSel].rooms)+cell('Площадь, м²',nf(T[mixSel].total,1))+cell('Квартир',st.n)+cell('Всего, м²',nf(st.a,1))
    +cell('Доля площади',pct(st.a/M.AREA));
  $('#mixTable').innerHTML=`<div class="mixtabs">${tabs}</div><div class="mixcard">${card}</div>`;
}
$('#mixTable').addEventListener('click',e=>{const b=e.target.closest('.mixtabs button'); if(!b) return; mixSel=b.dataset.t; renderMix();});
renderMix();

/* ---------- amenities ---------- */
$('#amen').innerHTML=M.GROUND.map(g=>`<div><b>${nf(g[1],2)}</b><span class="small muted">м² · ${g[0]}</span></div>`).join('');

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('section .wrap > *').forEach(el=>{el.classList.add('reveal');io.observe(el);});
/* ---------- конструктор этажа (интерактивный) ---------- */
(function(){
  const b=$('#kbtn'); if(true) return; if(!b||!window.KPOLY) return;
  const t=k=>M.TYPES[k].total, KP=window.KPOLY;
  const GC={A:'#3D6FA8',B:'#2E8B7E',C:'#B8862F',D:'#8E64A8',AC:'#2E4A62',BD:'#7A5436',ABCD:'#1E282E'};
  const TX={4:'Четыре резиденции по 117,2 м² вокруг ядра с двумя лифтами.',3:'Резиденция A+C 234,4 м² на весь торец подъезда — окна на улицу, во двор и на торец; плюс B и D.',2:'Две резиденции по 234,4 м²: каждая — половина этажа подъезда, до шести спален.',1:'Весь этаж подъезда 468,8 м²: анфилада, кухня шефа, мастер-сьют, до 9 спален. Лифтовой холл — частное лобби.'};
  const NM=g=>g.split('').join('+');
  const area=g=>g.split('').reduce((a,k)=>a+t(k),0);
  let v=4; const svg=$('#ksvg'), img=$('#kimg'), cards=$('#kcards');
  svg.setAttribute('viewBox',`0 0 ${KP.w} ${KP.h}`);
  const hov=(g,on)=>{svg.querySelectorAll('polygon').forEach(p=>{const m=p.dataset.g===g&&on;p.classList.toggle('hov',m);p.style.fill=m?GC[g]+'40':'transparent';p.style.stroke=m?GC[g]:'transparent';});
    cards.querySelectorAll('button').forEach(x=>x.classList.toggle('hov',x.dataset.g===g&&on));};
  function groupHTML(g){
    const n=g.length, a=area(g);
    return `<div class="card"><div style="position:relative"><img src="img/var-${v}.jpg" style="width:100%;border-radius:10px" alt="">
      <svg viewBox="0 0 ${KP.w} ${KP.h}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">${KP.v[v].filter(q=>q.g===g).map(q=>`<polygon points="${q.pts.map(p=>p.join(',')).join(' ')}" style="fill:${GC[g]}33;stroke:${GC[g]};stroke-width:14"/>`).join('')}</svg></div><div>
      <div class="eyebrow" style="color:${GC[g]}">Резиденция ${NM(g)}</div>
      <table class="rooms num" style="margin-top:14px"><tr><td>Площадь</td><td>${m2(a)}</td></tr><tr><td>Объединяемые квартиры</td><td>${NM(g)}</td></tr><tr><td>Спальни</td><td>до ${n*3}</td></tr><tr><td>Машино-места</td><td>${n*2}</td></tr></table>
      <p class="small muted" style="margin-top:12px">${TX[v]}</p></div></div>`;
  }
  function open(g){ if(g.length===1) openModal(typeHTML(g)); else openModal(groupHTML(g)); }
  function draw(){
    b.querySelectorAll('button').forEach(x=>x.classList.toggle('on',+x.dataset.v===v)); img.src='img/var-'+v+'.jpg';
    const c=KP.core;
    svg.innerHTML=KP.v[v].map(q=>`<polygon data-g="${q.g}" points="${q.pts.map(p=>p.join(',')).join(' ')}"/>`).join('')+`<rect x="${c[0][0]}" y="${c[0][1]}" width="${c[1][0]-c[0][0]}" height="${c[1][1]-c[0][1]}"/>`;
    cards.innerHTML=KP.v[v].map(q=>`<button data-g="${q.g}" style="--c:${GC[q.g]}"><span><i></i>${q.g.length>1?'Резиденция '+NM(q.g):'Квартира '+q.g}</span><b>${m2(area(q.g))}</b></button>`).join('');
    $('#ktxt').textContent=TX[v]+' Машино-мест — по 2 на каждый объединяемый модуль.';
  }
  svg.addEventListener('mouseover',e=>{const p=e.target.closest('polygon'); hov(p?p.dataset.g:'',!!p);});
  svg.addEventListener('mouseleave',()=>hov('',false));
  svg.addEventListener('click',e=>{const p=e.target.closest('polygon'); if(p) open(p.dataset.g); else lbOpen(img);});
  cards.addEventListener('mouseover',e=>{const x=e.target.closest('button'); hov(x?x.dataset.g:'',!!x);});
  cards.addEventListener('mouseleave',()=>hov('',false));
  cards.addEventListener('click',e=>{const x=e.target.closest('button'); if(x) open(x.dataset.g);});
  b.onclick=e=>{const x=e.target.closest('button'); if(x){v=+x.dataset.v; draw();}};
  draw(); window.addEventListener('shevprice',draw);
})();
})();
window.__renderPT&&window.__renderPT();

/* ---------- кнопки «поделиться» ---------- */
(function(){
  const ART='https://claude.ai/artifact/F7nHQ94hCGys8HcUbHd7Jy';
  const url=/(claude|anthropic)/.test(location.hostname)||!/^https?:/.test(location.protocol) ? ART : location.href.split('#')[0];
  const txt='ЖК «Шевченко» — Алматы, ул. Амангельды, 78. Премиальный клубный дом, 3D-модель, квартиры и цены:';
  const q=encodeURIComponent;
  const sh=document.getElementById('cx-links'); if(!sh) return;
  const U=[()=>['https://','wa','.me/?text=',q(txt+' '+url)].join(''), ()=>['https://','t','.me/share/url?url=',q(url),'&text=',q(txt)].join(''),
           ()=>`https://mail.google.com/mail/?view=cm&fs=1&su=${q('ЖК «Шевченко», Алматы')}&body=${q(txt+'\n'+url)}`];
  // адрес ставится только в момент нажатия — так кнопки не скрываются блокировщиками
  sh.querySelectorAll('a').forEach((a,k)=>{ const arm=()=>{ a.href=U[k](); setTimeout(()=>a.removeAttribute('href'),1500); };
    ['pointerdown','touchstart','focus','keydown'].forEach(ev=>a.addEventListener(ev,arm,{passive:true})); a.setAttribute('role','link'); a.tabIndex=0; });

})();

/* ---------- таблицы-карточки на телефоне ---------- */
function stackify(t){ const hr=[...t.querySelectorAll('tr')].find(r=>r.querySelector('th')); if(!hr) return;
  const H=[...hr.children].map(c=>c.textContent.trim());
  t.querySelectorAll('tr').forEach(r=>{ if(r===hr||r.querySelector('th')) return; let k=0;
    [...r.children].forEach(td=>{ const span=+td.getAttribute('colspan')||1; if(!td.querySelector(':scope>.tl') && td.innerHTML.trim()!==''){
      const lab=H[k]||''; td.innerHTML=`<span class="tl">${lab}</span><span class="tv">${td.innerHTML}</span>`; } k+=span; }); }); }
document.querySelectorAll('table.stack').forEach(t=>{ stackify(t); new MutationObserver(ms=>{ if(ms.some(m=>m.type==='childList' && [...m.addedNodes].some(n=>n.nodeName==='TBODY'||n.nodeName==='TR'))) stackify(t); }).observe(t,{childList:true}); });
let __narrow=matchMedia('(max-width:700px)').matches;
addEventListener('resize',()=>{ const n=matchMedia('(max-width:700px)').matches; if(n!==__narrow){ __narrow=n; renderChess(); } });
/* ---------- сценарии А / Б и динамические подписи ---------- */
(function(){
  const M=window.SHEV, T=M.TYPES, K=M.TYPE_KEYS, {nf,usd,U}=window.SHEV_UI, $=q=>document.querySelector(q);
  const nw=n=>({2:'двухкомнатных',3:'трёхкомнатных',4:'четырёхкомнатных',5:'пятикомнатных',6:'шестикомнатных'})[n];
  const by={}; U.forEach(u=>by[u.type]=(by[u.type]||0)+1);
  const mix=K.map(k=>by[k]+' '+nw(k)).join(', ');
  const v={n:U.length,area:nf(M.AREA,0),mix,n2:U.length*2,n3:U.length*2+7,n4:230-(U.length*2+7)};
  document.querySelectorAll('[data-sc]').forEach(e=>{const x=v[e.dataset.sc]; if(x!=null) e.textContent=x;});
  const box=$('#scenBox'); if(!box) return;
  const S={A:M.scenarioStats('A'),B:M.scenarioStats('B')}, cur=M.SCEN;
  const row=(l,f)=>`<tr><td>${l}</td><td class="${cur==='A'?'cur':''}">${f('A')}</td><td class="${cur==='B'?'cur':''}">${f('B')}</td></tr>`;
  const d=(a,b,fmt)=>{const x=b-a; return x===0?'':` <small class="dl ${x>0?'up':'dn'}">${x>0?'+':'−'}${fmt(Math.abs(x))}</small>`;};
  box.innerHTML=`<div class="scen-btns"><button data-sc-set="A" class="${cur==='A'?'on':''}"><b>Сценарий А</b><span>4 подъезда Luxury</span></button><button data-sc-set="B" class="${cur==='B'?'on':''}"><b>Сценарий Б</b><span>3 подъезда Luxury + Private Residence</span></button></div>
  <div class="scen-tab"><table class="num"><thead><tr><th></th><th>А · все Luxury</th><th>Б · 3 Luxury + Private</th></tr></thead><tbody>
  ${row('Квартир',k=>S[k].n+(k==='B'?d(S.A.n,S.B.n,x=>x):''))}
  ${row('Площадь квартир, м²',k=>nf(S[k].area,1)+(k==='B'?d(S.A.area,S.B.area,x=>nf(x,0)):''))}
  ${row('Средняя площадь, м²',k=>nf(S[k].avg,1))}
  ${K.map(t=>row(T[t].rooms+'-комнатные',k=>S[k].by[t]||0)).join('')}
  ${row('Макс. площадь квартир на этаже подъезда, м² (лимит 500)',k=>nf(S[k].maxFloorSec,0))}
  </tbody></table></div>
  <p class="muted small" style="margin-top:12px">Сценарий Б: подъезд 4 — камерный (этажи 2–5: две квартиры по 205 м², 6–8: одна по 301 м², 9: пентхаус 470 м²). Выбранный сценарий сохраняется в браузере и применяется ко всему сайту.</p>`;
  box.onclick=e=>{const b=e.target.closest('[data-sc-set]'); if(b&&b.dataset.scSet!==cur) M.setScenario(b.dataset.scSet);};
})();
