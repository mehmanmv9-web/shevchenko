(function(){
function init(){
const M=window.SHEV,UI=window.SHEV_UI; if(!M||!UI||!document.getElementById('mfSeg')) return;
if(window.__mfInit) return; window.__mfInit=1;
const {nf,usd,U}=UI, T=M.TYPES, P=M.PRICES;
const LEV={2:7.0,3:10.3,4:13.6,5:16.9,6:20.2,7:23.5,8:26.8,9:30.1};
const $=id=>document.getElementById(id), seg=$('mfSeg'), fls=$('mfFls'), stage=$('mfStage'), card=$('mfCard');
const fmt=v=>v.toFixed(1).replace('.',',');
let sec=2, fl=5, no=null;
M.SECTIONS.forEach(s=>seg.insertAdjacentHTML('beforeend','<button data-s="'+s.n+'">'+s.n+'</button>'));
[...M.FLOORS].reverse().forEach(f=>fls.insertAdjacentHTML('beforeend','<button data-f="'+f+'">'+f+'<small>+'+fmt(LEV[f])+' м</small></button>'));
const kon=$('mfKon'); if(kon) kon.parentNode&&(kon.previousElementSibling&&kon.previousElementSibling.remove(),kon.remove());
function draw(){
  seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.s===sec));
  fls.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.f===fl));
  const us=U.filter(u=>u.section===sec&&u.floor===fl).sort((a,b)=>a.pos-b.pos);
  if(!us.find(u=>u.no===no)) no=us[0].no;
  const u=us.find(x=>x.no===no), v=T[u.type];
  stage.className='mf2-stage'; stage.innerHTML=window.SHEV_floorSVG(sec,fl,no);
  $('mfNote').textContent='Подъезд '+sec+' · '+fl+' этаж · отметка пола +'+fmt(LEV[fl])+' м над ±0,000. Нажмите на квартиру, чтобы увидеть её планировку.';
  card.innerHTML='<h3 style="color:'+v.color+'">Квартира №'+u.no+' · '+v.rooms+'-комнатная</h3><div class="sub">'+nf(u.area,0)+' м² · '+v.rooms+' комнат</div>'+
  '<table><tr><td>Подъезд / этаж</td><td>'+sec+' / '+fl+'</td></tr><tr><td>Отметка пола</td><td>+'+fmt(LEV[fl])+' м</td></tr>'+
  '</table>'+
  '<div class="planbox" style="margin:14px 0">'+window.SHEV_planSVG(u.type)+'</div><button class="btn2" id="mfOpen">Открыть карточку квартиры</button>';
  $('mfOpen').onclick=()=>window.SHEV_unitCard&&window.SHEV_unitCard(u.no);
}
seg.onclick=e=>{const b=e.target.closest('button'); if(b){sec=+b.dataset.s; draw();}};
fls.onclick=e=>{const b=e.target.closest('button'); if(b){fl=+b.dataset.f; draw();}};
stage.onclick=e=>{const g=e.target.closest('g[data-no]'); if(g){no=g.dataset.no; draw();}};
addEventListener('keydown',e=>{ if(!document.querySelector('#myfloor:hover')) return; if(e.key==='ArrowUp'&&fl<9){fl++;draw();e.preventDefault()} if(e.key==='ArrowDown'&&fl>2){fl--;draw();e.preventDefault()} if(e.key==='ArrowLeft'&&sec>1){sec--;draw()} if(e.key==='ArrowRight'&&sec<4){sec++;draw()} });
function tariffs(){}
draw(); tariffs();
}
if(document.readyState!=='loading') setTimeout(init,0); else addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
addEventListener('load',()=>init());
})();

/* кнопка «Открыть скан оригинала» появляется, только если файл img/arbat-letter-scan.jpg загружен на сайт */
(function(){const b=document.getElementById('lscanBtn'), im=document.getElementById('lscanImg'); if(!b||!im||!window.SHEV_HAS_LETTER_SCAN) return; /* файл не загружен: включить, выставив window.SHEV_HAS_LETTER_SCAN=true */
  const p=new Image(); p.onload=()=>{ im.src=p.src; im.hidden=false; im.style.cssText='display:block;max-width:180px;margin-top:10px;border:1px solid #ccc;cursor:zoom-in'; b.hidden=false; b.onclick=ev=>{ev.preventDefault(); im.click();}; }; p.src='img/arbat-letter-scan.jpg';})();
