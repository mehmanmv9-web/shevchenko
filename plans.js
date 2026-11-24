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
const COL={h:'#F6F1E6',l:'#FBF7EE',b:'#F1E8D6',w:'#E9DFC9',t:'#E3EBE8'};
function squarify(items,x,y,w,h){ // items: {a,...} sorted desc, areas normalised to w*h
  const out=[]; let rest=items.slice();
  while(rest.length){
    const short=Math.min(w,h), row=[]; let sum=0, best=Infinity;
    const worst=(r,s)=>{const t=r.reduce((p,q)=>p+q.a,0), mx=Math.max(...r.map(q=>q.a)), mn=Math.min(...r.map(q=>q.a)); return Math.max(short*short*mx/(t*t), t*t/(short*short*mn));};
    while(rest.length){ const nr=row.concat(rest[0]); const wv=worst(nr); if(row.length&&wv>best) break; row.push(rest.shift()); best=wv; }
    sum=row.reduce((p,q)=>p+q.a,0);
    if(w>=h){ const cw=sum/h; let cy=y; row.forEach(q=>{const ch=q.a/cw; out.push({...q,x,y:cy,w:cw,h:ch}); cy+=ch;}); x+=cw; w-=cw; }
    else { const ch=sum/w; let cx=x; row.forEach(q=>{const cw=q.a/ch; out.push({...q,x:cx,y,w:cw,h:ch}); cx+=cw;}); y+=ch; h-=ch; }
  }
  return out;
}
function lay(k,W,H){
  const rooms=R[k].map(r=>({n:r[0],m:r[1],t:r[2]})), tot=rooms.reduce((p,q)=>p+q.m,0);
  const pub=rooms.filter(r=>r.t==='h'||r.t==='l'), prv=rooms.filter(r=>r.t!=='h'&&r.t!=='l');
  const sp=pub.reduce((p,q)=>p+q.m,0), pw=W*sp/tot, k2=(W*H)/tot;
  const f=(g,x,w)=>squarify(g.map(r=>({...r,a:r.m*k2})).sort((a,b)=>b.a-a.a),x,0,w,H);
  return f(pub,0,pw).concat(f(prv,pw,W-pw));
}
function wrap(t,max){ const w=t.split(' '); const L=[]; let c=''; w.forEach(x=>{ if((c+' '+x).trim().length>max&&c){L.push(c);c=x;} else c=(c+' '+x).trim(); }); if(c)L.push(c); return L; }
window.SHEV_planSVG=function(k,opt){
  opt=opt||{}; const tot=M.TYPES[k].total, asp=1.28, Hm=Math.sqrt(tot/asp), Wm=Hm*asp, S=900/Wm, W=900, H=Hm*S;
  const rs=lay(k,W,H), pad=26, fs=Math.max(10,Math.min(17,W/62));
  let g='';
  rs.forEach(r=>{
    const aT=(r.m.toFixed(1)).replace('.',',')+' м²', cx=r.x+r.w/2, cy=r.y+r.h/2;
    g+=`<rect x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" fill="${COL[r.t]}" stroke="#2B2A26" stroke-width="2"/>`;
    let f1=fs, lines=wrap(r.n,Math.max(5,Math.floor(r.w/(f1*0.52))));
    const need=()=>Math.max(...lines.map(l=>l.length))*f1*0.5<=r.w-8 && (lines.length+1.5)*f1*1.1<=r.h-6;
    while(!need()&&f1>9){ f1-=0.7; lines=wrap(r.n,Math.max(5,Math.floor(r.w/(f1*0.52)))); }
    if(need()){ const y0=cy-((lines.length+1)*f1*1.1)/2; g+=`<text text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="${f1.toFixed(1)}" fill="#2B2A26">`+lines.map((l,i)=>`<tspan x="${cx.toFixed(1)}" y="${(y0+(i+0.8)*f1*1.1).toFixed(1)}">${l}</tspan>`).join('')+`<tspan x="${cx.toFixed(1)}" y="${(y0+(lines.length+0.8)*f1*1.1+2).toFixed(1)}" font-family="Inter,Arial,sans-serif" font-size="${(f1*0.82).toFixed(1)}" fill="#8A6B2E" font-weight="600">${aT}</tspan></text>`; }
    else { const fz=Math.max(8,Math.min(11,r.w/5.5)); g+=`<text x="${cx.toFixed(1)}" y="${(cy+fz*0.35).toFixed(1)}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="${fz.toFixed(1)}" fill="#8A6B2E" font-weight="600">${r.m.toFixed(1).replace('.',',')}</text>`; }
  });
  return `<svg viewBox="${-pad} ${-pad} ${W+2*pad} ${H+2*pad}" style="width:100%;height:auto;display:block;background:#FFFDF8;border-radius:12px" role="img" aria-label="Планировка ${M.TYPES[k].rooms}-комнатной квартиры"><rect x="${-pad+6}" y="${-pad+6}" width="${W+2*pad-12}" height="${H+2*pad-12}" fill="none" stroke="#C9A66B" stroke-width="1.2"/>${g}<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#1E1D1A" stroke-width="6"/></svg>`;
};
window.SHEV_roomsTable=function(k){ const r=R[k], t=r.reduce((p,q)=>p+q[1],0); return '<table class="rooms num">'+r.map(x=>`<tr><td>${x[0]}</td><td>${x[1].toFixed(1).replace('.',',')} м²</td></tr>`).join('')+`<tr class="sum"><td>Общая площадь квартиры</td><td>${t.toFixed(1).replace('.',',')} м²</td></tr></table>`; };
window.SHEV_PLAN_NOTE='Концептуальная планировка: состав и площади помещений расчётные, подлежат уточнению рабочим проектом.';
})();
