/* Личная презентация по ссылке: выбираете квартиру — получаете страницу-предложение (планировка с расстановкой мебели, фото, цена, ссылка).
   Цена = площадь квартиры × цена м² (та же формула, что и в таблице цен). Ссылка вида …#kp-2-5-A-5000 открывает именно эту квартиру. */
(function(){
const M=window.SHEV; if(!M) return;
const T=M.TYPES, U=M.units(), FX=M.DEF.fx;
const nf=(x,d=0)=>{const f=Math.abs(x).toFixed(d),[i,r]=f.split('.');return (x<0?'−':'')+i.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(r?','+r:'');};
const usd=x=>'$'+nf(Math.round(x));
const ART='https://mehmanmv9-web.github.io/shevchenko/';
const css=document.createElement('style');css.textContent=`
#kp{position:fixed;inset:0;z-index:290;background:#F5F1E9;color:#1D2A24;display:none;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
#kp.on{display:block}
#kp .kbar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:12px clamp(14px,3vw,32px);background:rgba(245,241,233,.94);backdrop-filter:blur(10px);border-bottom:1px solid #DDD4C3}
#kp .kbar b{font-family:'Cormorant Garamond',serif;letter-spacing:.26em;color:#1F3A2E;font-size:15px;font-weight:600}
#kp .kbar span{flex:1;color:#6B6F66;font-size:12px}
#kp .kx{width:40px;height:40px;border-radius:50%;border:1px solid #1D2A2455;background:transparent;font-size:17px;cursor:pointer;color:#1D2A24}
#kp .kx:hover{background:#1F3A2E;color:#fff}
#kp .sel{max-width:1180px;margin:0 auto;padding:22px clamp(14px,3vw,32px) 6px}
#kp .sel .row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:10px}
#kp .sel .row>em{font-style:normal;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#A8864F;font-weight:600;min-width:74px}
#kp .sel button{min-width:42px;padding:8px 12px;border-radius:9px;border:1px solid #DDD4C3;background:#FBF9F5;color:#1D2A24;cursor:pointer;font-family:inherit;font-size:14px}
#kp .sel button.on{background:#1F3A2E;color:#fff;border-color:#1F3A2E}
#kp .hero{position:relative;margin:10px auto 0;max-width:1180px;border-radius:20px;overflow:hidden;min-height:clamp(320px,52vw,520px);background:#222 center/cover;display:flex;align-items:flex-end}
#kp .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,9,6,.82),rgba(10,9,6,.1) 60%)}
#kp .hero .in{position:relative;z-index:2;padding:clamp(18px,4vw,44px);color:#fff;width:100%}
#kp .hero .e{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#E3C894;font-weight:600;margin-bottom:10px}
#kp .hero h1{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(40px,7vw,84px);line-height:.98;margin-bottom:8px}
#kp .hero .sub{font-size:clamp(14px,1.8vw,18px);color:#ffffffd8;max-width:720px}
#kp .hero .kp3{display:flex;gap:clamp(14px,3vw,40px);margin-top:18px;flex-wrap:wrap}
#kp .hero .kp3 div{min-width:110px}#kp .hero .kp3 small{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#E3C894}
#kp .hero .kp3 b{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(26px,3.6vw,40px)}
#kp .pg{max-width:1180px;margin:0 auto;padding:clamp(24px,4vw,50px) clamp(14px,3vw,32px) 80px}
#kp h2{font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(28px,4vw,44px);line-height:1.05;margin:0 0 14px}
#kp .eb{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#A8864F;font-weight:600;margin-bottom:10px}
#kp .two{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(18px,3vw,44px);align-items:start;margin-bottom:clamp(30px,5vw,64px)}
#kp table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
#kp td{padding:8px 0;border-bottom:1px solid #DDD4C3;font-size:14px}#kp td:last-child{text-align:right;font-weight:500}
#kp tr.sum td{font-weight:700;border-bottom:2px solid #1F3A2E}
#kp .gal{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:6px 0 clamp(30px,5vw,64px)}
#kp .gal figure{position:relative;overflow:hidden;border-radius:12px;aspect-ratio:4/3;background:#ddd;margin:0}
#kp .gal figure:first-child{grid-column:span 2;grid-row:span 2;aspect-ratio:auto}
#kp .gal img{width:100%;height:100%;object-fit:cover;display:block;cursor:zoom-in;transition:transform .6s}
#kp .gal figure:hover img{transform:scale(1.05)}
#kp .gal figcaption{position:absolute;left:10px;bottom:8px;color:#fff;font-size:12px;text-shadow:0 1px 6px #000}
#kp .price{background:#1F3A2E;color:#fff;border-radius:18px;padding:clamp(20px,3.4vw,38px);margin-bottom:clamp(30px,5vw,64px)}
#kp .price .big{font-family:'Cormorant Garamond',serif;font-size:clamp(40px,6vw,72px);line-height:1}
#kp .price .m{white-space:normal;color:#ffffffb8;font-size:14px;margin-top:6px}
#kp .price .tiers{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
#kp .price .tiers button{padding:9px 14px;border-radius:99px;border:1px solid #ffffff55;background:transparent;color:#fff;cursor:pointer;font-family:inherit}
#kp .price .tiers button.on{background:#C9A86C;border-color:#C9A86C;color:#111}
#kp .price .slid{margin-top:18px;padding-top:16px;border-top:1px solid #ffffff30}
#kp .price input[type=range]{width:100%;accent-color:#C9A86C}
#kp .price .calc{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:10px}
#kp .price .calc div{background:#ffffff12;border-radius:12px;padding:12px 14px}#kp .price .calc small{display:block;color:#ffffffa8;font-size:12px}#kp .price .calc b{font-size:20px;font-weight:600}
#kp .big,#kp .kp3 b,#kp .calc b,#kp .tiers button,#kp .m{white-space:nowrap}#kp .price .nt{font-size:12px;color:#ffffff90;margin-top:12px}
#kp .loc{display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(18px,3vw,40px);align-items:center;margin-bottom:clamp(30px,5vw,64px)}
#kp .loc img{width:100%;border-radius:16px;display:block;cursor:zoom-in}
#kp .loc ul{padding-left:18px;color:#3C443F;font-size:15px;line-height:1.8}
#kp .act{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 18px}
#kp .kb{display:inline-flex;align-items:center;gap:8px;padding:13px 20px;border-radius:10px;border:1px solid #A8864F;background:#A8864F;color:#fff;font-size:13px;letter-spacing:.05em;cursor:pointer;font-family:inherit;text-decoration:none}
#kp .kb.g{background:transparent;color:#1F3A2E;border-color:#1F3A2E}#kp .kb.d{background:#1F3A2E;border-color:#1F3A2E}
#kp .act .kb.d{flex:1 1 100%;justify-content:center}#kp .act{gap:12px 10px}#kp .kr svg{width:21px;height:21px;display:block;filter:drop-shadow(0 1px 0 rgba(255,252,240,.95)) drop-shadow(0 -.6px 0 rgba(90,68,30,.45))}#kp .kr:hover{filter:brightness(1.06)}
#kp .kb:hover{filter:brightness(1.1)}
#kp .kr{color:#8a7650;width:44px;height:44px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:2px solid #b49a68;cursor:pointer;background:radial-gradient(120% 160% at 30% 0%,#f4ecd9 0%,#e6d9ba 55%,#d9c9a2 100%);box-shadow:inset 0 1px 0 #fffaf0,inset 0 -2px 3px rgba(120,92,48,.35),0 0 0 3px #f1e8d2,0 0 0 4px #b49a68,0 6px 16px rgba(30,24,10,.25);margin:4px 8px 4px 4px;text-decoration:none}#kp .kr svg{width:22px;height:22px;display:block}#kp .kr:hover{filter:brightness(1.06)}

#kp .link{width:100%;padding:11px 13px;border:1px dashed #A8864F;border-radius:10px;background:#FBF9F5;font-size:13px;word-break:break-all;color:#3C443F}
#kp .ct{background:#FBF9F5;border:1px solid #DDD4C3;border-radius:16px;padding:22px;display:flex;gap:22px;flex-wrap:wrap;align-items:center;justify-content:space-between}
#kp .ct b{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:500}
@media(max-width:760px){#kp .two,#kp .loc{grid-template-columns:1fr}#kp .gal{grid-template-columns:1fr 1fr}#kp .gal figure:first-child{grid-column:span 2;grid-row:auto;aspect-ratio:4/3}}
`;document.head.appendChild(css);

const root=document.createElement('div');root.id='kp';
root.innerHTML='<div class="kbar"><b>ШЕВЧЕНКО</b><span>Личная презентация</span><button class="kx" id="kX" aria-label="Закрыть">✕</button></div><div id="kBody"></div>';
document.body.appendChild(root);
const $=s=>root.querySelector(s);

let st={sec:2,fl:5,ty:'A',price:M.STATE.price||4500};
const unit=()=>U.find(u=>u.section===st.sec&&u.floor===st.fl&&u.type===st.ty);
const hashOf=()=>`kp-${st.sec}-${st.fl}-${st.ty}-${st.price}`;
const urlOf=()=>{ const base=(/(claude|anthropic)/.test(location.hostname)||!/^https?:/.test(location.protocol))?ART:location.href.split('#')[0]; return base+'#'+hashOf(); };

function render(){
  const u=unit(), v=T[st.ty], rooms=(u.end&&v.rEnd)?v.rEnd:v.r, tot=Math.round(u.area*st.price);
  const imgs=[['ph16-4k','Кухня-гостиная'],['ph15-4k','Мастер-спальня'],['tour/kitchen','Кухня'],['ph04-4k','Прихожая и гостиная'],['tour/bed2','Спальня'],['tour/bath','Ванная']];
  $('#kBody').innerHTML=`
  <div class="sel">
    <div class="row"><em>Подъезд</em>${[1,2,3,4].map(n=>`<button data-s="${n}" class="${n===st.sec?'on':''}">${n}</button>`).join('')}</div>
    <div class="row"><em>Этаж</em>${M.FLOORS.map(n=>`<button data-f="${n}" class="${n===st.fl?'on':''}">${n}</button>`).join('')}</div>
    <div class="row"><em>Квартира</em>${M.TYPE_KEYS.map(k=>`<button data-t="${k}" class="${k===st.ty?'on':''}">${k}</button>`).join('')}</div>
  </div>
  <div class="hero" style="background-image:url(img/ph16-4k.jpg)"><div class="in">
    <div class="e">Персональное предложение · ЖК «Шевченко» · Алматы</div>
    <h1>Квартира ${u.no}</h1>
    <div class="sub">${v.name} · подъезд ${st.sec} · ${st.fl} этаж · ${v.side}</div>
    <div class="kp3"><div><small>Площадь</small><b>${nf(u.area,1)} м²</b></div><div><small>Цена</small><b>${usd(tot)}</b></div><div><small>≈ в тенге</small><b>${nf(tot*FX/1e6,1)} млн ₸</b></div></div>
  </div></div>
  <div class="pg">
    <div class="act" style="margin-top:0"><a class="kb d" href="javascript:void 0" id="kCopy">Копировать ссылку</a><a class="kr" id="kWa" role="link" tabindex="0" aria-label="WhatsApp" title="WhatsApp"><svg viewBox="0 0 448 512" aria-hidden="true"><defs><linearGradient id="kg0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4b36a"/><stop offset=".55" stop-color="#a8864f"/><stop offset="1" stop-color="#7a5f2c"/></linearGradient></defs><path fill="url(#kg0)" fill-rule="evenodd" d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z"/></svg></a><a class="kr" id="kTg" role="link" tabindex="0" aria-label="Telegram" title="Telegram"><svg viewBox="0 0 512 512" aria-hidden="true"><defs><linearGradient id="kg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4b36a"/><stop offset=".55" stop-color="#a8864f"/><stop offset="1" stop-color="#7a5f2c"/></linearGradient></defs><path fill="url(#kg1)" fill-rule="evenodd" d="M256 8a248 248 0 1 0 0 496 248 248 0 1 0 0-496zM371 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5c-2.2 .5-37.1 23.5-104.6 69.1-9.9 6.8-18.9 10.1-26.9 9.9-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3 .6-4.5 6.7-9 18.4-13.7 72.3-31.5 120.5-52.3 144.6-62.3 68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9 2 1.7 3.2 4.1 3.5 6.7 .5 3.2 .6 6.5 .4 9.8z"/></svg></a><a class="kr" id="kMl" role="link" tabindex="0" aria-label="Gmail" title="Gmail"><svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="kg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4b36a"/><stop offset=".55" stop-color="#a8864f"/><stop offset="1" stop-color="#7a5f2c"/></linearGradient></defs><path fill="url(#kg2)" d="M1.6 6.2C1.6 4.5 3.5 3.5 4.9 4.5L12 9.7l7.1-5.2c1.4-1 3.3 0 3.3 1.7v12.2c0 .8-.6 1.4-1.4 1.4h-3.4V11.7L12 15.9l-5.6-4.2v8.1H3c-.8 0-1.4-.6-1.4-1.4z"/></svg></a></div>
    <div class="link" id="kLink">${urlOf()}</div>
    <div style="height:clamp(26px,4vw,50px)"></div>
    <div class="two"><div><div class="eb">Планировка и расстановка мебели</div><h2>Ваша квартира ${u.no}</h2>${window.SHEV_cropHTML?window.SHEV_cropHTML(st.sec,st.fl,st.ty,true):''}<p style="color:#6B6F66;font-size:12.5px;margin-top:8px">Расстановка мебели — этаж ${st.fl}, подъезд ${st.sec}. Размеры стен и площади не меняются.</p></div>
    <div><div class="eb">Помещения</div><table>${rooms.map(r=>`<tr><td>${r[0]}</td><td>${nf(r[1],1)} м²</td></tr>`).join('')}<tr class="sum"><td>Общая площадь квартиры</td><td>${nf(u.area,1)} м²</td></tr></table>
      <p style="margin-top:14px;color:#3C443F;font-size:14px">${M.PARK_PER_APT} машино-места в подземном паркинге на квартиру · консьерж · два лифта в подъезде</p></div></div>
    <div class="eb">Как будет выглядеть дом внутри</div><h2>Интерьеры</h2>
    <div class="gal">${imgs.map(x=>`<figure><img src="img/${x[0]}.jpg" alt="${x[1]}" data-zoom loading="lazy"><figcaption>${x[1]}</figcaption></figure>`).join('')}</div>
    <div class="price"><div class="eb" style="color:#E3C894">Цена</div>
      <div class="big num" id="kBig">${usd(tot)}</div><div class="m" id="kM">${nf(u.area,1)} м² × ${usd(st.price)}/м² · ≈ ${nf(tot*FX/1e6,2)} млн ₸ (курс ${FX} ₸)</div>
      <div class="tiers">${M.PRICES.map(p=>`<button data-p="${p}" class="${p===st.price?'on':''}">${usd(p)}/м²</button>`).join('')}</div>
      <div class="slid"><label for="kRange" style="font-size:13px;color:#ffffffc8">Первый взнос: <b id="kPct">30</b>% (иллюстрация расчёта)</label><input id="kRange" type="range" min="10" max="100" step="5" value="30">
      <div class="calc"><div><small>Первый взнос</small><b id="kDp"></b></div><div><small>Остаток</small><b id="kRest"></b></div></div></div>
      <div class="nt">Цены — при 100% оплате. Условия рассрочки и ипотеки уточняйте у отдела продаж. Расчёт выше — арифметика для ориентира, это не оферта.</div></div>
    <div class="loc"><img src="img/aerial-day.jpg" alt="Расположение" data-zoom><div><div class="eb">Расположение</div><h2>«Золотой квадрат» Алматы</h2><ul><li>ул. Амангельды, 78 · между ул. Жамбыла и ул. Шевченко</li><li>Рядом Rixos и городской парк</li><li>Двор без машин, паркинг под домом</li><li>9 этажей, 4 подъезда, 4 квартиры на этаже</li></ul></div></div>
    <div class="ct"><div><div class="eb" style="margin-bottom:4px">Отдел продаж</div><b>Arbat Real Estate · Шалаев Виталий</b><div style="color:#6B6F66;font-size:14px">+7 776 173 73 73 · Алматы, пр. Аль-Фараби, 100</div></div><div style="color:#6B6F66;font-size:12px;max-width:320px">Предложение действительно как ознакомительное. Окончательные условия — в договоре.</div></div>
  </div>`;
  const pct=()=>{ const p=+$('#kRange').value; $('#kPct').textContent=p; $('#kDp').textContent=usd(tot*p/100); $('#kRest').textContent=usd(tot*(100-p)/100); };
  $('#kRange').oninput=pct; pct();
  const txt=`Квартира ${u.no} в ЖК «Шевченко» (Алматы): ${nf(u.area,1)} м², ${usd(tot)}. Личная презентация:`, q=encodeURIComponent;
  const arm=(el,fn)=>{ const f=()=>{ el.href=fn(); setTimeout(()=>el.removeAttribute('href'),1500); }; ['pointerdown','touchstart','focus','keydown'].forEach(e=>el.addEventListener(e,f,{passive:true})); el.target='_blank'; el.rel='noopener'; };
  arm($('#kWa'),()=>'https://wa.me/?text='+q(txt+' '+urlOf()));
  arm($('#kTg'),()=>'https://t.me/share/url?url='+q(urlOf())+'&text='+q(txt));
  arm($('#kMl'),()=>`https://mail.google.com/mail/?view=cm&fs=1&su=${q('ЖК «Шевченко» — квартира '+u.no)}&body=${q(txt+'\n'+urlOf())}`);
  $('#kCopy').onclick=async()=>{ const b=$('#kCopy'); try{ await navigator.clipboard.writeText(urlOf()); b.textContent='Ссылка скопирована ✓'; }catch(e){ b.textContent='Выделите ссылку ниже'; const r=document.createRange(); r.selectNodeContents($('#kLink')); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } setTimeout(()=>b.textContent='Копировать ссылку',2500); };
  try{ history.replaceState(null,'','#'+hashOf()); }catch(e){}
}
root.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.id==='kX') return;
  if(b.dataset.s){ st.sec=+b.dataset.s; render(); } else if(b.dataset.f){ st.fl=+b.dataset.f; render(); } else if(b.dataset.t){ st.ty=b.dataset.t; render(); } else if(b.dataset.p){ st.price=+b.dataset.p; render(); } });
function open(o){ if(o){ if(o.sec) st.sec=o.sec; if(o.fl) st.fl=o.fl; if(o.ty) st.ty=o.ty; if(o.price) st.price=o.price; }
  root.classList.add('on'); document.body.style.overflow='hidden'; render(); root.scrollTop=0; }
function close(){ root.classList.remove('on'); document.body.style.overflow=''; try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
$('#kX').onclick=close; addEventListener('keydown',e=>{ if(e.key==='Escape'&&root.classList.contains('on')) close(); });
window.SHEV_openKp=open;
document.addEventListener('click',e=>{ const a=e.target.closest('[data-kp]'); if(a){ e.preventDefault(); open(); } });
function fromHash(){ const m=/^#kp-([1-4])-([2-9])-([A-D])-(\d{4})$/.exec(location.hash); if(m&&M.PRICES.includes(+m[4])) open({sec:+m[1],fl:+m[2],ty:m[3],price:+m[4]}); }
fromHash(); addEventListener('hashchange',()=>{ if(!root.classList.contains('on')) fromHash(); });
})();
