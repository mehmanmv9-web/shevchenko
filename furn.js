/* Расстановка мебели в планировках. Нормы: проходы ≥0,9 м, у кровати с боков ≥0,6–0,7 м, у ног ≥0,9 м,
   гардероб/шкаф — фасад ≥0,9 м, кухня — проход между линиями ≥1,1 м, диван–ТВ 2,5–3,5 м,
   обеденный стол — отступ от стен ≥0,75 м, унитаз — ≥0,6 м перед ним, стиральная машина — ≥0,9 м перед ней.
   Двери и окна не перекрываются: перед дверью зона открывания, высокая мебель не закрывает окна. */
(function(){
const FILL='#EFE6D0', UPH='#E6DAC0', WOOD='#DCCBA3', LN='#8F7F5C', WLN='#7E979E';
const ov=(a,b,e)=>{ e=e||0; return a.x<b.x+b.w-e&&a.x+a.w>b.x+e&&a.y<b.y+b.h-e&&a.y+a.h>b.y+e; };
const within=(a,r,e)=>a.x>=r.x-e&&a.y>=r.y-e&&a.x+a.w<=r.x+r.w+e&&a.y+a.h<=r.y+r.h+e;
const f1=v=>v.toFixed(1);
window.SHEV_furnish=function(C){
 const S=C.S, m=v=>v*S, T=m(0.07);
 const st=(f,s,w)=>`fill="${f||FILL}" stroke="${s||LN}" stroke-width="${w||1.2}"`;
 const Rr=(x,y,w,h,f,rx,s)=>`<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx||0}" ${st(f,s)}/>`;
 const Ci=(x,y,r,f,s)=>`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${st(f,s)}/>`;
 const El=(x,y,rx,ry,f,s)=>`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" ${st(f,s)}/>`;
 const Ln=(x1,y1,x2,y2,c,w)=>`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c||LN}" stroke-width="${w||1}"/>`;
 const chair=(x,y,d,th)=>`<g transform="translate(${f1(x)} ${f1(y)}) rotate(${th||0})">${Rr(-d/2,-d/2,d,d,UPH,3)}${Rr(-d/2,-d/2,d,d*0.22,'#CDB88A',2)}</g>`;
 /* ---------- рисунки (локальная система: центр предмета в 0,0; «спинка» сверху, лицо — вниз) ---------- */
 const DRAW={
  bed:i=>{ const a=i.a,b=i.b,x=-a/2,y=-b/2; let g=Rr(x,y,a,b,'#FBF7EC',3)+Rr(x,y,a,0.09*S,'#CDB88A',1); const n=a>1.5*S?2:1, pw=(a-0.3*S-(n-1)*0.1*S)/n; for(let k=0;k<n;k++) g+=Rr(x+0.15*S+k*(pw+0.1*S),y+0.15*S,pw,0.36*S,'#FFFFFF',4); return g+Rr(x,y+0.6*S,a,b-0.6*S,'#E9DEC6',3)+Ln(x,y+0.88*S,x+a,y+0.88*S); },
  ns:i=>Rr(-i.a/2,-i.b/2,i.a,i.b,WOOD,2)+Ci(0,0,Math.min(i.a,i.b)*0.22,'#FFF3CF'),
  wd:i=>{ const a=i.a,b=i.b; let g=Rr(-a/2,-b/2,a,b,FILL,1); const n=Math.max(2,Math.round(a/m(0.6))); for(let k=1;k<n;k++) g+=Ln(-a/2+a*k/n,-b/2,-a/2+a*k/n,b/2); return g+Ln(-a/2,b/2-2,a/2,b/2-2,'#B9A57A'); },
  dr:i=>{ const a=i.a,b=i.b; return Rr(-a/2,-b/2,a,b,WOOD,2)+[1,2].map(k=>Ln(-a/2+4,-b/2+b*k/3,a/2-4,-b/2+b*k/3)).join(''); },
  bn:i=>Rr(-i.a/2,-i.b/2,i.a,i.b,UPH,5),
  sofa:i=>sofaD(i.a,i.b),
  arm:i=>Rr(-i.a/2,-i.b/2,i.a,i.b,UPH,6)+Rr(-i.a/2,-i.b/2,i.a,i.b*0.24,'#CDB88A',5)+Rr(-i.a/2,-i.b/2,i.a*0.14,i.b,'#D8CBA8',4)+Rr(i.a/2-i.a*0.14,-i.b/2,i.a*0.14,i.b,'#D8CBA8',4),
  tv:i=>Rr(-i.a/2,-i.b/2,i.a,i.b,WOOD,2)+Ln(-i.a*0.34,-i.b*0.2,i.a*0.34,-i.b*0.2,'#555',2.5),
  cons:i=>Rr(-i.a/2,-i.b/2,i.a,i.b,WOOD,2),
  shelf:i=>{ let g=Rr(-i.a/2,-i.b/2,i.a,i.b,FILL,1); const n=Math.round(i.a/m(0.4)); for(let k=1;k<n;k++) g+=Ln(-i.a/2+i.a*k/n,-i.b/2,-i.a/2+i.a*k/n,i.b/2,'#B9A57A'); return g; },
  tab:i=>{ const a=i.a,b=i.b; let g=Rr(-a/2,-b/2,a,b,WOOD,4); const lg=a>=b; const L=lg?a:b, W=lg?b:a, n=Math.max(2,Math.floor(L/m(0.62))); const cd=0.46*S;
    for(let k=0;k<n;k++){ const p=-L/2+L*(k+0.5)/n; if(lg){ g+=chair(p,-b/2-0.12*S,cd,180)+chair(p,b/2+0.12*S,cd,0); } else { g+=chair(-a/2-0.12*S,p,cd,90)+chair(a/2+0.12*S,p,cd,270); } }
    if(lg){ g+=chair(-a/2-0.12*S,0,cd,90)+chair(a/2+0.12*S,0,cd,270); } else { g+=chair(0,-b/2-0.12*S,cd,180)+chair(0,b/2+0.12*S,cd,0); } return g; },
  kit:i=>{ const a=i.a,b=i.b,x=-a/2,y=-b/2; let g=Rr(x,y,a,b,FILL,1), fw=Math.min(0.7*S,a*0.2); g+=Rr(x,y,fw,b,'#F6F2E8',1)+Ln(x,y+b*0.5,x+fw,y+b*0.5)+Ln(x+fw*0.5,y+2,x+fw*0.5,y+b*0.4,'#999');
    const rem=a-fw, hx=x+fw+rem*0.62, sx=x+fw+rem*0.22; g+=Rr(hx-0.3*S,y+b*0.12,0.6*S,b*0.76,'#F6F2E8',2); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>{ g+=Ci(hx+q[0]*0.14*S,y+b/2+q[1]*0.14*S,0.07*S,'#DDD','#666'); });
    g+=Rr(sx-0.4*S,y+b*0.12,0.8*S,b*0.76,'#FFFFFF',3,WLN)+Rr(sx-0.34*S,y+b*0.2,0.5*S,b*0.6,'#EEF4F5',3,WLN)+Ci(sx+0.28*S,y+b/2,0.04*S,'#999','#666'); return g+Ln(x,y+b-1.5,x+a,y+b-1.5,'#B9A57A'); },
  isl:i=>{ const a=i.a,b=i.b,x=-a/2,y=-b/2; let g=Rr(x,y,a,b,'#F4EEDD',3)+Rr(x+0.3*S,y+b*0.2,0.6*S,b*0.6,'#FFFFFF',3,WLN); const n=Math.max(2,Math.floor(a/m(0.62))); for(let k=0;k<n;k++){ g+=Ci(x+a*(k+0.5)/n,y+b+0.2*S,0.16*S,UPH); } return g; },
  nook:i=>{ const a=i.a,b=i.b; return Ci(0,0,0.32*S,WOOD)+`<g transform="translate(${f1(-a/2+0.45*S)} 0) rotate(270)">${DRAW.arm({a:0.85*S,b:0.85*S})}</g><g transform="translate(${f1(a/2-0.45*S)} 0) rotate(90)">${DRAW.arm({a:0.85*S,b:0.85*S})}</g>`; },
  desk:i=>{ const a=i.a,b=i.b; return Rr(-a/2,-b/2,a,b,WOOD,2)+Rr(-0.22*S,-b/2+0.12*S,0.44*S,0.03*S,'#555',1)+chair(0,b/2+0.34*S,0.5*S,0); },
  rail:i=>{ const a=i.a,b=i.b; let g=Rr(-a/2,-b/2,a,b,FILL,1); const n=Math.round(a/m(0.08)); for(let k=1;k<n;k++) g+=Ln(-a/2+a*k/n,-b/2+3,-a/2+a*k/n,b/2-3,'#C8B88F',0.8); return g+Ln(-a/2,0,a/2,0,'#8F7F5C',1.4); },
  wisl:i=>{ let g=Rr(-i.a/2,-i.b/2,i.a,i.b,'#F4EEDD',2); for(let k=1;k<4;k++) g+=Ln(-i.a/2,-i.b/2+i.b*k/4,i.a/2,-i.b/2+i.b*k/4,'#C8B88F'); return g; },
  tub:i=>{ const a=i.a,b=i.b; return Rr(-a/2,-b/2,a,b,'#FFFFFF',b*0.45,WLN)+Rr(-a/2+4,-b/2+4,a-8,b-8,'#EEF4F5',b*0.4,WLN)+Ci(-a/2+b*0.4,0,2.5,'#999','#666'); },
  ftub:i=>{ const a=i.a,b=i.b; return El(0,0,a/2,b/2,'#FFFFFF',WLN)+El(0,0,a/2-5,b/2-5,'#EEF4F5',WLN)+Ci(-a/2+b*0.4,0,2.5,'#999','#666'); },
  shw:i=>{ const a=i.a,b=i.b; return Rr(-a/2,-b/2,a,b,'#EEF4F5',1,WLN)+Ln(-a/2,-b/2,a/2,b/2,'#B6C8CC')+Ln(-a/2,b/2,a/2,-b/2,'#B6C8CC')+Ci(0,0,3,'#999','#666')+Ln(-a/2,b/2,a/2,b/2,WLN,3); },
  wc:i=>{ const a=i.a,b=i.b; return Rr(-a*0.42,-b/2,a*0.84,b*0.28,'#FFFFFF',3,WLN)+El(0,b*0.08,a*0.4,b*0.36,'#FFFFFF',WLN); },
  van:i=>{ const a=i.a,b=i.b; let g=Rr(-a/2,-b/2,a,b,'#F4EEDD',2); const n=a>1.15*S?2:1; for(let k=0;k<n;k++){ g+=El(-a/2+a*(k+0.5)/n,0.04*S,Math.min(0.22*S,a/n*0.34),b*0.32,'#FFFFFF',WLN); } return g; },
  wm:i=>{ const a=i.a,b=i.b; return Rr(-a/2,-b/2,a,b,'#FFFFFF',3,WLN)+Ci(0,b*0.06,Math.min(a,b)*0.34,'#EEF4F5',WLN); },
  cab:i=>Rr(-i.a/2,-i.b/2,i.a,i.b,FILL,1)+Ln(-i.a/2,0,i.a/2,0,'#B9A57A')
 };
 function sofaD(a,b){ const x=-a/2,y=-b/2; let g=Rr(x,y,a,b,UPH,6)+Rr(x,y,a,b*0.26,'#CDB88A',5)+Rr(x,y,a*0.07,b,'#D8CBA8',4)+Rr(x+a-a*0.07,y,a*0.07,b,'#D8CBA8',4); const n=Math.max(2,Math.round(a/m(0.75))); for(let k=1;k<n;k++) g+=Ln(x+a*0.07+(a*0.86)*k/n,y+b*0.26,x+a*0.07+(a*0.86)*k/n,y+b-3,'#B9A57A'); return g; }
 DRAW.lounge=i=>{ const sa=i.sofa, sb=m(0.95), x0=-i.a/2, y0=-i.b/2; let g=`<g transform="translate(0 ${f1(y0+sb/2)})">${sofaD(sa,sb)}</g>`; if(i.min) return g; const tw=i.tw, td=i.td, ty=y0+sb+m(0.4)+td/2; g+=Rr(-tw/2,ty-td/2,tw,td,WOOD,4);
   if(i.arms){ const ax=tw/2+m(0.15)+m(0.43); g+=`<g transform="translate(${f1(-ax)} ${f1(ty)}) rotate(270)">${DRAW.arm({a:m(0.85),b:m(0.85)})}</g><g transform="translate(${f1(ax)} ${f1(ty)}) rotate(90)">${DRAW.arm({a:m(0.85),b:m(0.85)})}</g>`; }
   return g+Rr(-m(0.9),ty-m(0.25),m(1.8),m(0.5),'rgba(230,215,185,.45)',8,'#D9CBA6'); };
 const I=(k,a,b,o)=>Object.assign({k,a:m(a),b:m(b),cf:m((o&&o.cf)||0),cs:m((o&&o.cs)||0),cb:m((o&&o.cb)||0),cfMin:o&&o.cfMin?m(o.cfMin):0,draw:DRAW[k]||DRAW.cons},o&&{tall:o.tall,sideMin:o.sideMin,in:o.in,strict:o.strict,dk:o.dk});
 function geo(it,cx,cy,th){ const hor=th%180===0, bw=hor?it.a:it.b, bh=hor?it.b:it.a, cf=it.cf, cb=it.cb, cs=it.cs;
  const body={x:cx-bw/2,y:cy-bh/2,w:bw,h:bh};
  const F={0:{x:body.x,y:body.y+bh,w:bw,h:cf},180:{x:body.x,y:body.y-cf,w:bw,h:cf},90:{x:body.x-cf,y:body.y,w:cf,h:bh},270:{x:body.x+bw,y:body.y,w:cf,h:bh}}[th];
  const K={0:{x:body.x,y:body.y-cb,w:bw,h:cb},180:{x:body.x,y:body.y+bh,w:bw,h:cb},90:{x:body.x+bw,y:body.y,w:cb,h:bh},270:{x:body.x-cb,y:body.y,w:cb,h:bh}}[th];
  const sd=hor?[{x:body.x-cs,y:body.y,w:cs,h:bh},{x:body.x+bw,y:body.y,w:cs,h:bh}]:[{x:body.x,y:body.y-cs,w:bw,h:cs},{x:body.x,y:body.y+bh,w:bw,h:cs}];
  return {body,F:cf?F:null,K:cb?K:null,sides:cs?sd:[],cx,cy,th,it}; }
 /* ---------- комнаты ---------- */
 const rooms=C.out.map((r,i)=>{ const inn={x:r.x+T,y:r.y+T,w:r.w-2*T,h:r.h-2*T}; const rr={x:r.x,y:r.y,w:r.w,h:r.h};
   return {r,i,m:r.m,inn,rr,placed:[],svg:'',lab:C.lab&&C.lab[i]||null,wins:C.wins.filter(w=>ov(w,rr,0)&&ov(w,{x:rr.x-3,y:rr.y-3,w:rr.w+6,h:rr.h+6},0)),dc:C.dcent.filter(d=>d.x>=rr.x-4&&d.x<=rr.x+rr.w+4&&d.y>=rr.y-4&&d.y<=rr.y+rr.h+4)}; });
 function check(room,g){ const it=g.it, inn=room.inn; if(!within(g.body,inn,0.6)) return null;
  for(const d of C.zones) if(ov(g.body,d,1.5)) return null;
  if(it.k==='tab'){ const e=m(0.6), ex={x:g.body.x-e,y:g.body.y-e,w:g.body.w+2*e,h:g.body.h+2*e}; for(const d of C.zones) if(ov(ex,d,1.5)) return null; }
  if(it.tall) for(const w of room.wins) if(ov(g.body,w,0)) return null;
  for(const o of room.placed){ if(ov(g.body,o.body,0.6)) return null; if(!(it.in&&it.in.indexOf(o.it.k)>=0)) for(const z of o.zones) if(ov(g.body,z,1.5)) return null; }
  const zs=[]; if(g.F) zs.push(g.F);
  if(g.F&&!within(g.F,inn,1.5)) return null;
  if(g.K){ const th=g.th, b=g.body; const dB=th===0?b.y-inn.y:th===180?inn.y+inn.h-(b.y+b.h):th===90?inn.x+inn.w-(b.x+b.w):b.x-inn.x; if(it.strict){ if(dB<g.it.cb-1.5) return null; } else if(dB>m(0.14)&&dB<g.it.cb-1.5) return null; if(dB>=g.it.cb-1.5) zs.push(g.K); }
  let sc=0; for(const s of g.sides){ if(within(s,inn,1.5)&&!room.placed.some(o=>ov(s,o.body,1.5))&&!C.zones.some(d=>ov(s,d,1.5))) { sc++; zs.push(s); } }
  if(sc<(it.sideMin||0)) return null;
  for(const z of zs){ for(const o of room.placed) if(ov(z,o.body,1.5)&&!(o.it.in&&o.it.in.indexOf(it.k)>=0)) return null; }
  return {sc,zs}; }
 function labPen(room,g){ const L=room.lab; if(!L) return 0; const x=Math.max(0,Math.min(g.body.x+g.body.w,L.x+L.w)-Math.max(g.body.x,L.x)), y=Math.max(0,Math.min(g.body.y+g.body.h,L.y+L.h)-Math.max(g.body.y,L.y)); return x*y/(L.w*L.h)*4; }
 function wallCands(room,it,walls){ const inn=room.inn,res=[]; for(const w of walls){ const hor=w==='T'||w==='B', L=hor?inn.w:inn.h, a=it.a; if(a>L+0.5) continue; const n=Math.max(1,Math.round((L-a)/m(0.1)));
   for(let k=0;k<=n;k++){ const p=Math.max(0,L-a)*k/n; let cx,cy,th;
    if(w==='T'){cx=inn.x+p+a/2;cy=inn.y+it.b/2;th=0;} else if(w==='B'){cx=inn.x+p+a/2;cy=inn.y+inn.h-it.b/2;th=180;} else if(w==='L'){cx=inn.x+it.b/2;cy=inn.y+p+a/2;th=270;} else {cx=inn.x+inn.w-it.b/2;cy=inn.y+p+a/2;th=90;}
    const g=geo(it,cx,cy,th); g.w=w; g.p=p; g.L=L; res.push(g); } } return res; }
 function gridCands(room,it,ths,step){ const inn=room.inn,res=[]; for(const th of ths){ const hor=th%180===0, bw=hor?it.a:it.b, bh=hor?it.b:it.a; for(let x=inn.x+bw/2;x<=inn.x+inn.w-bw/2+0.5;x+=step) for(let y=inn.y+bh/2;y<=inn.y+inn.h-bh/2+0.5;y+=step) res.push(geo(it,x,y,th)); } return res; }
 function commit(room,g,res){ const zs=res.zs; room.placed.push({body:g.body,zones:zs,it:g.it}); room.svg+=`<g transform="translate(${f1(g.cx)} ${f1(g.cy)}) rotate(${g.th})">${g.it.draw(g.it)}</g>`; return g; }
 function put(room,it,o){ o=o||{}; const gen=x=>o.gen?o.gen(x):wallCands(room,x,o.walls||'TBLR'); const tries=[it]; if(it.cfMin&&it.cfMin<it.cf) tries.push(Object.assign({},it,{cf:it.cfMin}));
  for(const x of tries){ let best=null,bs=1e9,br=null; for(const g of gen(x)){ const r=check(room,g); if(!r) continue; let s=labPen(room,g)+(o.pref?o.pref(g,r):0)-(x.corner?cornerN(room,g):0)*0.4+(r.sc<2&&x.sideMin?1.5:0); if(s<bs){bs=s;best=g;br=r;} } if(best) return commit(room,best,br); } return null; }
 function cornerN(room,g){ const i=room.inn,b=g.body,e=m(0.12); const t=(b.y-i.y<e?1:0)+(i.y+i.h-b.y-b.h<e?1:0), l=(b.x-i.x<e?1:0)+(i.x+i.w-b.x-b.w<e?1:0); return Math.min(t,1)+Math.min(l,1); }
 const dist=(x1,y1,x2,y2)=>Math.hypot(x1-x2,y1-y2)/S;
 const nearDoor=g=>room0=>0;
 const winC=room=>room.wins.map(w=>({x:w.x+w.w/2,y:w.y+w.h/2}));
 const doorD=(room,g)=>{ let d=9; room.dc.forEach(p=>{ d=Math.min(d,dist(p.x,p.y,g.cx,g.cy)); }); return d; };
 const winOv=(room,g)=>room.wins.some(w=>ov(g.body,w,0))?1:0;
 const winD=(room,g)=>{ let d=9; winC(room).forEach(p=>{ d=Math.min(d,dist(p.x,p.y,g.cx,g.cy)); }); return d; };
 const nameOf=room=>room.r.n;
 /* --- спальни --- */
 function bedroom(room){ const A=room.m, master=/Мастер/.test(nameOf(room)), study=/кабинет/i.test(nameOf(room));
  const ba=master?(A>=30?2.0:A>=22?1.9:1.8):(A>=20?1.8:A>=12?1.6:1.4), bb=master&&A>=22?2.2:2.0;
  const bed=put(room,I('bed',ba,bb,{cf:0.9,cfMin:0.7,cs:0.7,sideMin:1,strict:false}),{pref:(g,r)=>{ let s=winOv(room,g)*5+Math.abs(g.p-(g.L-g.it.a)/2)/S*0.5+(2-r.sc)*3; if(room.dc.some(d=>(g.w==='T'||g.w==='B')?(d.x>g.body.x&&d.x<g.body.x+g.body.w&&Math.abs(d.y-(g.w==='T'?room.rr.y+room.rr.h:room.rr.y))<m(0.5)):(d.y>g.body.y&&d.y<g.body.y+g.body.h&&Math.abs(d.x-(g.w==='L'?room.rr.x+room.rr.w:room.rr.x))<m(0.5)))) s+=3; return s; }});
  if(bed){ const b=bed.body, ns=()=>I('ns',0.5,0.42,{in:['bed']}); const hw=bed.w;
   [-1,1].forEach(sg=>{ const it=ns(); let cx,cy; if(hw==='T'||hw==='B'){ cx=sg<0?b.x-it.a/2-m(0.04):b.x+b.w+it.a/2+m(0.04); cy=hw==='T'?b.y+it.b/2:b.y+b.h-it.b/2; } else { cy=sg<0?b.y-it.a/2-m(0.04):b.y+b.h+it.a/2+m(0.04); cx=hw==='L'?b.x+it.b/2:b.x+b.w-it.b/2; }
    const th=bed.th, g=geo(it,cx,cy,th), r=check(room,g); if(r) commit(room,g,r); });
   if(A>=24){ const it=I('bn',1.6,0.45,{in:['bed']}); const fw=bed.th; let cx=bed.cx,cy=bed.cy; const off=(bed.th%180===0?bed.body.h:bed.body.w)/2+it.b/2+m(0.12); if(fw===0) cy+=off; else if(fw===180) cy-=off; else if(fw===90) cx-=off; else cx+=off; const g=geo(it,cx,cy,(fw+180)%360), r=check(room,g); if(r) commit(room,g,r); } }
  if(study||(!master&&A>=13)){ put(room,I('desk',1.4,0.65,{cf:0.95,cfMin:0.8}),{pref:(g,r)=>winD(room,g)*1.2+doorD(room,g)*-0.1}); }
  if(!master){ const wa=Math.min(A>=20?2.4:1.8,room.r.w/S-0.5); put(room,I('wd',wa,0.6,{cf:0.9,cfMin:0.8,tall:true}),{pref:(g,r)=>-doorD(room,g)*0.1}); if(!bed) {} }
  else { if(A>=17) put(room,I('dr',1.5,0.5,{cf:0.9,cfMin:0.8}),{pref:(g,r)=>winOv(room,g)*2}); }
  if(master&&A>=30){ put(room,I('nook',2.4,1.4,{cs:0.2,cf:0.5,cb:0.5}),{gen:x=>gridCands(room,x,[0,90],m(0.2)),pref:(g,r)=>winD(room,g)*1.5}); }
  if(master&&A>=50){ put(room,I('sofa',2.4,0.95,{cf:1.0}),{pref:(g,r)=>doorD(room,g)*-0.2}); put(room,I('tv',1.8,0.42,{cf:0.2}),{pref:(g,r)=>0}); }
  else if(master&&A>=24){ put(room,I('tv',1.6,0.42,{cf:0.2}),{pref:(g,r)=>winOv(room,g)*3}); } }
 /* --- прихожие, холлы --- */
 function hallRoom(room){ const A=room.m, ent=/Прихож|Входн/.test(nameOf(room));
  if(ent){ put(room,I('wd',A>=12?2.4:1.8,0.6,{cf:0.9,cfMin:0.8,tall:true}),{pref:(g,r)=>doorD(room,g)*0.1}); if(A>=8) put(room,I('bn',1.0,0.4,{cf:0.6,cfMin:0.5}),{pref:(g,r)=>doorD(room,g)*0.2}); if(A>=16) put(room,I('wd',1.5,0.6,{cf:0.9,cfMin:0.8,tall:true})); if(A>=20) put(room,I('cons',1.4,0.4,{cf:0.9,cfMin:0.8})); }
  else { put(room,I('cons',A>=10?1.4:1.1,0.4,{cf:1.0,cfMin:0.85}),{pref:(g,r)=>doorD(room,g)*-0.1}); if(A>=10) put(room,I('arm',0.8,0.8,{cf:0.8,cfMin:0.7})); if(A>=18) put(room,I('cons',1.4,0.4,{cf:1.0,cfMin:0.85})); } }
 /* --- гостиные, кухни --- */
 function living(room){ const A=room.m, n=nameOf(room), comb=/Кухня-г/.test(n), kit=/^Кухня$/.test(n), lounge=/Гостиная|Кухня-г/.test(n), study=/Кабинет/.test(n); let anchor=null;
  if(study){ put(room,I('desk',1.8,0.8,{cf:1.0,cfMin:0.85}),{pref:(g,r)=>winD(room,g)*1.2}); put(room,I('shelf',Math.min(3.0,room.r.w/S-0.6),0.35,{cf:0.9,cfMin:0.8,tall:true}),{pref:(g,r)=>winOv(room,g)*9}); put(room,I('sofa',2.0,0.9,{cf:0.8,cfMin:0.7}),{pref:(g,r)=>doorD(room,g)*-0.1}); if(A>=16) put(room,I('arm',0.85,0.85,{cf:0.7,cfMin:0.6})); return; }
  if(comb||kit){ const base=comb?(A>=36?4.9:4.1):(A>=30?5.6:A>=22?4.9:4.1); let run=null;
   for(const L of [base,base-0.6,base-1.2,3.2]){ run=put(room,I('kit',L,0.62,{cf:1.15,cfMin:0.95}),{pref:(g,r)=>winOv(room,g)*-0.5+doorD(room,g)*0.25+(g.w==='B'?1:0)}); if(run) break; }
   if(run){ anchor={x:run.cx,y:run.cy}; if(A>=(comb?34:20)){ const ia=comb?2.0:2.4, ib=0.95; let done=false; for(const aisle of [1.1,1.2,1.0]) for(const off of [0,0.3,-0.3,0.6,-0.6,0.9,-0.9]){ if(done) break; const it=I('isl',ia,ib,{cf:0.85,cfMin:0.7,cb:aisle}); const gap=run.it.b/2+m(aisle)+it.b/2+1, th=run.th; let cx=run.cx,cy=run.cy; const al=m(off);
      if(th===0){cy+=gap; cx+=al;} else if(th===180){cy-=gap; cx+=al;} else if(th===90){cx-=gap; cy+=al;} else {cx+=gap; cy+=al;}
      const g=geo(it,cx,cy,th), rs=check(room,g); if(rs){ commit(room,g,rs); done=true; } } } } }
  const loungeB=(armsOK,minimal)=>{ if(!lounge) return true; const sa=A>=60?3.0:A>=35?2.6:2.2, arms=armsOK&&A>=35, tw=A>=35?1.3:1.1, td=A>=35?0.7:0.6, gw=arms?Math.max(sa,tw+2*1.0):sa, gd=minimal?1.1:0.95+0.4+td+(arms?0.2:0.15);
   const grp=I('lounge',gw,gd,{cf:0.8,cfMin:0.7,cb:0.9}); grp.sofa=m(sa); grp.tw=m(tw); grp.td=m(td); grp.arms=arms; grp.min=!!minimal;
   let best=null,bs=1e9,tvIt=I('tv',A>=35?2.4:1.8,0.42,{cf:0.0});
   for(const g0 of wallCands(room,tvIt,'TBLR')){ if(g0.p%(m(0.3))>m(0.12)&&g0.p>1&&g0.p<g0.L-g0.it.a-1) continue; const r0=check(room,g0); if(!r0) continue;
    for(const gap of (minimal?[1.7,2.1,2.5,2.9]:[0.9,1.2,1.6,2.1,2.7])){ const nm={0:[0,1],180:[0,-1],90:[-1,0],270:[1,0]}[g0.th], d=g0.it.b/2+m(gap)+(g0.th%180===0?gd:gd)*S/2; const cx=g0.cx+nm[0]*d, cy=g0.cy+nm[1]*d, th=(g0.th+180)%360;
     const gg=geo(grp,cx,cy,th); const rr=check(room,gg); if(!rr) continue;
     const s=winOv(room,g0)*4+dist(anchor?anchor.x:gg.cx,anchor?anchor.y:gg.cy,cx,cy)*-0.35+labPen(room,gg)+Math.abs(gap-1.3)*0.5+doorD(room,g0)*-0.05;
     if(s<bs){ bs=s; best={g0,r0,gg,rr}; } } }
   if(best){ commit(room,best.g0,best.r0); const rr2=check(room,best.gg); commit(room,best.gg,rr2||best.rr); }
   else { put(room,I('sofa',sa,0.95,{cf:1.2,cfMin:0.9}),{pref:(g,r)=>doorD(room,g)*-0.1}); put(room,I('tv',1.8,0.42,{cf:0.0}),{}); }
   if(A>=60){ put(room,I('nook',2.4,1.5,{cf:0.5,cb:0.5,cs:0.3}),{gen:x=>gridCands(room,x,[0,90],m(0.2)),pref:(g,r)=>winD(room,g)*1.5}); put(room,I('shelf',2.4,0.35,{cf:0.9,cfMin:0.8,tall:true}),{pref:(g,r)=>winOv(room,g)*9}); put(room,I('cons',1.6,0.45,{cf:0.9,cfMin:0.8}),{}); }
   if(A>=84){ put(room,I('shelf',2.8,0.35,{cf:0.9,cfMin:0.8,tall:true}),{pref:(g,r)=>winOv(room,g)*9}); put(room,I('cons',1.8,0.45,{cf:0.9,cfMin:0.8}),{}); } return !!best; };
  const diningB=()=>{ if(!(comb||(kit&&A>=30)||(/Гостиная-столовая/.test(n)))) return true; let an=anchor; if(!an){ const kn=C.out.find(q=>/^Кухня$/.test(q.n)); an=kn?{x:kn.x+kn.w/2,y:kn.y+kn.h/2}:{x:room.inn.x+room.inn.w/2,y:room.inn.y+room.inn.h/2}; }
   const big=A>=80?[3.0,1.2]:A>=60?[2.6,1.1]:comb?(A>=36?[2.2,1.0]:[1.6,0.9]):kit?[1.8,1.0]:[2.2,1.0], big2=A>=60&&!comb;
   let tb=null; for(const [sc,zz] of [[1,0.75],[0.85,0.7],[0.85,0.6],[0.7,0.6]]){ const it=I('tab',big[0]*sc,big[1],{cf:zz,cb:zz,cs:zz,cfMin:0.6,strict:true,sideMin:2}); tb=put(room,it,{gen:x=>gridCands(room,x,[0,90],m(0.15)),pref:(g,r)=>dist(an.x,an.y,g.cx,g.cy)*1.0+(comb||kit?0:0)}); if(tb) break; }
   if(!tb&&!kit){ put(room,I('tab',1.4,0.85,{cf:0.6,cb:0.6,cs:0.6,strict:true,sideMin:2}),{gen:x=>gridCands(room,x,[0,90],m(0.15)),pref:(g,r)=>dist(an.x,an.y,g.cx,g.cy)}); }
   if(A>=44&&!kit&&tb){ put(room,I('cons',2.0,0.5,{cf:0.9,cfMin:0.8}),{pref:(g,r)=>dist(tb.cx,tb.cy,g.cx,g.cy)}); } return !!tb; };
  const snap=()=>({n:room.placed.length,s:room.svg}), rest=q=>{ room.placed.length=q.n; room.svg=q.s; };
  const q0=snap(); let okL=false; for(const seq of [['L1','D'],['D','L1'],['D','L0'],['L0','D'],['D','LM'],['LM','D']]){ rest(q0); let good=true; for(const stp of seq){ const ok=stp==='D'?diningB():loungeB(stp==='L1',stp==='LM'); if(!ok){ good=false; break; } } if(good){ okL=true; break; } }
  if(!okL){ rest(q0); diningB(); loungeB(false); } }
 /* --- гардеробные --- */
 function wardrobe(room){ const inn=room.inn, W=inn.w/S, H=inn.h/S; const walls=['T','B','L','R'].map(w=>({w,L:(w==='T'||w==='B')?W:H})).sort((a,b)=>b.L-a.L); let placed=[];
  for(const q of walls){ const opp={T:'B',B:'T',L:'R',R:'L'}[q.w]; const cross=(q.w==='T'||q.w==='B')?H:W; const oppDone=placed.indexOf(opp)>=0;
   if(oppDone&&cross-1.2<0.9) continue; if(placed.length&&!oppDone&&cross-0.6<0.9&&placed.some(p=>p!==q.w)&&false) continue;
   let bestSeg=null; const lens=[]; for(let a=Math.min(q.L,5.0);a>=0.7;a-=0.1){ const it=I('rail',a,0.6,{tall:false}); const cs=wallCands(room,it,q.w).filter(g=>check(room,g)); if(cs.length){ bestSeg=it; break; } }
   if(bestSeg){ const g=put(room,bestSeg,{walls:q.w}); if(g) placed.push(q.w); } }
  const free=Math.min(W-(placed.some(p=>p==='L')?0.6:0)-(placed.some(p=>p==='R')?0.6:0),H-(placed.some(p=>p==='T')?0.6:0)-(placed.some(p=>p==='B')?0.6:0));
  if(Math.min(W,H)>=3.0&&room.m>=14){ const ia=Math.min(1.6,Math.max(W,H)-2.4); if(ia>=0.8){ const g=put(room,I('wisl',ia,0.7,{cf:0.9,cb:0.9,cfMin:0.8}),{gen:x=>gridCands(room,x,[0,90],m(0.2)),pref:(g,r)=>dist(g.cx,g.cy,room.inn.x+room.inn.w/2,room.inn.y+room.inn.h/2)}); } } }
 /* --- санузлы --- */
 function bath(room){ const A=room.m, n=nameOf(room), mst=/мастер-спальни/.test(n), guest=/Гостев/.test(n), lau=/Постиро/.test(n);
  if(lau){ if(A>=3.5){ put(room,I('wm',0.62,0.65,{cf:0.9,cfMin:0.75,corner:1}),{}); put(room,I('wm',0.62,0.65,{cf:0.9,cfMin:0.75,corner:1}),{}); if(A>=5) put(room,I('van',0.7,0.5,{cf:0.8,cfMin:0.7}),{}); if(A>=7) put(room,I('cab',1.5,0.4,{cf:0.9,cfMin:0.8}),{}); } else { put(room,I('wm',0.62,0.65,{cf:0.8,cfMin:0.65,corner:1}),{}); put(room,I('cab',0.9,0.3,{cf:0.8,cfMin:0.6}),{}); } return; }
  if(guest){ put(room,I('wc',0.4,0.7,{cf:0.6,cfMin:0.5,cs:0.2,corner:1}),{pref:(g,r)=>doorD(room,g)*-0.1}); put(room,I('van',A>=6?0.9:0.6,0.45,{cf:0.75,cfMin:0.6,corner:1}),{}); return; }
  if(mst&&A>=12){ put(room,I('shw',1.2,1.2,{cf:0.7,cfMin:0.6,corner:1}),{}); put(room,I('ftub',1.8,0.85,{cf:0.7,cfMin:0.55,corner:0}),{pref:(g,r)=>winD(room,g)*0.8}); put(room,I('van',A>=20?2.0:1.6,0.55,{cf:0.9,cfMin:0.75}),{}); put(room,I('wc',0.4,0.7,{cf:0.6,cfMin:0.5,cs:0.2,corner:1}),{}); if(A>=20) put(room,I('wc',0.4,0.7,{cf:0.6,cfMin:0.5,cs:0.2,corner:1}),{}); return; }
  if(mst&&A>=8){ put(room,I('shw',1.0,1.0,{cf:0.7,cfMin:0.6,corner:1}),{}); put(room,I('tub',1.7,0.8,{cf:0.7,cfMin:0.55,corner:1}),{}); put(room,I('van',1.4,0.55,{cf:0.85,cfMin:0.7}),{}); put(room,I('wc',0.4,0.7,{cf:0.6,cfMin:0.5,cs:0.2,corner:1}),{}); return; }
  if(A>=9){ put(room,I('shw',1.0,1.0,{cf:0.7,cfMin:0.6,corner:1}),{}); put(room,I('tub',1.7,0.75,{cf:0.7,cfMin:0.55,corner:1}),{}); put(room,I('van',1.0,0.5,{cf:0.8,cfMin:0.7}),{}); put(room,I('wc',0.4,0.7,{cf:0.6,cfMin:0.5,cs:0.2,corner:1}),{}); return; }
  if(A>=5.2&&!mst){ const t=put(room,I('tub',1.7,0.75,{cf:0.7,cfMin:0.55,corner:1}),{}); if(!t) put(room,I('shw',0.9,0.9,{cf:0.7,cfMin:0.6,corner:1}),{}); put(room,I('van',0.8,0.5,{cf:0.75,cfMin:0.65}),{}); put(room,I('wc',0.4,0.7,{cf:0.6,cfMin:0.5,cs:0.2,corner:1}),{}); return; }
  put(room,I('shw',0.9,0.9,{cf:0.7,cfMin:0.6,corner:1}),{}); put(room,I('van',0.8,0.5,{cf:0.7,cfMin:0.6}),{}); put(room,I('wc',0.4,0.7,{cf:0.55,cfMin:0.45,cs:0.15,corner:1}),{}); }
 /* порядок: гостиные/кухни → спальни → остальное */
 const ord=rooms.slice().sort((a,b)=>{ const p=q=>q.r.t==='l'?0:q.r.t==='b'?1:q.r.t==='w'?2:q.r.t==='t'?3:4; return p(a)-p(b)||b.m-a.m; });
 ord.forEach(q=>{ try{ if(q.r.t==='l') living(q); else if(q.r.t==='b') bedroom(q); else if(q.r.t==='h') hallRoom(q); else if(q.r.t==='w') wardrobe(q); else if(q.r.t==='t') bath(q); }catch(e){ if(window.console) console.warn('furn',q.r.n,e); } });
 return rooms.map(q=>q.svg).join('');
};
})();
