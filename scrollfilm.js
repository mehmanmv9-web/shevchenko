/* Scroll-film: видео «3D-макет → реалистичный рендер», перематывается скроллом страницы */
(function(){
  var SRC='film/shevchenko-scroll.mp4';
  var L={
    ru:{eyebrow:'Прогулка по дому',h:'От участка до квартиры — в одном скролле',lead:'Прокручивайте страницу: сверху 3D-макет, снизу тот же кадр в реалистичной визуализации.',top:'3D-макет',bot:'Визуализация',caps:['Участок и квартал','Фасад и двор','Главный вход','Холл и коридор','Гостиная и кухня','Спальня'],hint:'Листайте вниз'},
    en:{eyebrow:'Walk-through',h:'From the plot to the apartment in one scroll',lead:'Scroll the page: the 3D model on top, the same frame as a realistic render below.',top:'3D model',bot:'Render',caps:['Site and block','Facade and courtyard','Main entrance','Hall and corridor','Living room and kitchen','Bedroom'],hint:'Scroll down'}
  };
  var lang=(document.documentElement.lang||'ru').slice(0,2); var T=L[lang]||L.ru;
  var css='#film{padding:0;border-top:1px solid var(--line);background:#14201a;color:#f3ecdc;position:relative}'
   +'#film .fh{max-width:760px;margin:0 auto;padding:84px 22px 30px;text-align:center}'
   +'#film .eyebrow{color:#c9a86c}#film h2{color:#f3ecdc;margin:10px 0 12px}#film .lead{color:#cfc7b4;margin:0 auto}'
   +'#film .track{height:520vh;position:relative}'
   +'#film .stick{position:sticky;top:0;height:100vh;display:flex;align-items:center;justify-content:center;gap:48px;padding:70px 22px 0;box-sizing:border-box}'
   +'#film .frame{position:relative;height:min(calc(100vh - 96px),calc(92vw*16/9));aspect-ratio:9/16;border-radius:22px;overflow:hidden;background:#000;box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 1px rgba(201,168,108,.35)}'
   +'#film video{width:100%;height:100%;object-fit:cover;display:block}'
   +'#film .tag{position:absolute;left:12px;font:600 10.5px/1 Inter,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#fff;background:rgba(20,32,26,.72);border:1px solid rgba(201,168,108,.6);padding:7px 11px;border-radius:99px;backdrop-filter:blur(4px)}'
   +'#film .tag.t{top:12px}#film .tag.b{top:calc(50% + 12px)}'
   +'#film .side{width:300px;display:flex;flex-direction:column;gap:18px}'
   +'#film .cap{font:500 34px/1.12 Georgia,serif;min-height:2.4em;color:#f3ecdc;transition:opacity .25s}'
   +'#film .steps{display:flex;flex-direction:column;gap:9px}'
   +'#film .steps i{display:flex;align-items:center;gap:10px;font:500 13px/1 Inter,sans-serif;color:#8f9a8f;font-style:normal;transition:color .25s}'
   +'#film .steps i:before{content:"";width:22px;height:1px;background:#52604f;transition:all .25s}'
   +'#film .steps i.on{color:#f3ecdc}#film .steps i.on:before{width:40px;background:#c9a86c}'
   +'#film .bar{height:2px;background:#2d3a32;border-radius:2px;overflow:hidden}#film .bar b{display:block;height:100%;width:0;background:#c9a86c}'
   +'#film .hint{font:500 12px/1 Inter,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8f9a8f}'
   +'@media(max-width:860px){#film .side{position:absolute;left:0;right:0;bottom:6vh;width:auto;padding:0 28px;gap:10px;pointer-events:none;z-index:3}#film .steps,#film .hint{display:none}#film .cap{font-size:22px;min-height:0;text-shadow:0 2px 14px rgba(0,0,0,.85)}#film .frame{height:calc(100vh - 150px);width:100vw;aspect-ratio:auto;border-radius:0;box-shadow:none}#film .stick{padding:150px 0 0;align-items:flex-start}#film .track{height:420vh}}';
  var st=document.createElement('style'); st.id='filmcss'; st.textContent=css; document.head.appendChild(st);
  var sec=document.createElement('section'); sec.id='film'; sec.hidden=true;
  sec.innerHTML='<div class="fh"><div class="eyebrow">'+T.eyebrow+'</div><h2>'+T.h+'</h2><p class="lead">'+T.lead+'</p></div>'
   +'<div class="track"><div class="stick"><div class="frame"><video muted playsinline preload="auto" tabindex="-1"></video><span class="tag t">'+T.top+'</span><span class="tag b">'+T.bot+'</span></div>'
   +'<div class="side"><div class="cap"></div><div class="steps">'+T.caps.map(function(c){return'<i>'+c+'</i>'}).join('')+'</div><div class="bar"><b></b></div><div class="hint">'+T.hint+'</div></div></div></div>';
  var anchor=document.getElementById('s3d'); if(!anchor||!anchor.parentNode) return;
  anchor.parentNode.insertBefore(sec,anchor);
  var v=sec.querySelector('video'),track=sec.querySelector('.track'),cap=sec.querySelector('.cap'),steps=sec.querySelectorAll('.steps i'),bar=sec.querySelector('.bar b');
  var B=[0,.133,.267,.378,.582,.898,1];var dur=0,target=0,cur=0,idx=-1,ok=false;
  v.addEventListener('loadedmetadata',function(){dur=v.duration;ok=true;sec.hidden=false;v.currentTime=0.001;tick()});
  v.addEventListener('error',function(){sec.hidden=true});
  v.src=SRC;
  function prog(){var r=track.getBoundingClientRect(),h=r.height-innerHeight;return Math.min(1,Math.max(0,-r.top/h))}
  function tick(){
    if(!ok){return}
    target=prog()*dur; cur+=(target-cur)*0.18; if(Math.abs(target-cur)<0.004)cur=target;
    if(Math.abs(v.currentTime-cur)>0.02) try{v.currentTime=cur}catch(e){}
    var p=dur?cur/dur:0; bar.style.width=(p*100)+'%';
    var i=0;for(var q=1;q<B.length-1;q++){if(p>=B[q])i=q}
    if(i!==idx){idx=i;cap.textContent=T.caps[i];for(var k=0;k<steps.length;k++)steps[k].classList.toggle('on',k===i)}
    requestAnimationFrame(tick);
  }
  addEventListener('scroll',function(){},{passive:true});
})();
