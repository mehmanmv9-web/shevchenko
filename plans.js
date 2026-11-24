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
  const mb=bath.find(q=>/мастер/.test(q.n)), oth=bath.filter(q=>q!==mb);
  const pick=a=>a[Math.floor(r()*a.length)], D=()=>r()<.5?'V':'H', flip=d=>d==='V'?'H':'V';
  const grp=(arr,d)=>arr.length>1?{d,c:r()<.3?arr.slice().reverse():arr}:arr[0];
  const pd=D(); const pub={d:pd,c:r()<.5?[grp(L,flip(pd)),grp(Hh,flip(pd))]:[grp(Hh,flip(pd)),grp(L,flip(pd))]};
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
    if(mn<need) p+=(need-mn)*40; if(ar>(q.t==='h'?4:2.0)) p+=(ar-(q.t==='h'?4:2.0))*22; if(ar>2.7&&q.t!=='h') p+=70; if(q.t==='l'&&mn<3.6) p+=(3.6-mn)*30;
    const ext=q.x<e||q.y<e||q.x+q.w>W-e||q.y+q.h>H-e;
    if((q.t==='l'||q.t==='b')&&!ext) p+=120; if(q.t==='t'&&ext&&q.m<14) p+=4; });
  const hall=out.filter(q=>q.t==='h'); if(!hall.some(q=>q.y+q.h>H-e)) p+=80;
  // мокрые зоны рядом друг с другом и рядом с мастер-спальней — не штрафуем, но связность дверей:
  const dl=0.9*S; out.forEach(q=>{ let ok=false; out.forEach(o=>{ if(o===q) return; const sx=Math.min(q.x+q.w,o.x+o.w)-Math.max(q.x,o.x), sy=Math.min(q.y+q.h,o.y+o.h)-Math.max(q.y,o.y); if((Math.abs(q.x+q.w-o.x)<2||Math.abs(o.x+o.w-q.x)<2)&&sy>dl+10) ok=true; if((Math.abs(q.y+q.h-o.y)<2||Math.abs(o.y+o.h-q.y)<2)&&sx>dl+10) ok=true; }); if(!ok) p+=100; });
  return p;
}
const CACHE={};
function best(k){
  if(CACHE[k]) return CACHE[k]; const r=rng(1000+k*7), tot=M.TYPES[k].total; let bestS=1e9,bo=null;
  for(let i=0;i<9000;i++){ const asp=1.0+r()*0.9, Hm=Math.sqrt(tot/asp), Wm=Hm*asp, S=900/Wm, W=900, H=Hm*S, t=cand(k,r), out=[]; place(t,0,0,W,H,out); const sc=score(out,W,H,S); if(sc<bestS){bestS=sc;bo={out,asp,Wm,Hm,S,W,H};} }
  return CACHE[k]=bo;
}
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
  out.forEach((r,ri)=>{ rg+=`<rect class="pr" data-i="${ri}" x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" fill="${COL[r.t]}" stroke="#2B2A26" stroke-width="3"/>`; const l=LAB.get(r); fu+=furn(r,S,l.ok?(l.lines.length+1.5)*l.f1*1.1:0); });
  out.forEach(r=>{ // окна на наружных стенах (верх, право, лево) у жилых комнат
    if(r.t==='h'||r.t==='t'||r.t==='w') return;
    const win=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="9"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6C8FA6" stroke-width="3"/>`;
    const e=1, wl=Math.min(r.w*0.6,3.2*S), hl=Math.min(r.h*0.6,3.2*S);
    if(r.y<e) wi+=win(r.x+r.w/2-wl/2,0,r.x+r.w/2+wl/2,0);
    if(r.x+r.w>W-e) wi+=win(W,r.y+r.h/2-hl/2,W,r.y+r.h/2+hl/2);
    if(r.x<e) wi+=win(0,r.y+r.h/2-hl/2,0,r.y+r.h/2+hl/2);
    if(r.y+r.h>H-e&&r.t!=='h') wi+=win(r.x+r.w/2-wl/2,H,r.x+r.w/2+wl/2,H);
  });
  // двери: каждая комната — к холлу/гостиной/спальне, с которой делит стенку
  const pr={h:0,l:1,b:2,w:3,t:4}, dl=0.9*S;
  const shared=(a,b)=>{ const T=2; if(Math.abs(a.x+a.w-b.x)<T||Math.abs(b.x+b.w-a.x)<T){ const y1=Math.max(a.y,b.y),y2=Math.min(a.y+a.h,b.y+b.h); if(y2-y1>dl+8) return {v:1,x:Math.abs(a.x+a.w-b.x)<T?a.x+a.w:a.x,a:y1,b:y2}; } if(Math.abs(a.y+a.h-b.y)<T||Math.abs(b.y+b.h-a.y)<T){ const x1=Math.max(a.x,b.x),x2=Math.min(a.x+a.w,b.x+b.w); if(x2-x1>dl+8) return {v:0,y:Math.abs(a.y+a.h-b.y)<T?a.y+a.h:a.y,a:x1,b:x2}; } return null; };
  const hall=out.filter(r=>r.t==='h');
  out.forEach(r=>{ if(r.t==='h'&&r===hall[0]) return; let best=null;
    out.forEach(o=>{ if(o===r) return; const sh=shared(r,o); if(!sh) return; let sc=(r.t==='t'||r.t==='w')?(o.t==='b'?0:o.t==='h'?1:2):(o.t==='h'?0:o.t==='l'?1:2); if(r.t==='l'&&o.t==='l') sc=0; if(!best||sc<best.sc) best={sc,sh}; });
    if(!best) return; const sh=best.sh, mid=(sh.a+sh.b)/2;
    if(sh.v){ dr+=`<line x1="${sh.x}" y1="${mid-dl/2}" x2="${sh.x}" y2="${mid+dl/2}" stroke="#fff" stroke-width="7"/><path d="M${sh.x} ${mid-dl/2} L${sh.x+dl*0.9} ${mid-dl/2} A${dl*0.9} ${dl*0.9} 0 0 1 ${sh.x} ${mid+dl*0.4}" fill="none" stroke="#9A8A66" stroke-width="1.2"/>`; }
    else { dr+=`<line x1="${mid-dl/2}" y1="${sh.y}" x2="${mid+dl/2}" y2="${sh.y}" stroke="#fff" stroke-width="7"/><path d="M${mid-dl/2} ${sh.y} L${mid-dl/2} ${sh.y+dl*0.9} A${dl*0.9} ${dl*0.9} 0 0 0 ${mid+dl*0.4} ${sh.y}" fill="none" stroke="#9A8A66" stroke-width="1.2"/>`; } });
  // входная дверь — внизу у холла
  const h0=hall[hall.length-1]||out[0]; const ex=h0.x+h0.w/2;
  dr+=`<line x1="${ex-dl/2}" y1="${H}" x2="${ex+dl/2}" y2="${H}" stroke="#fff" stroke-width="9"/><path d="M${ex-dl/2} ${H} L${ex-dl/2} ${H+dl*0.0} " /><polygon points="${ex-12},${H+30} ${ex+12},${H+30} ${ex},${H+12}" fill="#B8862F"/><text x="${ex}" y="${H+pad-6}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="#8A6B2E" letter-spacing="2">ВХОД</text>`;
  out.forEach(r=>{ const L=LAB.get(r), f1=L.f1, lines=L.lines, cx=r.x+r.w/2, a=fm(r.m);
    if(L.ok){ const y0=(r.t==='b'||r.t==='l'||r.t==='t'||r.t==='w')?r.y+5:r.y+r.h/2-((lines.length+1)*f1*1.1)/2; lb+=`<text text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="${f1.toFixed(1)}" fill="#2B2A26" font-weight="600">`+lines.map((l,i)=>`<tspan x="${cx.toFixed(1)}" y="${(y0+(i+0.85)*f1*1.1).toFixed(1)}">${l}</tspan>`).join('')+`<tspan x="${cx.toFixed(1)}" y="${(y0+(lines.length+0.85)*f1*1.1+2).toFixed(1)}" font-family="Inter,Arial,sans-serif" font-size="${(f1*0.85).toFixed(1)}" fill="#8A6B2E" font-weight="700">${a} м²</tspan></text>`; }
    else { const fz=Math.max(8,Math.min(11,r.w/5)); lb+=`<text x="${cx.toFixed(1)}" y="${(r.y+r.h/2+fz*0.35).toFixed(1)}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="${fz.toFixed(1)}" fill="#8A6B2E" font-weight="700">${a}</text>`; } });
  const dim=`<text x="${W/2}" y="-14" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="#8A6B2E" letter-spacing="2">${fm(Wm)} м</text><text transform="translate(-14 ${H/2}) rotate(-90)" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="#8A6B2E" letter-spacing="2">${fm(Hm)} м</text>`;
  return `<svg viewBox="${-pad} ${-pad} ${W+2*pad} ${H+2*pad+10}" style="width:100%;height:auto;display:block;background:#FFFDF8;border-radius:12px" role="img" aria-label="Планировка ${M.TYPES[k].rooms}-комнатной квартиры, ${fm(tot)} м²"><rect x="${-pad+5}" y="${-pad+5}" width="${W+2*pad-10}" height="${H+2*pad}" fill="none" stroke="#C9A66B" stroke-width="1.2"/>${rg}${fu}${dr}<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#1E1D1A" stroke-width="9"/>${wi}${lb}${dim}</svg>`;
};
window.SHEV_planOrder=function(k){ const o=best(k).out.map((r,i)=>({i,n:r.n,m:r.m,t:r.t,x:r.x,y:r.y,w:r.w,h:r.h})); const pr=r=>{ if(r.t==='h') return /Холл|Входн|Прихож/.test(r.n)&&/Прихож|Входн/.test(r.n)?0:1; if(r.t==='l') return /Гости/.test(r.n)?2:/Кухня/.test(r.n)?3:4; if(r.t==='b') return /Мастер/.test(r.n)?5:8; if(r.t==='w') return 6; if(r.t==='t') return /мастер/.test(r.n)?7:/Гостев/.test(r.n)?9:10; return 11; };
  return o.sort((a,b)=>pr(a)-pr(b)||a.i-b.i); };
window.SHEV_roomsTable=function(k){ const r=R[k], t=r.reduce((p,q)=>p+q[1],0); return '<table class="rooms num">'+r.map(x=>`<tr><td>${x[0]}</td><td>${x[1].toFixed(1).replace('.',',')} м²</td></tr>`).join('')+`<tr class="sum"><td>Общая площадь квартиры</td><td>${t.toFixed(1).replace('.',',')} м²</td></tr></table>`; };
window.SHEV_PLAN_NOTE='Планировка и экспликация помещений. Площади помещений в сумме дают общую площадь квартиры.';
})();
