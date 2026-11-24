/* Рум-тур по квартире: проход от входной двери по помещениям плана */
(function(){
const M=window.SHEV;
const PH={h:'tour/img/c-hall.jpg',hall:'tour/img/c-lobby.jpg',liv:'tour/img/c-living.jpg',kit:'img/ph16.jpg',mas:'tour/img/c-master.jpg',bed:'tour/img/c-bed.jpg',bath:'tour/img/c-bath.jpg',ens:'tour/img/c-ens.jpg',ward:'tour/img/c-ens.jpg',lau:'tour/img/c-bath.jpg',off:'img/ph15.jpg'};
const pic=r=>/Прихож|Входн/.test(r.n)?PH.h:/Холл/.test(r.n)?PH.hall:/Гости/.test(r.n)?PH.liv:/Кухня/.test(r.n)?PH.kit:/Кабинет/.test(r.n)?PH.off:/Мастер/.test(r.n)?PH.mas:r.t==='b'?PH.bed:r.t==='w'?PH.ward:/мастер/.test(r.n)?PH.ens:PH.bath;
const TXT=r=>({h:'Вход в квартиру: тёплый свет, камень и дерево.',l:'Светлое пространство с панорамными окнами.',b:'Тихая спальня с видом во двор-сад.',w:'Гардеробная с системой хранения до потолка.',t:'Санузел с натуральным камнем и тёплым светом.'})[r.t];
window.SHEV_tour=function(box){
  if(box.__tour){ return; } box.__tour=1; box.innerHTML='';
  const wrap=document.createElement('div'); wrap.className='tr2'; box.appendChild(wrap);
  let k=M.TYPE_KEYS[1], i=0, timer=null;
  const css=document.createElement('style'); css.textContent=`.tr2{position:absolute;inset:0;display:grid;grid-template-columns:1.1fr 1fr;gap:0;background:#0E1612;color:#efe7d6}.tr2 .pl{padding:22px;overflow:auto;background:#FFFDF8}.tr2 .pl .pr{transition:fill .4s}.tr2 .pl .pr.on{fill:#E8C97A!important;stroke:#B8862F;stroke-width:5}.tr2 .ph{position:relative;min-height:240px}.tr2 .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .5s}.tr2 .cap{position:absolute;left:0;right:0;bottom:0;padding:70px 26px 78px;background:linear-gradient(transparent,rgba(8,14,11,.92))}.tr2 .cap h3{font:500 34px 'Cormorant Garamond',serif;margin:0}.tr2 .cap p{margin:6px 0 0;color:#cfc6b0;font-size:15px}.tr2 .cap b{color:#E3C894}.tr2 .ctl{position:absolute;left:22px;right:22px;bottom:18px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.tr2 .ctl button{background:rgba(255,255,255,.1);border:1px solid rgba(227,200,148,.5);color:#fff;border-radius:999px;padding:9px 16px;font:600 13px Manrope,sans-serif;cursor:pointer}.tr2 .ctl button.on{background:#C9A66B;color:#1c1a14}.tr2 .ctl .sp{flex:1}.tr2 .ty{position:absolute;top:14px;left:14px;right:14px;display:flex;gap:8px;flex-wrap:wrap}.tr2 .ty button{background:rgba(14,22,18,.7);border:1px solid rgba(227,200,148,.4);color:#efe7d6;border-radius:999px;padding:7px 13px;font:600 12.5px Manrope,sans-serif;cursor:pointer}.tr2 .ty button.on{background:#C9A66B;color:#1c1a14}@media(max-width:800px){.tr2{grid-template-columns:1fr;grid-template-rows:42% 58%}.tr2 .cap{padding:40px 16px 70px}.tr2 .cap h3{font-size:24px}}`;
  document.head.appendChild(css);
  function draw(){
    const ord=M.TYPE_KEYS&&window.SHEV_planOrder(k), r=ord[i];
    wrap.innerHTML=`<div class="pl">${window.SHEV_planSVG(k)}</div><div class="ph"><img src="${pic(r)}" alt="${r.n}"><div class="ty">${M.TYPE_KEYS.map(t=>`<button data-t="${t}" class="${t===k?'on':''}">${M.TYPES[t].rooms}-к · ${M.TYPES[t].total} м²</button>`).join('')}</div><div class="cap"><p><b>${i+1} / ${ord.length}</b> · ${M.TYPES[k].rooms}-комнатная, ${M.TYPES[k].total} м²</p><h3><span>${r.n}</span> · ${r.m.toFixed(1).replace('.',',')} м²</h3><p>${TXT(r)}</p></div><div class="ctl"><button data-a="prev">←</button><button data-a="play" class="${timer?'on':''}">${timer?'⏸ Пауза':'▶ Автопрогулка'}</button><button data-a="next">→</button></div></div>`;
    const rect=wrap.querySelector(`.pr[data-i="${r.i}"]`); if(rect) rect.classList.add('on');
  }
  wrap.onclick=e=>{ const b=e.target.closest('button'); if(!b) return; const n=window.SHEV_planOrder(k).length;
    if(b.dataset.t){ k=b.dataset.t; i=0; }
    else if(b.dataset.a==='next') i=(i+1)%n; else if(b.dataset.a==='prev') i=(i-1+n)%n;
    else if(b.dataset.a==='play'){ if(timer){clearInterval(timer);timer=null;} else timer=setInterval(()=>{ i=(i+1)%window.SHEV_planOrder(k).length; draw(); },3200); }
    draw(); };
  const pr=wrap.addEventListener('click',()=>{},{passive:true});
  draw();
};
})();
