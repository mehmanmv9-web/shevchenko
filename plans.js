/* Планировки квартир (концептуальные): экспликация каждого типа сходится с площадью типа до сотых */
(function(){
const M=window.SHEV; if(!M) return;
const R={
 '2':[['Прихожая',6,'h'],['Кухня-гостиная',28,'l'],['Мастер-спальня',17,'b'],['Гардеробная',5,'w'],['Спальня / кабинет',12,'b'],['Санузел',5.5,'t'],['Ванная мастер-спальни',4.5,'t'],['Постирочная',2,'t']],
 '3':[['Прихожая',10,'h'],['Холл',6,'h'],['Кухня-гостиная',44,'l'],['Мастер-спальня',24,'b'],['Гардеробная',8,'w'],['Ванная мастер-спальни',9,'t'],['Спальня 2',17,'b'],['Спальня 3',16,'b'],['Санузел',6,'t'],['Постирочная',5,'t']],
 '4':[['Прихожая',12,'h'],['Холл',10,'h'],['Гостиная-столовая',48,'l'],['Кухня',22,'l'],['Мастер-спальня',30,'b'],['Гардеробная',12,'w'],['Ванная мастер-спальни',12,'t'],['Спальня 2',20,'b'],['Спальня 3',19,'b'],['Ванная 2',7,'t'],['Гостевой санузел',7,'t'],['Постирочная',6,'t']],
 '5':[['Прихожая',16,'h'],['Холл',14,'h'],['Гостиная-столовая',64,'l'],['Кухня',28,'l'],['Кабинет-библиотека',10,'l'],['Мастер-спальня',38,'b'],['Гардеробная',16,'w'],['Ванная мастер-спальни',16,'t'],['Спальня 2',24,'b'],['Спальня 3',22,'b'],['Спальня 4',21,'b'],['Ванная 2',9,'t'],['Ванная 3',9,'t'],['Гостевой санузел',6,'t'],['Постирочная',8,'t']],
 '6':[['Входная группа',24,'h'],['Холл',22,'h'],['Гостиная-столовая',90,'l'],['Кухня',38,'l'],['Кабинет',20,'l'],['Мастер-спальня',56,'b'],['Гардеробная',26,'w'],['Ванная мастер-спальни',26,'t'],['Спальня 2',32,'b'],['Спальня 3',30,'b'],['Спальня 4',28,'b'],['Спальня 5',28,'b'],['Ванная 2',11,'t'],['Ванная 3',11,'t'],['Ванная 4',11,'t'],['Гостевой санузел',5,'t'],['Постирочная',12,'t']]
};
Object.keys(R).forEach(k=>{ if(M.TYPES[k]) M.TYPES[k].r=R[k].map(x=>[x[0],x[1]]); });
const COL={h:'#F4EEE1',l:'#FBF8F0',b:'#F3EBDA',w:'#EADFC8',t:'#E1EAE7'};
/* ===== генератор планировки: нарезка с перебором вариантов и архитектурными ограничениями ===== */
const MINW={b:2.9,l:3.0,w:1.4,t:1.5,h:1.4};
const sum=n=>n.m!==undefined?n.m:n.c.reduce((p,q)=>p+sum(q),0);
function place(n,x,y,w,h,out){
  if(n.m!==undefined){ out.push({...n,x,y,w,h}); return; }
  const tot=sum(n); let o=n.d==='V'?x:y;
  n.c.forEach(c=>{ const f=sum(c)/tot; if(n.d==='V'){ const cw=w*f; place(c,o,y,cw,h,out); o+=cw; } else { const ch=h*f; place(c,x,o,w,ch,out); o+=ch; } });
}
function rng(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function cand(k,r){
  const rs=R[k].map(x=>({n:x[0],m:x[1],t:x[2]})), L=rs.filter(q=>q.t==='l'), Hh=rs.filter(q=>q.t==='h');
  const bed=rs.filter(q=>q.t==='b'), wd=rs.find(q=>q.t==='w'), bath=rs.filter(q=>q.t==='t');
  const mb=bath.find(q=>/мастер/.test(q.n)), pubW=bath.filter(q=>/Постиро|Гостев|^Санузел$/.test(q.n)), oth=bath.filter(q=>q!==mb&&pubW.indexOf(q)<0);
  const pick=a=>a[Math.floor(r()*a.length)], D=()=>r()<.5?'V':'H', flip=d=>d==='V'?'H':'V';
  const grp=(arr,d)=>arr.length>1?{d,c:r()<.3?arr.slice().reverse():arr}:arr[0];
  const pd=D(), pw1=[], pw2=[]; pubW.forEach(q=>(r()<.5?pw1:pw2).push(q)); const pub={d:pd,c:r()<.5?[grp(L.concat(pw1),flip(pd)),grp(Hh.concat(pw2),flip(pd))]:[grp(Hh.concat(pw2),flip(pd)),grp(L.concat(pw1),flip(pd))]};
  const sd=D(), suites=[{d:sd,c:[bed[0],{d:flip(sd),c:r()<.5?[wd,mb]:[mb,wd]}]}];
  const wp=oth.slice(); bed.slice(1).forEach(b=>{ const w=wp.shift(); suites.push(w?{d:D(),c:r()<.5?[b,w]:[w,b]}:b); });
  if(wp.length) suites.push(grp(wp,D()));
  if(r()<.5) suites.reverse();
  const nc=Math.min(suites.length,1+Math.floor(r()*3)), cols=[]; for(let i=0;i<nc;i++) cols.push([]);
  suites.forEach((s,i)=>cols[i%nc].push(s));
  const prv=nc===1?{d:D(),c:suites}:{d:pick(['V','H']),c:cols.map(c=>c.length>1?{d:pick(['V','H']),c:c}:c[0])};
  const rootD=D(); return {d:rootD,c:r()<.5?[pub,prv]:[prv,pub]};
}
function score(out,W,H,S){
  let p=0; const e=1.5;
  out.forEach(q=>{ const wm=q.w/S, hm=q.h/S, mn=Math.min(wm,hm), mx=Math.max(wm,hm), ar=mx/mn, need=MINW[q.t]||1.4;
    if(mn<need) p+=(need-mn)*40; if(q.t==='t'&&q.m>=4){ if(mn<1.6) p+=(1.6-mn)*400; if(ar>2.6) p+=(ar-2.6)*300; } if(ar>(q.t==='h'?4:2.0)) p+=(ar-(q.t==='h'?4:2.0))*22; if(ar>2.7&&q.t!=='h') p+=70; if(q.t==='l'&&mn<3.6) p+=(3.6-mn)*30;
    const ext=q.x<e||q.y<e||q.x+q.w>W-e||q.y+q.h>H-e;
    if((q.t==='l'||q.t==='b')&&!ext) p+=120; if(q.t==='t'&&ext&&q.m<14) p+=4; });
  const hall=out.filter(q=>q.t==='h'); if(!hall.some(q=>/Прихож|Входн/.test(q.n)&&q.y+q.h>H-e)) p+=900;
  p+=link(out,W,H,S,false).bad*450;
  const dl=0.9*S, adj=(q,o)=>{ if(q===o) return false; const sx=Math.min(q.x+q.w,o.x+o.w)-Math.max(q.x,o.x), sy=Math.min(q.y+q.h,o.y+o.h)-Math.max(q.y,o.y); return ((Math.abs(q.x+q.w-o.x)<2||Math.abs(o.x+o.w-q.x)<2)&&sy>dl+10)||((Math.abs(q.y+q.h-o.y)<2||Math.abs(o.y+o.h-q.y)<2)&&sx>dl+10); };
  const nb=q=>out.filter(o=>adj(q,o)); const is={ master:q=>q.t==='b'&&/Мастер/.test(q.n), lau:q=>/Постиро/.test(q.n), gwc:q=>/Гостев/.test(q.n), kit:q=>q.t==='l'&&/Кухня/.test(q.n), liv:q=>q.t==='l'&&/Гости|Кухня-г/.test(q.n), mbath:q=>/мастер-спальни/.test(q.n), wd:q=>q.t==='w' };
  out.forEach(q=>{ const N=nb(q); if(!N.length){ p+=100; return; }
    const hasB=N.some(o=>o.t==='b'), hasH=N.some(o=>o.t==='h'), hasL=N.some(o=>o.t==='l'); if(q.t==='b'&&!hasH) p+=hasL?70:320; if(q.t==='b'&&q.y+q.h>H-e) p+=900;
    if(is.lau(q)){ if(hasB) p+=800; if(!(hasH||N.some(is.kit))) p+=90; }                         // постирочная — не у спален, у входа/кухни
    else if(is.gwc(q)){ if(hasB) p+=800; if(!(hasH||hasL)) p+=110; }                               // гостевой санузел — у входа/гостиной
    else if(is.mbath(q)){ if(!N.some(is.master)) p+=220; }                                           // ванная мастера — только из мастер-спальни
    else if(is.wd(q)){ if(!N.some(is.master)) p+=220; }
    else if(q.t==='t'){ if(!hasB) p+=130; if(N.some(is.kit)&&q.m<14) p+=25; }                       // прочие ванные — при спальнях
    else if(is.master(q)){ if(!N.some(is.mbath)) p+=220; if(!N.some(is.wd)) p+=200; if(N.some(is.liv)||N.some(is.kit)) p+=130; if(hasH&&/Холл|Прихож|Входн/.test(N.find(o=>o.t==='h').n)&&N.filter(o=>o.t==='h').length&&q.m<20) p+=0; }  // мастер — вдали от шума
    else if(q.t==='b'){ if(N.some(is.kit)) p+=70; if(N.some(is.liv)&&!hasH) p+=15; }
    else if(is.kit(q)&&!/Кухня-г/.test(q.n)){ if(!N.some(is.liv)) p+=110; }
    else if(q.t==='h'&&/Прихож|Входн/.test(q.n)){ if(!hasL) p+=70; }
  });
  return p;
}

function shared(a,b,dl){ const T=2; if(Math.abs(a.x+a.w-b.x)<T||Math.abs(b.x+b.w-a.x)<T){ const y1=Math.max(a.y,b.y),y2=Math.min(a.y+a.h,b.y+b.h); if(y2-y1>dl+8) return {v:1,x:Math.abs(a.x+a.w-b.x)<T?a.x+a.w:a.x,a:y1,b:y2}; } if(Math.abs(a.y+a.h-b.y)<T||Math.abs(b.y+b.h-a.y)<T){ const x1=Math.max(a.x,b.x),x2=Math.min(a.x+a.w,b.x+b.w); if(x2-x1>dl+8) return {v:0,y:Math.abs(a.y+a.h-b.y)<T?a.y+a.h:a.y,a:x1,b:x2}; } return null; }
/* связность: из прихожей через холл в каждую комнату; спальни и санузлы — не проходные */
function link(out,W,H,S,fb){ const dl=0.9*S, hall=out.filter(q=>q.t==='h');
  const E=out.find(q=>q.t==='h'&&/Прихож|Входн/.test(q.n)&&q.y+q.h>H-1.5)||hall[hall.length-1]||out[0];
  const rank=(r,o)=>{ const T=o.t, nm=r.n;
    if(/мастер-спальни/.test(nm)||r.t==='w') return /Мастер/.test(o.n)?0:9;
    if(/Постиро|Гостев/.test(nm)) return T==='h'?0:T==='l'?1:9;
    if(/^Санузел$/.test(nm)) return T==='h'?0:9;
    if(r.t==='t') return T==='b'?0:T==='h'?2:9;
    if(r.t==='b') return T==='h'?(o===E?(hall.length>1?9:0):0):9;
    if(r.t==='l') return T==='h'?0:T==='l'?1:9;
    return T==='h'?(o===E?1:0):9; };
  const con=new Set([E]), edges=[], ord={h:0,l:1,b:2,w:3,t:4}, pend=out.filter(q=>q!==E).sort((a,b)=>ord[a.t]-ord[b.t]);
  const pick=(r,strict)=>{ let bst=null; con.forEach(o=>{ if(strict){ if(o.t==='t'||o.t==='w') return; if(o.t==='b'&&!(r.t==='t'||r.t==='w')) return; } const sh=shared(r,o,dl); if(!sh) return; const sc=rank(r,o); if(strict&&sc>=9) return; if(!bst||sc<bst.sc) bst={sc,o,sh}; }); return bst; };
  let prog=true; while(pend.length&&prog){ prog=false; for(let pi=0;pi<pend.length;pi++){ const r=pend[pi], b=pick(r,true); if(b){ edges.push({r,o:b.o,sh:b.sh}); con.add(r); pend.splice(pi,1); pi--; prog=true; } } }
  const bad=pend.length; if(fb) pend.slice().forEach(r=>{ const b=pick(r,false); if(b){ edges.push({r,o:b.o,sh:b.sh}); con.add(r); } });
  return {E,edges,bad}; }
const CACHE={};
function search(k,N,seed){ const r=rng(seed||(1000+k*7)), tot=M.TYPES[k].total; let bestS=1e9,bo=null;
  for(let i=0;i<N;i++){ const asp=1.0+r()*0.9, Hm=Math.sqrt(tot/asp), Wm=Hm*asp, S=900/Wm, W=900, H=Hm*S, t=cand(k,r), out=[]; place(t,0,0,W,H,out); const sc=score(out,W,H,S); if(sc<bestS){bestS=sc;bo={out,asp,Wm,Hm,S,W,H,sc};} }
  return bo; }

/* поиск имитацией отжига: мутации дерева (поворот, обмен комнат, перегруппировка) */
function cl(n){ return n.m!==undefined?n:{d:n.d,c:n.c.map(cl)}; }
function internals(n,a){ a=a||[]; if(n.m===undefined){ a.push(n); n.c.forEach(c=>internals(c,a)); } return a; }
function mutate(t,r){ const T=cl(t), I=internals(T), op=r();
  if(op<0.28){ const n=I[Math.floor(r()*I.length)]; n.d=n.d==='V'?'H':'V'; }
  else if(op<0.58){ const a=I[Math.floor(r()*I.length)], b=I[Math.floor(r()*I.length)], i=Math.floor(r()*a.c.length), j=Math.floor(r()*b.c.length); if(a.c[i].m!==undefined&&b.c[j].m!==undefined){ const x=a.c[i]; a.c[i]=b.c[j]; b.c[j]=x; } }
  else if(op<0.72){ const n=I[Math.floor(r()*I.length)]; n.c.reverse(); }
  else if(op<0.86){ const n=I[Math.floor(r()*I.length)]; if(n.c.length>=3){ const i=Math.floor(r()*(n.c.length-1)); const w={d:r()<.5?'V':'H',c:[n.c[i],n.c[i+1]]}; n.c.splice(i,2,w); } }
  else { const n=I[Math.floor(r()*I.length)]; const ci=n.c.map((c,i)=>c.m===undefined?i:-1).filter(i=>i>=0); if(ci.length&&n!==T||ci.length&&I.length>1){ const i=ci[Math.floor(r()*ci.length)]; const ch=n.c[i]; n.c.splice(i,1,...ch.c); } }
  return T; }
function valid(t,seen){ return true; }
function anneal(k,N,seed){ const r=rng(seed||(2000+k*7)), tot=M.TYPES[k].total; let gBest=null;
  const ev=(t,asp)=>{ const Hm=Math.sqrt(tot/asp), Wm=Hm*asp, S=900/Wm, W=900, H=Hm*S, out=[]; place(t,0,0,W,H,out); return {out,asp,Wm,Hm,S,W,H,sc:out.length===R[k].length&&Math.abs(out.reduce((p,q)=>p+q.m,0)-tot)<1e-6?score(out,W,H,S):1e9,t}; };
  for(let R=0;R<6;R++){ let cur=null; for(let i=0;i<1500;i++){ const asp=1.0+r()*0.9, e=ev(cand(k,r),asp); if(!cur||e.sc<cur.sc) cur=e; }
    const steps=Math.floor(N/6); for(let i=0;i<steps;i++){ const T0=120*(1-i/steps)+1; let t2=mutate(cur.t,r), asp=cur.asp; if(r()<0.12) asp=Math.min(1.9,Math.max(1.0,asp+(r()-0.5)*0.12)); if(t2.m!==undefined) continue; const e=ev(t2,asp); if(e.sc<cur.sc||r()<Math.exp((cur.sc-e.sc)/T0)){ cur=e; if(!gBest||cur.sc<gBest.sc) gBest=cur; } }
    if(!gBest||cur.sc<gBest.sc) gBest=cur; }
  return gBest; }
window.SHEV_planAnneal=anneal;
window.SHEV_planSearch=search;
function best(k){
  if(CACHE[k]) return CACHE[k]; const P=window.SHEV_PLAN_PRE&&window.SHEV_PLAN_PRE[k];
  if(P){ const tot=M.TYPES[k].total, Hm=Math.sqrt(tot/P.asp), Wm=Hm*P.asp, S=900/Wm; return CACHE[k]={out:P.rooms.map(q=>({n:q.n,m:q.m,t:q.t,x:q.x,y:q.y,w:q.w,h:q.h})),asp:P.asp,Wm,Hm,S,W:900,H:Hm*S}; }
  return CACHE[k]=search(k,30000); }
function wrap(t,max){ const w=t.split(' '); const L=[]; let c=''; w.forEach(x=>{ if((c+' '+x).trim().length>max&&c){L.push(c);c=x;} else c=(c+' '+x).trim(); }); if(c)L.push(c); return L; }
const fm=v=>v.toFixed(1).replace('.',',');
function furn(r,S,top){
  const g=[],st='fill="none" stroke="#9A8A66" stroke-width="1.3"', fi='fill="#EFE6D0" stroke="#9A8A66" stroke-width="1.3"', m=S, x=r.x, y=r.y, w=r.w, h=r.h, free=h-top;
  if(r.t==='b'){ const bw=Math.min(2.0*m,w*0.7), bh=Math.min(2.2*m,free-0.3*m); if(bh>1.6*m&&w>bw+0.3*m){ const bx=x+w/2-bw/2, by=y+h-bh-0.2*m; g.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="3" ${fi}/><rect x="${bx+bw*0.07}" y="${by+4}" width="${bw*0.4}" height="${bh*0.2}" rx="3" ${st}/><rect x="${bx+bw*0.53}" y="${by+4}" width="${bw*0.4}" height="${bh*0.2}" rx="3" ${st}/>`); } }
  else if(r.t==='l' && /Гости|Кухня-г/.test(r.n)){ const sw=Math.min(2.6*m,w*0.6), sh=0.9*m; if(free>sh*2.2&&w>sw+0.8*m){ g.push(`<rect x="${x+w*0.1}" y="${y+h-sh-0.5*m}" width="${sw}" height="${sh}" rx="5" ${fi}/><rect x="${x+w*0.1+sw*0.15}" y="${y+h-sh-0.5*m-0.95*m}" width="${sw*0.7}" height="${0.5*m}" rx="3" ${st}/>`); const tw=Math.min(1.9*m,w*0.45), th=Math.min(1.0*m,free*0.2); if(free>th+sh*2) g.push(`<rect x="${x+w-tw-0.35*m}" y="${y+top+0.2*m}" width="${tw}" height="${th}" rx="${th/2}" ${st}/>`); } }
  else if(r.t==='l' && /Кухня/.test(r.n) && w>1.6*m){ g.push(`<rect x="${x+3}" y="${y+h-0.62*m}" width="${w-6}" height="${0.6*m}" ${fi}/>`); }
  else if(r.t==='t' && w>1.5*m && h>1.5*m){ if(/Ванн/.test(r.n)&&free>1.2*m){ g.push(`<rect x="${x+4}" y="${y+h-Math.min(0.8*m,h*0.4)-4}" width="${Math.min(1.7*m,w-8)}" height="${Math.min(0.8*m,h*0.4)}" rx="${m*0.3}" ${fi}/>`); } g.push(`<circle cx="${x+w-0.42*m}" cy="${y+top+0.4*m}" r="${0.2*m}" ${fi}/>`); }
  else if(r.t==='w'){ for(let i=1;i<4;i++) g.push(`<line x1="${x+4}" x2="${x+w-4}" y1="${y+top+(h-top)*i/4}" y2="${y+top+(h-top)*i/4}" stroke="#B9A57A" stroke-width="1"/>`); }
  return g.join('');
}
window.SHEV_planSVG=function(k){
  const tot=M.TYPES[k].total, B=best(k), out=B.out, Wm=B.Wm, Hm=B.Hm, S=B.S, W=B.W, H=B.H, pad=40;
  const fs=Math.max(10.5,Math.min(17,W/58)); let rg='',lb='',fu='',wi='',dr='';
  const LAB=new Map(); out.forEach(r=>{ let f1=fs, lines=wrap(r.n,Math.max(5,Math.floor(r.w/(f1*0.52)))); const need=()=>Math.max(...lines.map(l=>l.length))*f1*0.5<=r.w-10 && (lines.length+1.4)*f1*1.1<=r.h-6; while(!need()&&f1>9){ f1-=0.7; lines=wrap(r.n,Math.max(5,Math.floor(r.w/(f1*0.52)))); } LAB.set(r,{f1,lines,ok:need()}); });
  out.forEach((r,ri)=>{ rg+=`<rect class="pr" data-i="${ri}" x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" fill="${COL[r.t]}" stroke="#2B2A26" stroke-width="3"/>`;  });
  const WN=[], bd=0.4*S; out.forEach(r=>{ // окна на наружных стенах (верх, право, лево) у жилых комнат
    if(r.t==='h'||r.t==='t'||r.t==='w') return;
    const win=(x1,y1,x2,y2)=>{ WN.push(y1===y2?{x:Math.min(x1,x2),y:y1<1?0:y1-bd,w:Math.abs(x2-x1),h:bd}:{x:x1<1?0:x1-bd,y:Math.min(y1,y2),w:bd,h:Math.abs(y2-y1)}); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="9"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6C8FA6" stroke-width="3"/>`; };
    const e=1, wl=Math.min(r.w*0.6,3.2*S), hl=Math.min(r.h*0.6,3.2*S);
    if(r.y<e) wi+=win(r.x+r.w/2-wl/2,0,r.x+r.w/2+wl/2,0);
    if(r.x+r.w>W-e) wi+=win(W,r.y+r.h/2-hl/2,W,r.y+r.h/2+hl/2);
    if(r.x<e) wi+=win(0,r.y+r.h/2-hl/2,0,r.y+r.h/2+hl/2);
    if(r.y+r.h>H-e&&r.t!=='h') wi+=win(r.x+r.w/2-wl/2,H,r.x+r.w/2+wl/2,H);
  });
  // двери: каждая комната — к холлу/гостиной/спальне, с которой делит стенку
  const dl=0.9*S;
  const hall=out.filter(r=>r.t==='h');
  const prio=(r,o)=>{ const T=o.t, nm=r.n;
    if(/мастер-спальни/.test(nm)||r.t==='w') return /Мастер/.test(o.n)?0:T==='b'?3:T==='h'?4:5;
    if(/Постиро|Гостев/.test(nm)) return T==='h'?0:T==='l'?1:T==='t'?4:5;
    if(r.t==='t') return T==='b'?0:T==='h'?1:T==='l'?2:5;
    if(r.t==='b') return T==='h'?0:T==='l'?2:T==='b'?4:3;
    if(r.t==='l') return o.t==='l'?0:o.t==='h'?1:3;
    return T==='h'?1:T==='l'?0:3; };
  
  const DR=[], ZN=[], DC=[], ED=[]; B.ed=ED;
  const LK=link(out,W,H,S,true), E=LK.E;
  const addDoor=(r,o,sh)=>{ const len=sh.b-sh.a; let a0=len>dl*2.3?sh.a+0.28*S:sh.a+(len-dl)/2; a0=Math.min(a0,sh.b-dl-0.12*S); ED.push([r,o]);
    const small=(r.t==='t'||r.t==='w')&&Math.min(r.w,r.h)<2.3*S; const into=small?o:r;
    if(sh.v){ const sd=into.x>=sh.x-2?1:-1; DR.push({v:1,x:sh.x,a:a0,s:sd}); ZN.push({x:sd>0?sh.x:sh.x-dl,y:a0,w:dl,h:dl},{x:sd>0?sh.x-0.6*dl:sh.x,y:a0,w:0.6*dl,h:dl}); DC.push({x:sh.x,y:a0+dl/2}); }
    else { const sd=into.y>=sh.y-2?1:-1; DR.push({v:0,y:sh.y,a:a0,s:sd}); ZN.push({x:a0,y:sd>0?sh.y:sh.y-dl,w:dl,h:dl},{x:a0,y:sd>0?sh.y-0.6*dl:sh.y,w:dl,h:0.6*dl}); DC.push({x:a0+dl/2,y:sh.y}); } };
  LK.edges.forEach(e=>addDoor(e.r,e.o,e.sh));
  DR.forEach(d=>{ const sd=d.s;
    if(d.v){ const x=d.x,a=d.a; dr+=`<line x1="${x}" y1="${a}" x2="${x}" y2="${a+dl}" stroke="#fff" stroke-width="7"/><line x1="${x}" y1="${a}" x2="${x+sd*dl}" y2="${a}" stroke="#7A6A48" stroke-width="1.6"/><path d="M${x+sd*dl} ${a} A${dl} ${dl} 0 0 ${sd>0?1:0} ${x} ${a+dl}" fill="none" stroke="#9A8A66" stroke-width="1" stroke-dasharray="3 2"/>`; }
    else { const y=d.y,a=d.a; dr+=`<line x1="${a}" y1="${y}" x2="${a+dl}" y2="${y}" stroke="#fff" stroke-width="7"/><line x1="${a}" y1="${y}" x2="${a}" y2="${y+sd*dl}" stroke="#7A6A48" stroke-width="1.6"/><path d="M${a} ${y+sd*dl} A${dl} ${dl} 0 0 ${sd>0?0:1} ${a+dl} ${y}" fill="none" stroke="#9A8A66" stroke-width="1" stroke-dasharray="3 2"/>`; } });
  // входная дверь — внизу у холла, открывается внутрь
  const h0=E; const ex=h0.x+h0.w/2; ZN.push({x:ex-dl/2,y:H-dl,w:dl,h:dl+1}); DC.push({x:ex,y:H});
  dr+=`<line x1="${ex-dl/2}" y1="${H}" x2="${ex+dl/2}" y2="${H}" stroke="#fff" stroke-width="9"/><line x1="${ex-dl/2}" y1="${H}" x2="${ex-dl/2}" y2="${H-dl}" stroke="#7A6A48" stroke-width="1.8"/><path d="M${ex-dl/2} ${H-dl} A${dl} ${dl} 0 0 1 ${ex+dl/2} ${H}" fill="none" stroke="#9A8A66" stroke-width="1" stroke-dasharray="3 2"/><polygon points="${ex-12},${H+30} ${ex+12},${H+30} ${ex},${H+12}" fill="#B8862F"/><text x="${ex}" y="${H+pad-6}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" fill="#8A6B2E" letter-spacing="2">ВХОД</text>`;
  const labR=out.map(r=>{ const L=LAB.get(r); if(!L.ok) return null; const w=Math.max(...L.lines.map(l=>l.length))*L.f1*0.5+8, h=(L.lines.length+1.4)*L.f1*1.1; const y0=(r.t==='b'||r.t==='l'||r.t==='t'||r.t==='w')?r.y+5:r.y+r.h/2-((L.lines.length+1)*L.f1*1.1)/2; return {x:r.x+r.w/2-w/2,y:y0,w:w,h:h}; });
  if(window.SHEV_furnish) fu=window.SHEV_furnish({S,W,H,out,zones:ZN,wins:WN,dcent:DC,lab:labR});
  out.forEach(r=>{ const L=LAB.get(r), f1=L.f1, lines=L.lines, cx=r.x+r.w/2, a=fm(r.m);
    if(L.ok){ const y0=(r.t==='b'||r.t==='l'||r.t==='t'||r.t==='w')?r.y+5:r.y+r.h/2-((lines.length+1)*f1*1.1)/2; lb+=`<text text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="${f1.toFixed(1)}" fill="#2B2A26" font-weight="600" stroke="#FFFDF8" stroke-width="3" paint-order="stroke">`+lines.map((l,i)=>`<tspan x="${cx.toFixed(1)}" y="${(y0+(i+0.85)*f1*1.1).toFixed(1)}">${l}</tspan>`).join('')+`<tspan x="${cx.toFixed(1)}" y="${(y0+(lines.length+0.85)*f1*1.1+2).toFixed(1)}" font-family="Inter,Arial,sans-serif" font-size="${(f1*0.85).toFixed(1)}" fill="#8A6B2E" font-weight="700">${a} м²</tspan></text>`; }
    else { const fz=Math.max(8,Math.min(11,r.w/5)); lb+=`<text x="${cx.toFixed(1)}" y="${(r.y+r.h/2+fz*0.35).toFixed(1)}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="${fz.toFixed(1)}" fill="#8A6B2E" font-weight="700">${a}</text>`; } });
  const dim=`<text x="${W/2}" y="-14" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="#8A6B2E" letter-spacing="2">${fm(Wm)} м</text><text transform="translate(-14 ${H/2}) rotate(-90)" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="#8A6B2E" letter-spacing="2">${fm(Hm)} м</text>`;
  return `<svg viewBox="${-pad} ${-pad} ${W+2*pad} ${H+2*pad+10}" style="width:100%;height:auto;display:block;background:#FFFDF8;border-radius:12px" role="img" aria-label="Планировка ${M.TYPES[k].rooms}-комнатной квартиры, ${fm(tot)} м²"><rect x="${-pad+5}" y="${-pad+5}" width="${W+2*pad-10}" height="${H+2*pad}" fill="none" stroke="#C9A66B" stroke-width="1.2"/>${rg}${fu}${dr}<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#1E1D1A" stroke-width="9"/>${wi}${lb}${dim}</svg>`;
};
window.SHEV_planOrder=function(k){ const o=best(k).out.map((r,i)=>({i,n:r.n,m:r.m,t:r.t,x:r.x,y:r.y,w:r.w,h:r.h})); const pr=r=>{ if(r.t==='h') return /Холл|Входн|Прихож/.test(r.n)&&/Прихож|Входн/.test(r.n)?0:1; if(r.t==='l') return /Гости/.test(r.n)?2:/Кухня/.test(r.n)?3:4; if(r.t==='b') return /Мастер/.test(r.n)?5:8; if(r.t==='w') return 6; if(r.t==='t') return /мастер/.test(r.n)?7:/Гостев/.test(r.n)?9:10; return 11; };
  return o.sort((a,b)=>pr(a)-pr(b)||a.i-b.i); };
window.SHEV_planCheck=function(k){ const B=best(k), out=B.out, S=B.S, dl=0.9*S, v=[];
  const adj=(q,o)=>{ if(q===o) return false; const sx=Math.min(q.x+q.w,o.x+o.w)-Math.max(q.x,o.x), sy=Math.min(q.y+q.h,o.y+o.h)-Math.max(q.y,o.y); return ((Math.abs(q.x+q.w-o.x)<2||Math.abs(o.x+o.w-q.x)<2)&&sy>dl+10)||((Math.abs(q.y+q.h-o.y)<2||Math.abs(o.y+o.h-q.y)<2)&&sx>dl+10); };
  out.forEach(q=>{ if(q.t==='b'&&q.y+q.h>B.H-1.5) v.push('спальня у входной стороны: '+q.n); });
  out.forEach(q=>{ const N=out.filter(o=>adj(q,o));
    if(/Постиро/.test(q.n)&&N.some(o=>o.t==='b')) v.push('постирочная рядом со спальней');
    if(/Гостев/.test(q.n)&&N.some(o=>o.t==='b')) v.push('гостевой санузел рядом со спальней');
    if(/мастер-спальни/.test(q.n)&&!N.some(o=>/Мастер/.test(o.n))) v.push('ванная не при мастер-спальне');
    if(q.t==='w'&&!N.some(o=>/Мастер/.test(o.n))) v.push('гардеробная не при мастер-спальне');
    if(/Мастер/.test(q.n)&&N.some(o=>o.t==='l')) v.push('мастер-спальня рядом с гостиной/кухней');
    if(q.t==='t'&&!/Постиро|Гостев/.test(q.n)&&!/мастер-спальни/.test(q.n)&&!N.some(o=>o.t==='b')) v.push('ванная '+q.n+' без спальни');
    if(q.t==='b'&&N.some(o=>o.t==='l'&&/Кухня/.test(o.n)&&!/Кухня-г/.test(o.n))) v.push(q.n+' рядом с кухней'); });
  window.SHEV_planSVG(k); const ed=B.ed||[], seen=new Set(), hall=out.filter(q=>q.t==='h'); const q=[hall.find(o=>/Прихож|Входн/.test(o.n))||hall[0]]; seen.add(q[0]);
  while(q.length){ const c=q.shift(); ed.forEach(e=>{ const o=e[0]===c?e[1]:e[1]===c?e[0]:null; if(!o||seen.has(o)) return; if(c.t==='b'&&!(o.t==='t'||o.t==='w')) return; if(o.t==='b'&&c.t==='b') return; seen.add(o); q.push(o); }); }
  out.forEach(o=>{ if(!seen.has(o)) v.push('нет прохода в: '+o.n); });
  return v; };
window.SHEV_roomsTable=function(k){ const r=R[k], t=r.reduce((p,q)=>p+q[1],0); return '<table class="rooms num">'+r.map(x=>`<tr><td>${x[0]}</td><td>${x[1].toFixed(1).replace('.',',')} м²</td></tr>`).join('')+`<tr class="sum"><td>Общая площадь квартиры</td><td>${t.toFixed(1).replace('.',',')} м²</td></tr></table>`; };
window.SHEV_PLAN_NOTE='Планировка и экспликация помещений. Площади помещений в сумме дают общую площадь квартиры.';
})();
