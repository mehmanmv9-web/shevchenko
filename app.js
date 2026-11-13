(function(){
const M=window.SHEV, T=M.TYPES, K=M.TYPE_KEYS;
const $=s=>document.querySelector(s);
const nf=(x,d=0)=>x.toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d}).replace(/ /g,' ');
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
const base=M.run({});
$('#heroKpis').innerHTML=[
 ['≈88 соток','участок в «золотом квадрате»'],['9','этажей: 1 — коммерция с антресолью, 2–9 — резиденции'],['128','резиденций по 117,2 м²'],['$4 500–6 000','цена за м²'],['3 года','до сдачи дома']
].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');

/* ---------- hero film ---------- */
(function(){
  const F=[['ph13','Главный фасад · закат'],['ph08','Фасад по ул. Амангельды'],['ph12','Двор-парк'],['ph05','Арка главного входа'],['ph09','Вечерняя улица']];
  const box=$('#film'), cap=$('#filmcap'); const AR={'ph13':1.5,'ph08':1.5,'ph12':1.5,'ph05':1.5,'ph09':1.5,'ext-front':1.5,'fac-long':2048/1013,'park':1.5,'fac-long-night':2048/1013,'entrance':1.5};
  box.innerHTML=F.map(f=>`<div><i style="background-image:url(img/${f[0]}.jpg)"></i><b style="background-image:url(img/${f[0]}.jpg);aspect-ratio:${AR[f[0]]}"></b></div>`).join('');
  const els=box.querySelectorAll('div'); let i=0;
  const show=()=>{els.forEach((e,k)=>{e.classList.toggle('on',k===i); if(k===i){e.style.animation='none'; e.offsetHeight; e.style.animation='';}}); cap.textContent=F[i][1]; i=(i+1)%F.length;};
  show(); setInterval(show,7000);
})();
/* ---------- walk (cinematic tour) ---------- */
(function(){
  const S=[['ext-front-4k','Прибытие','Светлый классический фасад','Камень, бронза и тёплый свет окон — дом выглядит дорого в любое время суток.'],
   ['ph09-4k','Фасад','Угол дома','Вечерняя улица и мягкий свет окон.'],
   ['ph08-4k','Фасад','Фасад по ул. Амангельды','Девять этажей светлого камня и кованых балконов.'],
   ['fac-long-night-4k','Вечер','Дом вечером','Тёплый свет окон и витрин вдоль ул. Амангельды.'],
   ['entrance-4k','Вход','Парадный портал','Арочные витрины первого этажа и бронзовые двери встречают жителей и гостей.'],
   ['ph03-4k','Паркинг','Вход и въезд в паркинг','Подземный паркинг на два уровня — машины остаются под домом.'],
   ['lobby-4k','Внутри','Лобби','Консьерж, мягкие кресла и высота 8,7 м — как в хорошем отеле.'],
   ['lobby2-4k','Ресепшен','Мрамор и консьерж','Каждого гостя встречают; посторонних в доме нет.'],
   ['lift-hall-4k','Лифтовой холл','Два лифта','Два лифта в бронзе, мраморный пол, тёплая подсветка; по сторонам — ореховые двери квартир.'],
   ['corridor-4k','Этаж','Холл этажа','Четыре двери квартир из ореха с бронзой, тёплые бра; в торце — дверь на лестницу Н2 с указателем «Выход».'],
   ['ph16-4k','Гостиная','Гостиная с кухней-столовой','Высокие окна, светлое дерево и тёплый свет.'],
   ['ph15-4k','Спальня','Спальня с видом на двор','Мягкий свет, гардеробные и тишина.'],
   ['ph18-4k','Спальня','Мастер-спальня и ванная','Просторная спальня и ванная в камне.'],
   ['ph06-4k','Квартира','Гостиная, спальня, кухня','Комнаты квартиры в едином спокойном стиле.'],
   ['ph07-4k','Квартира','Вечерний свет','Мягкое освещение гостиной и спален.'],
   ['ph10-4k','Квартира','Утренний свет','Светлые комнаты с видом на двор.'],
   ['ph17-4k','Квартира','Комнаты квартиры','Гостиная, спальни, кухня и ванная.'],
   ['ph11-4k','Квартира','Студийная планировка','Свободное пространство для жизни и гостей.'],
   ['park-4k','Двор','Парк без машин','Аллеи, цветы и фонари — машины остаются в подземном паркинге.'],
   ['ph14-4k','Двор','Зимний вечер над двором','Двор-сад в снегу и тёплых огнях.']];
  const box=$('#walkbox'), cap=$('#walkcap'), pr=$('#walkprog');
  const FIT=['ext-front-4k','fac-long-night-4k','ph08-4k','ph06-4k','ph07-4k','ph10-4k','ph11-4k','ph17-4k','ph18-4k'];
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
const gal=[['fac-long','Фасад по ул. Амангельды','g-a'],['aerial','Двор-парк с высоты','g-b'],['entrance','Главный вход','g-c'],['fac-short','Торец · ул. Жамбыла','g-c'],['lobby','Лобби','g-c'],['ext-front','Главный фасад','g-d'],['corridor','Поэтажный холл','g-c'],['lift-hall','Лифтовой холл','g-c']];
$('#gallery').innerHTML=gal.map(g=>`<figure class="${g[2]}"><img src="img/${g[0]}.jpg" alt="${g[1]}" loading="lazy" data-zoom><figcaption>${g[1]}</figcaption></figure>`).join('');

/* ---------- types ---------- */
let MODE='cmp';
const PP=()=>M.STATE.price, PS=()=>MODE==='cmp'?M.PRICES.slice():[MODE], J=fn=>PS().map(fn).join(' / ');
function aptPrice(t){return Math.round(T[t].total*PP());}
function typeHTML(t){
  const v=T[t], inn=M.inner(t), pr=aptPrice(t);
  const nums=U.filter(u=>u.floor===2&&u.type===t).map(u=>'X-'+u.no.split('-')[1]).join(', '), cnt=U.filter(u=>u.type===t).length;
  return `<div class="typecard"><div><div class="plan"><img src="img/type-${t}.jpg" alt="${t}" data-zoom></div></div>
    <div><div class="tt-head"><div><div class="eyebrow" style="margin:0 0 6px;color:${v.color}">${t} · <span>${v.name}</span></div><div class="big num">${m2(v.total)}</div></div>
    <div class="small muted" style="text-align:right">${cnt} квартир<br>номера ${nums}<br>X — этаж 2…9<br>${M.PARK_PER_APT} машино-места в паркинге</div></div>
    <table class="rooms num">${v.r.map(r=>`<tr><td>${r[0]}</td><td>${m2(r[1])}</td></tr>`).join('')}
    <tr class="sum"><td>Внутренние помещения</td><td>${m2(inn)}</td></tr>
    <tr class="sum"><td>Общая площадь квартиры</td><td>${m2(inn+v.loggia)}</td></tr></table>
    <div class="pricebox num"><div><span>Цена за м²</span><b>${J(p=>usd(p))}</b></div><div><span>Цена квартиры</span><b>${J(p=>usd(Math.round(v.total*p)))}</b></div><div><span>В тенге (курс ${nf(M.DEF.fx,0)} ₸)</span><b>${J(p=>nf(Math.round(v.total*p)*M.DEF.fx/1e6,1))} млн ₸</b></div></div>
</div></div>`;
}
const tt=$('#ttabs');
tt.innerHTML=K.map((t,i)=>`<button data-t="${t}" class="${i?'':'on'}"><i style="background:${T[t].color}"></i>${t} · ${T[t].rooms}-к · ${nf(T[t].total,1)} м²</button>`).join('');
tt.onclick=e=>{const b=e.target.closest('button'); if(!b) return; tt.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); $('#tcard').innerHTML=typeHTML(b.dataset.t);};
let curT='A';
tt.addEventListener('click',e=>{const b=e.target.closest('button'); if(b) curT=b.dataset.t;});
function renderTypes(){$('#tcard').innerHTML=typeHTML(curT);}
renderTypes();

/* планировка конкретной квартиры на конкретном этаже: вырезка из плана этажа подъезда (расстановка мебели у каждой своя) */
const KBOX={A:[96,96,1152,992],B:[1152,96,2221,992],C:[96,992,1152,1888],D:[1152,992,2221,1888]};
window.SHEV_cropHTML=function(sec,fl,k,noflip){
  const b=KBOX[k]; if(!b) return ''; const p=40, x0=b[0]-p, y0=b[1]-p, bw=b[2]-b[0]+2*p, bh=b[3]-b[1]+2*p, flip=!noflip&&(sec===1||sec===3);
  return `<div class="kcrop" style="aspect-ratio:${bw}/${bh};${flip?'transform:scaleY(-1);':''}"><img src="img/fl/s${sec}f${fl}.jpg" alt="Планировка квартиры ${k}, ${fl} этаж, подъезд ${sec}" style="width:${(2317/bw*100).toFixed(2)}%;left:${(-x0/bw*100).toFixed(2)}%;top:${(-y0/bh*100).toFixed(2)}%" draggable="false"></div>`;
};
/* ---------- chess ---------- */
let filt='all';
function unitCard(u){
  const v=T[u.type];
  return `<div class="card"><div>${window.SHEV_cropHTML(u.section,u.floor,u.type,true)}<p class="muted small" style="margin:8px 0 4px">Расстановка мебели в этой квартире · подъезд ${u.section} · этаж ${u.floor}</p><img src="img/type-${u.type}.jpg" style="width:100%;background:#fff;margin-top:6px" alt=""></div><div>
  <div class="eyebrow" style="color:${v.color}">Квартира ${u.no} · ${u.type}</div>
  <div class="serif" style="font-size:${MODE==='cmp'?32:44}px;line-height:1.1">${J(p=>usd(Math.round(u.area*p)))}</div>
  <p class="muted small" style="margin:6px 0 14px">${PS().map(p=>`${nf(u.area,1)} м² × ${usd(p)}/м² = ${usd(Math.round(u.area*p))} · ≈ ${nf(Math.round(u.area*p)*M.DEF.fx/1e6,2)} млн ₸`).join('<br>')}</p>
  <table class="rooms num"><tr><td>Этаж</td><td>${u.floor}</td></tr><tr><td>Подъезд</td><td>${M.SECTIONS[u.section-1].name}</td></tr><tr><td>Тип</td><td>${v.name}</td></tr>
  ${((u.end&&v.rEnd)?v.rEnd:v.r).map(r=>`<tr><td>${r[0]}</td><td>${m2(r[1])}</td></tr>`).join('')}<tr class="sum"><td>Итого</td><td>${m2(u.area)}</td></tr></table>
  <button class="btn" style="margin-top:16px" onclick="document.getElementById('modal').classList.remove('show');window.SHEV3D&&window.SHEV3D.focus('${u.no}');location.hash='s3d'">Показать в 3D</button></div></div>`;
}
window.SHEV_unitCard=no=>{const u=U.find(x=>x.no===no); if(u) openModal(unitCard(u));};
let chSec=1, chFl=5;
function renderChess(){
  const us=U.filter(u=>u.floor===chFl&&u.section===chSec).sort((x,y)=>K.indexOf(x.type)-K.indexOf(y.type));
  $('#chessTools').innerHTML=`<div class="px-row"><span class="px-lab">Подъезд</span><div class="px-seg" id="pxSec">${M.SECTIONS.map(s=>`<button data-s="${s.n}" class="${s.n===chSec?'on':''}">${s.n}</button>`).join('')}</div><span class="px-lab">Этаж</span><div class="px-seg" id="pxFl">${M.FLOORS.map(f=>`<button data-f="${f}" class="${f===chFl?'on':''}">${f}</button>`).join('')}</div></div>`;
  $('#chessWrap').innerHTML=`<div class="px-grid">${us.map(u=>{const v=T[u.type]; return `<button class="px-u" data-no="${u.no}" style="--c:${v.color}"><b>${u.type}</b><span>${v.rooms}-к · ${nf(u.area,1)} м²</span><strong>${J(p=>usd(Math.round(u.area*p)))}</strong>${MODE==='cmp'?'':`<small>≈ ${nf(Math.round(u.area*MODE)*M.DEF.fx/1e6,1)} млн ₸</small>`}</button>`;}).join('')}</div>`;
  const sel=U, A=sel.reduce((s,u)=>s+u.area,0), Pof=p=>sel.reduce((s,u)=>s+Math.round(u.area*p),0);
  $('#chessSum').innerHTML=`<div><b>${sel.length}</b><span>квартир в выборке</span></div><div><b>${nf(A,1)}</b><span>м² продаваемой площади</span></div><div><b>${J(p=>mln(Pof(p)))}</b><span>стоимость по прайсу с НДС</span></div><div><b>${J(p=>usd(p))}</b><span>цена за м²</span></div>`;
}
/* коммерция и паркинг (из финансовой модели проекта) */
function renderExtra(){
  const COM=4628.4, PN=M.DEF.parkN, PP_=30000, OWN=37, LV=[PN/2,PN/2];
  let ownLeft=OWN;
  const lvl=(k,n)=>{ let cells=''; for(let i=0;i<n;i++){ const own=ownLeft>0 && k===1 ? (ownLeft--,true) : false; cells+=`<i class="${own?'own':''}" title="P${k}-${String(i+1).padStart(2,'0')} · ${usd(PP_)}"></i>`; }
    return `<div class="xcard"><h4>Паркинг −${k}</h4><div class="sub">${n} мест</div><div class="pk">${cells}</div>
      <div class="tot"><span>Паркинг, ${n} мест × ${usd(PP_)}</span><b>${usd(n*PP_)}</b></div></div>`; };
  $('#chessExtra').innerHTML=`<div class="xh">Коммерция и паркинг</div>
    <div class="xcard"><h4>Коммерческие, ${nf(COM,1)} м²</h4><div class="sub">${J(p=>usd(p))} за м²</div><div class="com-blk">${nf(COM,1)} м²</div>
      <div class="tot"><span>Сумма по прайсу</span><b>${J(p=>usd(Math.round(COM*p)))}</b></div></div>`+lvl(1,LV[0])+lvl(2,LV[1])+`<div class="xcard"><h4>Новые места паркинга</h4><div class="sub">${M.PARK.added} мест сверх таблицы · всего ${M.PARK.total}</div><div class="com-blk">+${M.PARK.added}</div><div class="tot"><span>${M.PARK.added} мест × ${usd(PP_)}</span><b>${usd(M.PARK.addedUsd)}</b></div></div>`+
    `<div class="xleg"><span><i style="background:#8C9A93"></i><span>Паркинг, ${PN} мест × ${usd(PP_)}</span> = ${usd(PN*PP_)}</span><span><i style="background:#C9A66B"></i><span>Доля собственника участка</span> · <span>Паркинг, ${OWN} мест</span></span></div>`;
}
$('#chessTools').onclick=e=>{const b=e.target.closest('button'); if(!b) return; if(b.dataset.s) chSec=+b.dataset.s; if(b.dataset.f) chFl=+b.dataset.f; renderChess();};
$('#chessWrap').onclick=e=>{const c=e.target.closest('.px-u'); if(c) window.SHEV_unitCard(c.dataset.no);};
renderChess(); renderExtra();
// mix table
let mixSel='A';
function renderMix(){
  const stat=t=>{ const us=t==='all'?U:U.filter(u=>u.type===t); const a=us.reduce((s,u)=>s+u.area,0); return {n:us.length,a,sum:p=>us.reduce((s,u)=>s+Math.round(u.area*p),0)}; };
  const tabs=K.map(t=>`<button data-t="${t}" class="${mixSel===t?'on':''}"><i style="background:${T[t].color}"></i>${t} · ${T[t].rooms}-к · ${nf(T[t].total,1)} м²</button>`).join('')+`<button data-t="all" class="${mixSel==='all'?'on':''}">Итого</button>`;
  const st=stat(mixSel), cell=(l,v)=>`<div><span>${l}</span><b>${v}</b></div>`;
  let card;
  if(mixSel==='all') card=`<div class="hd">Итого</div>`+cell('Квартир',st.n)+cell('Всего, м²',nf(st.a,1))+cell('Доля площади','100,0%')+cell('Сумма по прайсу',J(p=>usd(st.sum(p))));
  else card=`<div class="hd"><i style="background:${T[mixSel].color}"></i>${mixSel} · <span>${T[mixSel].name}</span></div>`+cell('Комнат',T[mixSel].rooms)+cell('Площадь, м²',nf(T[mixSel].total,1))+cell('Квартир',st.n)+cell('Всего, м²',nf(st.a,1))
    +cell('Доля площади',pct(st.a/M.AREA))+cell('Цена квартиры',J(p=>usd(Math.round(T[mixSel].total*p))))+cell('В тенге',J(p=>nf(Math.round(T[mixSel].total*p)*M.DEF.fx/1e6,1))+' млн ₸')+cell('Сумма по прайсу',J(p=>usd(st.sum(p))));
  $('#mixTable').innerHTML=`<div class="mixtabs">${tabs}</div><div class="mixcard">${card}</div>`;
}
$('#mixTable').addEventListener('click',e=>{const b=e.target.closest('.mixtabs button'); if(!b) return; mixSel=b.dataset.t; renderMix();});
renderMix();

/* ---------- amenities ---------- */
$('#amen').innerHTML=M.GROUND.map(g=>`<div><b>${nf(g[1],2)}</b><span class="small muted">м² · ${g[0]}</span></div>`).join('');

/* ---------- investor (simple) ---------- */
const st=Object.assign({},M.DEF);
const PR=[...M.PRICES.map(p=>[p,usd(p)+' за м²']),['cmp','Сравнение']];
function recalc(){
  const rs=PS().map(p=>M.run({...st,price:p})), JR=fn=>rs.map(fn).join(' / ');
  $('#scen').innerHTML=PR.map(p=>`<button data-p="${p[0]}" class="${MODE===p[0]?'on':''}">${p[1]}</button>`).join('');
  $('#kgrid').innerHTML=[
    [JR(r=>mln(r.G)),'Все продажи проекта','квартиры, коммерция и паркинг'],
    [JR(r=>mln(r.devNet)),'Чистая прибыль застройщика','после налогов и расчёта с собственником'],
    [JR(r=>pct(r.devNet/st.equity,0)),'Доходность застройщика','на вложенные $2 млн'],
    [JR(r=>mln(r.partnerNet)),'Прибыль собственника участка',`<b>${JR(r=>pct(r.partnerRoi,0))}</b> <span>сверх стоимости земли $17 млн</span>`],
  ].map(x=>`<div><b>${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></div>`).join('');
  const L=(n,f,cls='')=>`<tr class="${cls}"><td>${n}</td>${rs.map(r=>`<td class="r">${usd(f(r))}</td>`).join('')}</tr>`;
  $('#pl').innerHTML=(rs.length>1?`<tr><th>Статья</th>${PS().map(p=>`<th class="r">Цена ${usd(p)} за м²</th>`).join('')}</tr>`:'')+L('Продажи квартир, коммерции и паркинга',r=>r.G,'sub')+L('НДС к оплате',r=>-r.vatPay)+L('Строительство дома и паркинга (без НДС)',r=>-r.costEx)
    +L('Налог на прибыль 20%',r=>-r.cit)+L('Доля собственника участка',r=>-r.P)+L('Чистая прибыль застройщика',r=>r.devNet,'tot');
  $('#split').innerHTML=rs.map((r,k)=>{ const parts=[['Строительство',r.C,'#7FA08B'],['Собственник участка',r.P,'#A8864F'],['Налоги (НДС + на прибыль)',r.vatPay+r.cit,'#9AA5B5'],['Прибыль застройщика',r.G-r.C-r.P-r.vatPay-r.cit,'#1F3A2E']];
    return (rs.length>1?`<div class="eyebrow" style="margin:${k?18:0}px 0 8px">Цена ${usd(PS()[k])} за м²</div>`:'')+'<div style="display:flex;height:34px;margin-bottom:14px">'+parts.map(p=>`<div style="width:${p[1]/r.G*100}%;background:${p[2]}"></div>`).join('')+'</div>'+
    parts.map(p=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ECE5D8;font-size:14px"><span><i style="display:inline-block;width:10px;height:10px;background:${p[2]};margin-right:8px"></i>${p[0]}</span><span class="num">${mln(p[1])} · ${pct(p[1]/r.G,0)}</span></div>`).join(''); }).join('');
  if(window.__renderDoc) window.__renderDoc();
  if(window.__renderPT) window.__renderPT();
}
(function(){
  const f=v=>typeof v==='number'?usd(v,2):v, tg=v=>nf(v*M.DEF.fx,2)+' ₸', PA=M.DEF.partnerArea, PK=M.DEF.partnerPark;
  window.__renderDoc=()=>{ const ps=PS(), rs=ps.map(p=>M.run({...st,price:p}));
    const row=(n,fn,cls='')=>`<tr class="${cls}"><td>${n}</td>${rs.map((r,i)=>`<td class="r">${f(fn(r,ps[i]))}</td>`).join('')}</tr>`;
    const h=n=>`<tr class="sub"><td colspan="${rs.length+1}"><b>${n}</b></td></tr>`;
    const r0=rs[0], devArea=r0.sell-PA;
    $('#docmodel').innerHTML='<tr><th>Статья</th>'+ps.map(p=>`<th class="r">Цена ${usd(p)} за м²</th>`).join('')+'</tr>'
     +h('Доход')+row(`Квартиры, ${nf(r0.apt,1)} м²`,r=>r.revApt)+row(`Коммерческие, ${nf(r0.com,1)} м²`,r=>r.revCom)+row(`Паркинг, ${r0.a.parkN} мест × ${usd(r0.a.parkPrice)}`,r=>r.revPark)+row('Общий доход',r=>r.G,'tot')
     +h('Распределение прибыли — Партнёр (собственник участка)')+row(`Общая площадь, минимально ${nf(PA)} м²`,(r,p)=>PA*p)+row(`Паркинг, ${PK} мест`,r=>r.a.partnerParkValue)+row('Реализация доли в УК',r=>r.P)
     +row('Земельный участок',r=>r.a.landValue)+row('Чистая прибыль, $',r=>r.partnerNet,'tot')+row('Чистая прибыль, ₸',r=>tg(r.partnerNet))
     +h('Застройщик')+row(`Общая площадь, минимально ${nf(devArea,1)} м²`,(r,p)=>devArea*p)+row(`Паркинг, ${r0.a.parkN-PK} мест`,r=>r.revPark-r.a.partnerParkValue)
     +row('Доход застройщика до налогообложения',(r,p)=>devArea*p+r.revPark-r.a.partnerParkValue)+row('Приобретение доли в УК',r=>r.P)+row('НДС начисленный 16%',r=>r.vatOut)+row('НДС к возмещению 16%',r=>r.vatIn)
     +row('НДС к оплате',r=>r.vatPay)+row('Доход за минусом НДС',r=>r.rev)+row('Стоимость строительства',r=>r.costEx)+row('Доход за минусом строительных работ',r=>r.rev-r.costEx)
     +row('КПН 20%',r=>r.cit)+row('Чистый доход — всего',r=>r.netAll)+row('Чистая прибыль застройщика, $',r=>r.devNet,'tot')+row('Чистая прибыль застройщика, ₸',r=>tg(r.devNet))
     +h('Доходность')+row('Строительная компания, на $2 млн',r=>'≈'+pct(r.devNet/st.equity,0))+row('Собственник участка, на $17 млн',r=>pct(r.partnerRoi,0));
  };
  window.__renderDoc();
})();
$('#scen').onclick=e=>{const b=e.target.closest('button'); if(!b) return; setPrice(b.dataset.p);};
recalc();
/* ---------- единая цена для всего сайта ---------- */
function setPrice(v){
  MODE = (v==='cmp') ? 'cmp' : +v; const p = MODE==='cmp' ? 4500 : MODE;
  M.STATE.price=p; st.price=p;
  document.querySelectorAll('#pricesw button').forEach(b=>b.classList.toggle('on',String(b.dataset.p)===String(MODE)));
  renderTypes(); renderChess(); renderExtra(); renderMix(); recalc(); renderPT();
  document.querySelectorAll('[data-pm2]').forEach(e=>e.textContent=J(x=>usd(x)));
  window.dispatchEvent(new CustomEvent('shevprice',{detail:p}));
}
/* тексты, зависящие от цены */
function renderPT(){
  const fx=M.DEF.fx, ROIf=p=>{const r=M.run({...st,price:p}); return [pct(r.partnerRoi,0),'≈'+pct(r.devNet/st.equity,0)];};
  const set=(id,h)=>{const e=document.getElementById(id); if(e) e.innerHTML=h;};
  set('roiOwn', J(p=>ROIf(p)[0])); set('roiDev', J(p=>ROIf(p)[1]));
  set('atP1', `<span>при цене</span> <b>${J(p=>usd(p))}</b>.`); set('atP2', `<span>при цене</span> <b>${J(p=>usd(p))}</b>.`);
  set('gP', J(p=>`${usd(p)} (${nf(p*457,0)} ₸)`)); set('dealP', `${J(p=>usd(p))} за м².`); set('methP', `${J(p=>usd(p))} за м²`);
  set('mktH', `<span>Обоснование цены</span> <span>${J(p=>usd(p))}</span> за м²`);
  set('docNote', `<span>Курс в документе — 457 ₸ за $1</span> (${J(p=>`${usd(p)} = ${nf(p*457,0)} ₸`)}). <span>С учётом корректировки эскизного проекта на премиальный вариант.</span>`);
  const hk=document.querySelector('#heroKpis div:nth-child(4) b'); if(hk) hk.textContent=J(p=>usd(p));
  if(window.__renderMkt) window.__renderMkt();
  if(window.__renderTEP) window.__renderTEP();
}
window.__renderPT=renderPT;
window.SHEV_setPrice=setPrice;
$('#pricesw').innerHTML='<span>Цена за м²</span>'+[...M.PRICES.map(p=>[p,usd(p)]),['cmp','Сравнение']].map(p=>`<button data-p="${p[0]}" class="${String(p[0])===String(MODE)?'on':''}">${p[1]}</button>`).join('');
$('#pricesw').onclick=e=>{const b=e.target.closest('button'); if(b) setPrice(b.dataset.p);};

/* ---------- market ---------- */
(function(){
  const fx=M.DEF.fx, MAX=4100000;
  const team=[['Exclusive Opera · пр. Назарбаева, 124а · реализован ($5 000 на момент продаж)',2300000,null,'от'],['Lumiere · пр. Аль-Фараби, западнее Есентая',null,2500000,'до'],
   ['Авторский дом · Толе би, 42 / Кунаева · участок 20 соток · первый проект Element A · ~90% продано · паркинг 15 млн ₸',2000000,2400000,''],['Diamond by Kusto Home',2300000,null,'от'],
   ['MANIFIQUE · пр. Достык, район Royal Tulip',2500000,4000000,''],['1st BI LUXE · паркинг 12 млн ₸',2000000,3000000,''],['Synergy Towers · коммерческая недвижимость премиум, район Esentai',2300000,null,'от'],
   ['DOSTYQ 300 · пр. Достык · реализован',2200000,3500000,''],['Autograph · ул. Жамакаева, 191 · реализован',2300000,null,'от'],['Selin Residence · ул. Каппарова · реализован',2100000,null,'от']];
  window.__renderMkt=()=>{ const me=[[`<span>ШЕВЧЕНКО · цена проекта</span> <span>${J(p=>usd(p))}</span>`,PS()[0]*fx,PS().length>1?PS()[PS().length-1]*fx:null,'','me']];
  const row=it=>{const [n,a,b,p,cls]=it; const lo=a??b, hi=b??a; const l=(a&&b)?a/MAX*100:0, w=(a&&b)?(b-a)/MAX*100:lo/MAX*100;
    const txt=(a&&b)?`${nf(a/1e6,2)}–${nf(b/1e6,2)}`:`${p?p+' ':''}${nf(lo/1e6,2)}`;
    const ut=(a&&b)?`${usd(a/fx)}–${usd(b/fx)}`:`${p?p+' ':''}${usd(lo/fx)}`;
    return `<div class="bar-row ${cls||''}"><div>${n}</div><div class="track"><div class="fill" style="left:${l}%;width:${Math.max(w,0.8)}%;${p==='от'?'background:linear-gradient(90deg,#9AA59C 70%,rgba(154,165,156,.15))':''}"></div></div><div class="num" style="text-align:right">${txt} млн ₸<br><span class="small muted">${ut} за м²</span></div></div>`;};
  $('#bars1').innerHTML=team.map(row).join('')+me.map(row).join('');
  $('#mktWarn').innerHTML=`<b>Вывод.</b> <span>Премиальные дома Алматы продаются по 2,0–4,0 млн ₸ за м². «Шевченко» выходит на рынок по</span> <b>${J(p=>nf(p*fx/1e6,2))} млн ₸</b> <span>за м² — это вход в премиум-сегмент по привлекательной цене в одной из самых статусных локаций города, рядом с Rixos и городским парком. Для покупателя — квартира в «золотом квадрате» дешевле большинства аналогов, для инвестора — потенциал роста стоимости к сдаче дома.</span>`; };
  window.__renderMkt();
  const tg=v=>v==null?'—':nf(v/1e6,1)+' млн ₸';
  $('#methodComps').innerHTML='<tr><th>#</th><th>Жилой комплекс</th><th class="r">Цена за м², ₸</th><th class="r">Цена за м², $</th></tr>'+team.map((t,i)=>{const [n,a,b,p]=t;
    const ts=(a&&b)?`${tg(a)} – ${tg(b)}`:`${p} ${tg(a??b)}`, us=(a&&b)?`${usd(a/fx)} – ${usd(b/fx)}`:`${p} ${usd((a??b)/fx)}`;
    return `<tr><td>${i+1}</td><td style="font-family:inherit">${n}</td><td class="r">${ts}</td><td class="r">${us}</td></tr>`;}).join('');
  const C=[['Exclusive Opera','Exclusive Qurylys','+7 705 924 88 03 (колл-центр ЖК)<br>+7 727 339 77 70 · +7 700 777 88 78','ул. Кабанбай батыра, 104 (центральный офис); ЖК — Кабанбай батыра, 81','https://ex-opera.kz/','ex-opera.kz'],
   ['Lumiere','BAZIS-A','+7 727 2 777-727','пр. Аль-Фараби, 69Б, комплекс LUMIERE','https://lumiere.bazis.kz/','lumiere.bazis.kz'],
   ['Авторский дом 42','Element A','+7 777 406 56 66','офис: ул. Керей-Жанибек хандар, 109/1; Пн–Пт 10–18, Сб 10–16','https://dom42.kz/','dom42.kz'],
   ['Diamond','Kusto Home','+7 700 836 97 65','ул. Брауна, 24/4; Пн–Пт 9–20, Сб–Вс 10–20','https://kustohome.kz/en/contacts/','kustohome.kz'],
   ['MANIFIQUE','BAZIS-A','+7 727 2 777-777','ЖК: пр. Достык, 292/3','https://sales.bazis.kz/contacts','sales.bazis.kz'],
   ['1st by BI Luxe','BI Group','360 (короткий номер)','ул. Тимирязева, 28в, БЦ «Алатау Гранд»','https://bi.group/ru/contacts/almaty','bi.group'],
   ['Synergy Towers','Synergy Build','+7 707 88 44 000','пр. Аль-Фараби, 77/2, блок Б, офис 1D; ЖК — ул. Касымова, 31','https://synergytowers.kz/','synergytowers.kz'],
   ['DOSTYQ 300','Sensata Group','700 (единый колл-центр)','ЖК: пр. Достык, 300','https://sensata.kz/project/dostyq-300','sensata.kz'],
   ['Autograph','AKAS Development','+7 771 944 40 44','ул. Жамакаева, 191; ежедневно 9–18','https://autograph-akas.kz/','autograph-akas.kz'],
   ['Selin Residence','EPC Group','+7 727 355 50 61 · +7 727 355 50 62 (центральный офис)','пр. Сейфуллина, 609, БЦ «Forum», 5 этаж; ЖК — ул. Каппарова, 254в','https://epc.group/projects/grazhdanskoe-zhiloe-stroitelstvo/zhiloy-kompleks-selin-residence/','epc.group']];
  $('#contacts').innerHTML='<tr><th>Проект</th><th>Застройщик</th><th>Телефон отдела продаж</th><th>Офис продаж / адрес</th><th>Источник</th></tr>'+
    C.map(c=>`<tr><td><b>${c[0]}</b></td><td>${c[1]}</td><td class="num" style="white-space:nowrap">${c[2]}</td><td class="small">${c[3]}</td><td class="small"><a href="${c[4]}">${c[5]}</a></td></tr>`).join('')+
    '<tr><td colspan="5" class="small muted">Короткие номера 360 и 700 работают с мобильных телефонов в Казахстане.</td></tr>';
})();

/* ---------- TEP ---------- */
(function(){
  const rows=[['Адрес','г. Алматы, Алмалинский р-н, ул. Амангельды, 78 — между ул. Жамбыла и ул. Шевченко'],['Кадастровые номера','20-311-016-133 (0,6560 га, собственность) и 20-311-016-165 (0,2286 га, аренда)'],['Разрешительная стадия','АПЗ KZ32VUA00382944 от 12.03.2021; эскизный проект'],['Участок','8 846 м² (≈ 88 соток)'],['Пятно застройки','2 380,5 м² · 2 блока по 53,14 × 22,40 м, 4 подъезда'],['Этажность','9 этажей: 1 — коммерция с антресолью, 2–9 — квартиры; + 3 этажа паркинга'],
   ['Общая площадь надземная','23 787,6 м²'],['Продаваемая площадь','19 628,4 м² (квартиры 15 000,0 + коммерция 4 628,4)'],['Квартиры на этаже подъезда','4 резиденции по 117,2 м² (468,8 м² на этаж подъезда ≤ 500 м²)'],['Квартир','128 · по 4 на этаже в подъезде'],['Паркинг','2 уровня, 230 мест (+70 к таблице: +$2.100.000); 160 в продаже по финмодели'],['Сад на крыше','сады всех четырёх подъездов'],
   ['Подъездов / лифтов','4 / 8 — по 2 лифта и лестнице Н2 в подъезде'],['Цена продажи',null],['Рядом','отель Rixos Almaty, городской парк']];
  window.__renderTEP=()=>{ $('#tep').innerHTML='<tr><th>Показатель</th><th class="r">Значение</th></tr>'+rows.map(r=>`<tr><td>${r[0]}</td><td class="r">${r[1]??J(p=>usd(p))+' за м²'}</td></tr>`).join(''); };
  window.__renderTEP();
})();

/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('section .wrap > *').forEach(el=>{el.classList.add('reveal');io.observe(el);});
/* ---------- конструктор этажа (интерактивный) ---------- */
(function(){
  const b=$('#kbtn'); if(!b||!window.KPOLY) return;
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
      <div class="serif" style="font-size:44px;line-height:1.1">${J(p=>usd(Math.round(a*p)))}</div>
      <table class="rooms num" style="margin-top:14px"><tr><td>Площадь</td><td>${m2(a)}</td></tr><tr><td>Объединяемые квартиры</td><td>${NM(g)}</td></tr><tr><td>Спальни</td><td>до ${n*3}</td></tr><tr><td>Машино-места</td><td>${n*2}</td></tr><tr><td>Цена за м²</td><td>${J(p=>usd(p))}</td></tr></table>
      <p class="small muted" style="margin-top:12px">${TX[v]}</p></div></div>`;
  }
  function open(g){ if(g.length===1) openModal(typeHTML(g)); else openModal(groupHTML(g)); }
  function draw(){
    b.querySelectorAll('button').forEach(x=>x.classList.toggle('on',+x.dataset.v===v)); img.src='img/var-'+v+'.jpg';
    const c=KP.core;
    svg.innerHTML=KP.v[v].map(q=>`<polygon data-g="${q.g}" points="${q.pts.map(p=>p.join(',')).join(' ')}"/>`).join('')+`<rect x="${c[0][0]}" y="${c[0][1]}" width="${c[1][0]-c[0][0]}" height="${c[1][1]-c[0][1]}"/>`;
    cards.innerHTML=KP.v[v].map(q=>`<button data-g="${q.g}" style="--c:${GC[q.g]}"><span><i></i>${q.g.length>1?'Резиденция '+NM(q.g):'Квартира '+q.g}</span><b>${m2(area(q.g))}</b><span>${J(p=>usd(Math.round(area(q.g)*p)))}</span></button>`).join('');
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
