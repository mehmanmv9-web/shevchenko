/* Рабочие документы: доступ по паролю; файлы зашифрованы AES-GCM (ключ из пароля, PBKDF2) и расшифровываются в браузере */
(function(){
const css=document.createElement('style');css.textContent=`
#vBtn,#mBtn{position:fixed;top:7px;z-index:91;width:38px;height:38px;padding:0;display:flex;align-items:center;justify-content:center;border-radius:50%;border:2px solid #b49a68;cursor:pointer;text-decoration:none;
 background:radial-gradient(120% 160% at 30% 0%,#f4ecd9 0%,#e6d9ba 55%,#d9c9a2 100%),repeating-linear-gradient(103deg,rgba(150,120,70,.06) 0 2px,transparent 2px 9px);
 box-shadow:inset 0 1px 0 #fffaf0,inset 0 -2px 3px rgba(120,92,48,.35),0 0 0 3px #f1e8d2,0 0 0 4px #b49a68,0 6px 16px rgba(30,24,10,.35);
 font:600 19px/1 'Cormorant Garamond','Playfair Display','Times New Roman',serif;color:#8a7650;text-shadow:0 1px 0 rgba(255,252,240,.95),0 -1px 0 rgba(90,68,30,.45)}
#vBtn{left:calc(50% - 146px)}#mBtn{left:calc(50% + 108px)}
#vBtn:hover,#mBtn:hover{filter:brightness(1.05)}
#vBtn svg,#mBtn svg{width:18px;height:18px;display:block}
@media(max-width:900px){#vBtn,#mBtn{top:6px;width:34px;height:34px}#vBtn{left:calc(50% - 126px)}#mBtn{left:calc(50% + 92px)}}
#vBox{position:fixed;inset:0;z-index:200;background:#000a;display:none;align-items:center;justify-content:center}
#vBox.on{display:flex}
#vBox .vc{background:#15130f;color:#eee;border:1px solid #c9a96a55;border-radius:14px;padding:22px;width:min(92vw,380px);max-height:88vh;overflow:auto;font:14px/1.4 system-ui,sans-serif}
#vBox h3{margin:0 0 4px;font-weight:600}#vBox .vs{color:#aaa;font-size:12px;margin-bottom:14px}
#vDots{display:flex;gap:8px;justify-content:center;margin:6px 0 14px}#vDots i{width:12px;height:12px;border-radius:50%;border:1px solid #c9a96a}#vDots i.f{background:#c9a96a}
#vPad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}#vPad button{padding:14px 0;font-size:20px;background:#222;color:#fff;border:1px solid #444;border-radius:10px;cursor:pointer}
#vPad button:active{background:#c9a96a;color:#000}
#vErr{color:#e66;text-align:center;min-height:18px;margin-top:8px;font-size:13px}
.vx{float:right;background:none;border:0;color:#aaa;font-size:22px;cursor:pointer}
.vrow{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #333}
.vrow b{font-weight:500}.vrow small{color:#999;display:block}
.vrow a.vdl{text-decoration:none;white-space:nowrap;background:#c9a96a;color:#000;border-radius:8px;padding:8px 12px}.vrow button{white-space:nowrap;background:#c9a96a;color:#000;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}`;
document.head.appendChild(css);
const btn=document.createElement('button');btn.id='vBtn';btn.title='Рабочие документы';btn.setAttribute('aria-label','Рабочие документы');btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
const box=document.createElement('div');box.id='vBox';
box.innerHTML='<div class="vc"><button class="vx" aria-label="Закрыть">×</button><div id="vIn"></div></div>';
const mus=document.createElement('a');mus.id='mBtn';mus.title='Музыка';mus.setAttribute('aria-label','Музыка');mus.target='_blank';mus.rel='noopener';mus.setAttribute('role','link');mus.tabIndex=0;
mus.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" style="width:21px;height:21px"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>';
/* Музыка: если на сайте лежит файл audio/song.mp3 — по нажатию тихо играет фоном (повтор, плавное включение/выключение), повторное нажатие — пауза.
   Пока файла нет, значок открывает песню в YouTube Music в новой вкладке (встроить YouTube в страницу платформа не позволяет). */
const SONG='https://music.youtube.com/watch?v=pgNTrgrbxN0&si=16YWtmDa8BjhHUx8';
let au=null,playing=false,fade=null;const VOL=0.12;
const css2=document.createElement('style');css2.textContent='#mBtn.on{box-shadow:inset 0 1px 0 #fffaf0,inset 0 -2px 3px rgba(120,92,48,.35),0 0 0 3px #f1e8d2,0 0 0 4px #b49a68,0 0 0 8px rgba(201,168,108,.45),0 6px 16px rgba(30,24,10,.35);animation:mspin 4s linear infinite,mpulse 2.4s ease-in-out infinite}@keyframes mspin{to{transform:rotate(360deg)}}@keyframes mpulse{50%{box-shadow:inset 0 1px 0 #fffaf0,inset 0 -2px 3px rgba(120,92,48,.35),0 0 0 3px #f1e8d2,0 0 0 4px #b49a68,0 0 0 13px rgba(201,168,108,.12),0 6px 16px rgba(30,24,10,.35)}}';document.head.appendChild(css2);
function ramp(to,done){clearInterval(fade);fade=setInterval(()=>{const d=to-au.volume;if(Math.abs(d)<.02){au.volume=to;clearInterval(fade);done&&done();}else au.volume=Math.max(0,Math.min(1,au.volume+d*.18));},60);}
let mode='link';
fetch('audio/song.mp3',{method:'HEAD'}).then(r=>{ if(r.ok){ mode='audio'; mus.removeAttribute('target'); mus.title='Музыка: включить / выключить'; au=new Audio('audio/song.mp3'); au.loop=true; au.preload='none'; au.volume=0; } }).catch(()=>{});
const armM=()=>{ if(mode==='link'){ mus.href=SONG; setTimeout(()=>mus.removeAttribute('href'),1500); } };
['pointerdown','touchstart','focus','keydown'].forEach(e=>mus.addEventListener(e,armM,{passive:true}));
mus.addEventListener('click',e=>{ if(mode!=='audio') return; e.preventDefault();
  if(!playing){ au.volume=0; const p=au.play(); if(p&&p.catch) p.catch(()=>{ playing=false; mus.classList.remove('on'); }); playing=true; mus.classList.add('on'); ramp(VOL); }
  else { playing=false; mus.classList.remove('on'); ramp(0,()=>au.pause()); } });
document.body.append(btn,mus,box);
const $=s=>box.querySelector(s),IN=$('#vIn');let pw='',man=null;
const u8=b=>new Uint8Array(b);

function crc32(d){let c,t=crc32.t;if(!t){t=crc32.t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}}c=0xFFFFFFFF;for(let i=0;i<d.length;i++)c=t[(c^d[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function zip(name,d){const nb=new TextEncoder().encode(name),crc=crc32(d),n=d.length,L=30+nb.length,o=new Uint8Array(L+n+46+nb.length+22),v=new DataView(o.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,n,true);v.setUint32(22,n,true);v.setUint16(26,nb.length,true);o.set(nb,30);o.set(d,L);
  let c=L+n;v.setUint32(c,0x02014b50,true);v.setUint16(c+4,20,true);v.setUint16(c+6,20,true);v.setUint16(c+8,0x800,true);v.setUint32(c+16,crc,true);v.setUint32(c+20,n,true);v.setUint32(c+24,n,true);v.setUint16(c+28,nb.length,true);o.set(nb,c+46);
  let e=c+46+nb.length;v.setUint32(e,0x06054b50,true);v.setUint16(e+8,1,true);v.setUint16(e+10,1,true);v.setUint32(e+12,46+nb.length,true);v.setUint32(e+16,L+n,true);return o}
async function key(pass,salt){const m=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:200000,hash:'SHA-256'},m,{name:'AES-GCM',length:256},false,['decrypt'])}
async function dec(url,pass){const r=await fetch(url);if(!r.ok)throw 0;const b=u8(await r.arrayBuffer());const k=await key(pass,b.slice(0,16));return crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(16,28)},k,b.slice(28))}
function pad(){pw='';IN.innerHTML='<h3>Рабочие документы</h3><div class="vs">Оригиналы проекта. Введите пароль.</div><div id="vDots">'+'<i></i>'.repeat(10)+'</div><div id="vPad">'+[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(n=>`<button data-k="${n}">${n}</button>`).join('')+'</div><div id="vErr"></div>';}
function dots(){IN.querySelectorAll('#vDots i').forEach((d,i)=>d.classList.toggle('f',i<pw.length))}
async function tryPw(){const err=IN.querySelector('#vErr');err.textContent='Проверка…';
  try{man=JSON.parse(new TextDecoder().decode(await dec('vault/check.txt',pw)));list(pw)}catch(e){err.textContent='Неверный пароль';pw='';dots()}}
function list(p){IN.innerHTML='<h3>Рабочие документы</h3><div class="vs">Оригиналы проекта · откроется в Google Диске, там нажмите «Скачать»</div>'+man.map(f=>`<div class="vrow"><div><b>${f.t}</b><small>${f.fn} · ${f.kb>1024?(f.kb/1024).toFixed(1)+' МБ':f.kb+' КБ'}</small></div><a class="vdl" href="${f.u}" target="_blank" rel="noopener">Скачать</a></div>`).join('');}
function open_(){box.classList.add('on');man=null;IN.onclick=null;pad();}
function close_(){box.classList.remove('on');man=null;pw='';IN.innerHTML=''}
btn.onclick=open_;box.querySelector('.vx').onclick=close_;box.addEventListener('click',e=>{if(e.target===box)close_()});
box.addEventListener('click',e=>{const k=e.target.closest('#vPad button');if(!k)return;const v=k.dataset.k;if(v==='⌫')pw=pw.slice(0,-1);else if(v==='OK'){tryPw();return}else if(pw.length<10)pw+=v;dots();if(pw.length===10&&v!=='⌫')tryPw()});
addEventListener('keydown',e=>{if(!box.classList.contains('on'))return;if(e.key==='Escape')close_();else if(!man){if(/^\d$/.test(e.key)&&pw.length<10){pw+=e.key;dots();if(pw.length===10)tryPw()}else if(e.key==='Backspace'){pw=pw.slice(0,-1);dots()}}});
})();
