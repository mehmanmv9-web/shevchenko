(function(){
const HOT={"A": [[4.14, 4.84, 45.59, 25.81], [4.14, 30.65, 36.19, 19.36]], "B": [[49.73, 4.84, 46.12, 25.81], [59.66, 30.65, 36.19, 19.36]], "C": [[4.14, 69.37, 45.59, 25.81], [4.14, 50.01, 36.19, 19.36]], "D": [[49.73, 69.37, 46.12, 25.81], [59.66, 50.01, 36.19, 19.36]]};
function init(){
const M=window.SHEV,UI=window.SHEV_UI; if(!M||!UI||!document.getElementById('mfSeg')) return;
if(window.__mfInit) return; window.__mfInit=1;
const {nf,usd,U}=UI, T=M.TYPES, P=M.PRICES;
const LEV={2:7.0,3:10.3,4:13.6,5:16.9,6:20.2,7:23.5,8:26.8,9:30.1};
const $=id=>document.getElementById(id), seg=$('mfSeg'), fls=$('mfFls'), stage=$('mfStage'), card=$('mfCard');
const side={A:'ул. Амангельды, торец дома',B:'ул. Амангельды, у стыка подъездов',C:'двор, торец дома',D:'двор, у стыка подъездов'};
let sec=2, fl=5, key='A', kv=0, kg='';
const GC={A:'#3D6FA8',B:'#2E8B7E',C:'#B8862F',D:'#8E64A8',AC:'#2E4A62',BD:'#7A5436',ABCD:'#1E282E'}, NMG=g=>g.split('').join('+');
const ar=k=>{const u=U.find(z=>z.section===sec&&z.floor===fl&&z.type===k);return u?u.area:T[k].total;};
const KT={1:'Одна резиденция на весь этаж подъезда.',2:'Две резиденции — по половине этажа.',3:'Одна двойная резиденция и две квартиры.',4:'Четыре резиденции вокруг ядра с двумя лифтами.'};
function drawKon(){
  const K=window.KPOLY; if(!K||!K.v||!K.v[kv]){kv=0;return false;}
  stage.classList.remove('flip'); stage.classList.add('kon');
  const im=stage.querySelector('img'), src='img/var-'+kv+'.jpg'; if(im&&im.getAttribute('src')!==src) im.src=src;
  let ks=stage.querySelector('.ksv'); if(!ks){ks=document.createElementNS(NS,'svg'); ks.setAttribute('class','hsv ksv'); ks.setAttribute('preserveAspectRatio','none'); stage.appendChild(ks);}
  ks.setAttribute('viewBox','0 0 '+K.w+' '+K.h);
  ks.innerHTML=K.v[kv].map(q=>'<polygon class="hp kp'+(q.g===kg?' on':'')+'" data-g="'+q.g+'" style="--c:'+GC[q.g]+'" points="'+q.pts.map(p=>p.join(',')).join(' ')+'"/>').join('');
  stage.querySelectorAll('.klb').forEach(n=>n.remove());
  if(kv===3){ [['B',89,19.4],['D',89,80.6]].forEach(([k,lx,ly])=>{ const l=document.createElement('span'); l.className='klb'; l.textContent=k+' · '+fmt(ar(k))+' м²'; l.style.cssText='--c:'+GC[k]+';left:'+lx+'%;top:'+ly+'%'; stage.appendChild(l); }); }
  const gs=K.v[kv].map(q=>q.g);
  $('mfNote').textContent='Подъезд '+sec+' · '+fl+' этаж · вариант: '+kv+' '+(kv===1?'квартира':kv<5&&kv>1?'квартиры':'квартир')+' на этаже. Формат фиксируется в договоре до кладки перегородок.';
  card.innerHTML='<div class="mf2-kon"><h3>'+kv+' '+(kv===1?'квартира':'квартиры')+' на этаже</h3><div class="sub">'+KT[kv]+'</div>'+gs.map(g=>{const a=g.split('').reduce((t,k)=>t+ar(k),0);return '<div class="kg'+(g===kg?' on':'')+'" data-g="'+g+'" style="--c:'+GC[g]+'"><b class="n">'+(g.length>1?'Резиденция '+NMG(g):'Квартира '+g)+'</b><div class="a">'+fmt(a)+' м²</div><div class="muted small">'+(3*g.length)+' спален'+(g.length>1?' · '+g.length+' модуля':'')+'</div><table>'+P.map(p=>'<tr><td>Цена при '+usd(p)+' за м²</td><td><b>'+usd(Math.round(a*p))+'</b></td></tr>').join('')+'</table></div>';}).join('')+'<button class="btn2" id="mfBack" style="margin-top:14px">Вернуться к плану этажа</button></div>';
  $('mfBack').onclick=()=>{kv=0;kg='';draw();};
  return true;
}
const fmt=v=>v.toFixed(1).replace('.',',');
M.SECTIONS.forEach(s=>seg.insertAdjacentHTML('beforeend',`<button data-s="${s.n}">${s.n}</button>`));
[...M.FLOORS].reverse().forEach(f=>fls.insertAdjacentHTML('beforeend',`<button data-f="${f}">${f}<small>+${fmt(LEV[f])} м</small></button>`));
// квартира — один цельный контур (Г-образный), а не два прямоугольника
const PTS={A:[[96,96],[1152,96],[1152,608],[935,608],[935,992],[96,992]],B:[[1152,96],[2221,96],[2221,992],[1383,992],[1383,608],[1152,608]],C:[[96,992],[935,992],[935,1376],[1152,1376],[1152,1888],[96,1888]],D:[[1152,1376],[1383,1376],[1383,992],[2221,992],[2221,1888],[1152,1888]]};
const NS='http://www.w3.org/2000/svg', svg=document.createElementNS(NS,'svg');
svg.setAttribute('viewBox','0 0 2317 1984'); svg.setAttribute('preserveAspectRatio','none'); svg.setAttribute('class','hsv base');
['A','B','C','D'].forEach(k=>{
  const pg=document.createElementNS(NS,'polygon'); pg.setAttribute('class','hp'); pg.dataset.k=k; pg.setAttribute('role','button'); pg.setAttribute('aria-label','Квартира '+k);
  pg.setAttribute('points',PTS[k].map(q=>q.join(',')).join(' ')); pg.style.setProperty('--c',T[k].color); svg.appendChild(pg);
});
stage.appendChild(svg);
['A','B','C','D'].forEach(k=>{ const r=HOT[k][0], l=document.createElement('span'); l.className='lbl'; l.textContent=k; l.style.cssText=`left:${r[0]+r[2]/2}%;top:${r[1]+r[3]/2}%;--c:${T[k].color}`; stage.appendChild(l); });
// у квартиры две части — подсвечиваем обе
function unit(){return U.find(u=>u.section===sec&&u.floor===fl&&u.type===key);}
function draw(){
  seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.s===sec));
  fls.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.f===fl));
  const kon=$('mfKon'); if(kon) kon.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.v===kv));
  if(kv&&drawKon()){ return; }
  stage.classList.remove('kon'); const oks=stage.querySelector('.ksv'); if(oks) oks.remove(); stage.querySelectorAll('.klb').forEach(n=>n.remove());
  stage.classList.add('has'); stage.classList.toggle('flip',sec===1||sec===3);
  const pimg=stage.querySelector('img'), psrc='img/fl/s'+sec+'f'+fl+'.jpg'; if(pimg&&pimg.getAttribute('src')!==psrc) pimg.src=psrc;
  [[sec,fl+1],[sec,fl-1],[sec%4+1,fl]].forEach(q=>{ if(q[1]>=2&&q[1]<=9){ const im=new Image(); im.src='img/fl/s'+q[0]+'f'+q[1]+'.jpg'; } });
  stage.querySelectorAll('.hp').forEach(b=>b.classList.toggle('on',b.dataset.k===key)); stage.querySelectorAll('.lbl').forEach(b=>b.classList.toggle('on',b.textContent===key));
  $('mfNote').textContent='Подъезд '+sec+' · '+fl+' этаж · отметка пола +'+fmt(LEV[fl])+' м над ±0,000. Нажмите на квартиру, чтобы увидеть цену и планировку.';
  const u=unit(); if(!u) return;
  card.innerHTML=`<h3 style="color:${T[key].color}">Квартира ${key} · №${u.no}</h3><div class="sub">${fmt(u.area)} м² · 3 спальни · ${side[key]}</div>
  <table><tr><td>Подъезд / этаж</td><td>${sec} / ${fl}</td></tr><tr><td>Отметка пола</td><td>+${fmt(LEV[fl])} м</td></tr>
  ${P.map(p=>`<tr><td>Цена при ${usd(p)} за м²</td><td><b>${usd(Math.round(u.area*p))}</b></td></tr>`).join('')}</table>
  <button class="btn2" id="mfOpen">Открыть планировку квартиры</button>
  ${window.SHEV_cropHTML?window.SHEV_cropHTML(sec,fl,key):''}
  <p class="muted small" style="margin:8px 0 0">Расстановка мебели в этой квартире · подъезд ${sec} · этаж ${fl}</p><p class="muted small" style="margin:4px 0 0">На каждом этаже и в каждой квартире она своя — переключайте подъезд и этаж.</p>`;
  $('mfOpen').onclick=()=>window.SHEV_unitCard&&window.SHEV_unitCard(u.no);
}
seg.onclick=e=>{const b=e.target.closest('button'); if(b){sec=+b.dataset.s; draw();}};
fls.onclick=e=>{const b=e.target.closest('button'); if(b){fl=+b.dataset.f; draw();}};
stage.onclick=e=>{const b=e.target.closest('.hp'); if(!b) return; if(b.dataset.g){kg=kg===b.dataset.g?'':b.dataset.g; draw();} else {key=b.dataset.k; draw();}};
card.addEventListener('click',e=>{const g=e.target.closest('.kg'); if(g){kg=kg===g.dataset.g?'':g.dataset.g; draw();}});
const konEl=$('mfKon'); if(konEl) konEl.onclick=e=>{const b=e.target.closest('button'); if(!b) return; const v=+b.dataset.v; kv=kv===v?0:v; kg=''; draw();};
addEventListener('keydown',e=>{ if(!document.querySelector('#myfloor:hover')) return; if(e.key==='ArrowUp'&&fl<9){fl++;draw();e.preventDefault()} if(e.key==='ArrowDown'&&fl>2){fl--;draw();e.preventDefault()} if(e.key==='ArrowLeft'&&sec>1){sec--;draw()} if(e.key==='ArrowRight'&&sec<4){sec++;draw()} });
function tariffs(){
  const tot=U.reduce((a,u)=>a+u.area,0);
  $('mfTar').innerHTML=`<table><tr><th>Цена за м²</th>${P.map(p=>`<th>${usd(p)}</th>`).join('')}</tr>
  <tr><td>Квартира 117,2 м²</td>${P.map(p=>`<td>${usd(Math.round(117.2*p))}</td>`).join('')}</tr>
  <tr><td>Этаж подъезда (4 квартиры)</td>${P.map(p=>`<td>${usd(Math.round(4*117.2*p))}</td>`).join('')}</tr>
  <tr><td>Все квартиры · ${nf(tot,1)} м² (128)</td>${P.map(p=>`<td>${usd(Math.round(tot*p))}</td>`).join('')}</tr></table>
  <p class="muted small">Цена = площадь × тариф; квартира D в подъездах 1 и 4 — 117,1 м². Коммерция и паркинг в расчёт не входят.</p>`;
}
draw(); tariffs();
}
if(document.readyState!=='loading') setTimeout(init,0); else addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
addEventListener('load',()=>init());
})();

/* кнопка «Открыть скан оригинала» появляется, только если файл img/arbat-letter-scan.jpg загружен на сайт */
(function(){const b=document.getElementById('lscanBtn'), im=document.getElementById('lscanImg'); if(!b||!im) return;
  const p=new Image(); p.onload=()=>{ im.src=p.src; im.hidden=false; im.style.cssText='display:block;max-width:180px;margin-top:10px;border:1px solid #ccc;cursor:zoom-in'; b.hidden=false; b.onclick=ev=>{ev.preventDefault(); im.click();}; }; p.src='img/arbat-letter-scan.jpg';})();
