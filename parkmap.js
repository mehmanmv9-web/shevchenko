/* Интерактивная схема паркинга: каждое машино-место пронумеровано и нажимается (3 уровня) */
(function(){
  const box = document.getElementById('pkmap'); if(!box || !window.GEO3) return;
  const D = window.GEO3, Y0 = D.Y0, Y1 = D.Y1, W = D.WUX;
  const PA = window.SHEV && window.SHEV.parkAssign && window.SHEV.parkAssign();
  const CAT = {res:'жителям', apt:'закреплено за квартирой (2 на квартиру)', extra:'сверх нормы — свободное, доступно к продаже', guest:'гостевое / МГН'};
  const COLOR = {res:'#ffffff', apt:'#ffffff', extra:'#F2DDA8', guest:'#DDEFE9'};
  const kind = s => PA ? PA.cat[s.no] || s.cat : s.cat;
  const ABS = {'-1':'813,55','-2':'810,25','-3':'806,35'};
  const nf = (v,d) => Number(v).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});
  let lv = -1, sel = null;
  const X = y => Y1 - y;                       // север слева, ул. Амангельды сверху
  function outline(){
    if (lv === -3) { const [wa,wb] = D.WIN3; return `<rect x="${X(wb)}" y="0" width="${wb-wa}" height="${D.WU}" fill="#e2ddd3" stroke="#2a2f2d" stroke-width="0.4"/>`; }
    let h = `<rect x="0" y="0" width="${Y1-Y0}" height="${D.WU}" fill="#e2ddd3" stroke="#2a2f2d" stroke-width="0.4"/>`;
    for (const [a,b] of D.EXT) h += `<rect x="${X(b)}" y="${D.WU-0.4}" width="${b-a}" height="${D.WUX-D.WU+0.4}" fill="#e2ddd3" stroke="#2a2f2d" stroke-width="0.4"/>`;
    return h;
  }
  function draw(){
    const ns = 'http://www.w3.org/2000/svg';
    const w3 = lv === -3, vx = w3 ? X(D.WIN3[1]) - 1 : -1, vw = w3 ? D.WIN3[1] - D.WIN3[0] + 2 : Y1 - Y0 + 2, vh = w3 ? D.WU + 6 : W + 6, cx0 = w3 ? X(D.WIN3[1]) : 0, cx1 = w3 ? X(D.WIN3[0]) : Y1 - Y0, bot = w3 ? D.WU + 2.6 : W + 2.6;
    let h = `<svg xmlns="${ns}" viewBox="${vx} -3 ${vw} ${vh}">` + outline();
    const B = D.bands;
    if (lv === -3) { const [wa,wb] = D.WIN3; h += `<rect x="${X(wb)}" y="${B.A1[0]}" width="${wb-wa}" height="${B.A1[1]-B.A1[0]}" fill="#d6d2c9"/>`; }
    else h += `<rect x="0" y="${B.A1[0]}" width="${Y1-Y0}" height="${B.A1[1]-B.A1[0]}" fill="#d6d2c9"/>`;
    if (lv !== -3) for (const [a,b] of D.EXT) h += `<rect x="${X(b)+0.4}" y="${B.A2[0]}" width="${b-a-0.8}" height="${B.A2[1]-B.A2[0]}" fill="#d6d2c9"/>`;
    h += `<text x="${(cx0+cx1)/2}" y="-1.2" text-anchor="middle" style="font-size:1.8px;fill:#6b6355">ул. Амангельды</text>`;
    h += `<text x="${cx0+0.5}" y="${bot}" style="font-size:1.5px;fill:#6b6355">← север · ул. Жамбыла</text><text x="${cx1-0.5}" y="${bot}" text-anchor="end" style="font-size:1.5px;fill:#6b6355">ул. Шевченко · юг →</text>`;
    const RR = (r, fill, t, fs=1.2) => { const [x0,x1,y0,y1] = r; h += `<rect x="${X(y1)}" y="${x0}" width="${y1-y0}" height="${x1-x0}" fill="${fill}" stroke="#555" stroke-width="0.1"/>` + (t ? `<text x="${X((y0+y1)/2)}" y="${(x0+x1)/2+0.45}" text-anchor="middle" style="font-size:${fs}px;fill:#222">${t}</text>` : ''); };
    RR([0.4, 24.7, D.gap[0], D.gap[1]], '#bdb8ae', lv === -1 ? 'рампы · въезд с ул. Амангельды' : 'рампы', 1.2);
    D.lifts.filter(l => lv !== -3 || (l[2] >= D.WIN3[0] && l[3] <= D.WIN3[1])).forEach(l => { RR([l[0], l[1], l[2], l[3]], '#3b3f3c', ''); h += `<text x="${X((l[2]+l[3])/2)}" y="${(l[0]+l[1])/2+0.5}" text-anchor="middle" style="font-size:1.2px;fill:#fff">лифты ${l[4]}</text>`; });
    D.evac.filter(r => lv !== -3 || (r[2] >= D.WIN3[0] && r[3] <= D.WIN3[1])).forEach(r => RR(r, '#cfe3cf', 'ЭЛ'));
    if (lv === -1) for (const [k, rs] of Object.entries(D.retail)) { rs.forEach(r => RR(r, '#E8D9BC', '')); const r = rs.reduce((a,b) => (b[1]-b[0])*(b[3]-b[2]) > (a[1]-a[0])*(a[3]-a[2]) ? b : a); h += `<text x="${X((r[2]+r[3])/2)}" y="${(r[0]+r[1])/2+0.4}" text-anchor="middle" style="font-size:1.1px;fill:#7a5a2a">${k} · ${nf(D.retailA[k],1)} м²</text>`; }
    if (lv === -2) D.tech.forEach(t => RR(t.slice(1), '#cfd8e4', t[0].split(' ')[0], 0.9));
    for (const c of D.cells.filter(c => c.lv === lv)) { const [x0,x1,y0,y1] = c.r; h += `<rect x="${X(y1)}" y="${x0}" width="${y1-y0}" height="${x1-x0}" fill="#E8D9BC" stroke="#a88a5a" stroke-width="0.1"/><text x="${X((y0+y1)/2)}" y="${(x0+x1)/2+0.4}" text-anchor="middle" style="font-size:0.9px;fill:#7a5a2a">К${c.no}</text>`; }
    for (const s of D.stalls.filter(s => s.lv === lv)) { const [x0,x1,y0,y1] = s.r;
      h += `<g class="st${sel===s.no?' on':''}" data-n="${s.no}"><rect x="${X(y1)+0.05}" y="${x0+0.05}" width="${y1-y0-0.1}" height="${x1-x0-0.1}" fill="${COLOR[kind(s)]}" stroke="#77736a" stroke-width="0.12"/><text x="${X((y0+y1)/2)}" y="${(x0+x1)/2+0.55}" text-anchor="middle">${s.no}</text></g>`; }
    box.innerHTML = h + '</svg>';
  }
  const intro = () => { const n = D.stalls.filter(s => s.lv === lv).length; return `Уровень ${lv}: ${n} мест${lv === -1 ? ', въезд с ул. Амангельды, торговый цоколь' : lv === -3 ? ', отм. −11,4 м, площадь уровня 2 960 м² (по справке)' : ''}. Нажмите на место — номер, размер и назначение. Белые — жителям, зелёные — гостевые и МГН.`; };
  function show(n){
    const s = D.stalls.find(x => x.no === n); if(!s) return; sel = n; if(s.lv !== lv){ lv = s.lv; setBtns(); } draw();
    document.getElementById('pkinfo').innerHTML = `<b>Машино-место № ${s.no}</b> · уровень ${s.lv} (абс. ${ABS[s.lv]}) · ${nf(s.w,2)} × ${nf(s.l,2)} м (норма РК ≥ 2,50 × 5,30 м) · ${CAT[kind(s)]} · ${kind(s)==='guest'?'не продаётся':kind(s)==='apt'?'в составе квартиры':'$30 000'} ${s.lv === -3 ? '' : '· <a href="#s3d" id="pk3d">показать в 3D</a>'}`;
    const a = document.getElementById('pk3d'); if(a) a.onclick = () => setTimeout(() => window.SHEV3D && window.SHEV3D.stall(n), 600);
  }
  function setBtns(){ document.querySelectorAll('#pklv button').forEach(b => b.classList.toggle('on', +b.dataset.l === lv)); }
  box.addEventListener('click', e => { const g = e.target.closest('.st'); if(g) show(+g.dataset.n); });
  document.getElementById('pklv').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; lv = +b.dataset.l; sel = null; setBtns(); draw(); document.getElementById('pkinfo').textContent = intro(); });
  draw(); document.getElementById('pkinfo').textContent = intro();
  (function(){ const el=document.getElementById('pkstat'); if(!el||!PA) return; const ok=PA.short===0;
    el.innerHTML=`<div class="pks"><div><b>${PA.flats}</b><span>квартир × 2 = ${PA.nApt} мест закреплено</span></div><div><b>${PA.nGuest}</b><span>гостевых и МГН</span></div><div><b>${PA.total}</b><span>всего мест на 3 уровнях</span></div><div class="${PA.extra>0?'x':''}"><b>${ok?(PA.extra>0?'+'+PA.extra:'0'):'−'+PA.short}</b><span>${ok?(PA.extra>0?'сверх нормы (золотые места на схеме)':'ровно по норме: места в обрез'):'не хватает мест'}</span></div></div>`; })();
})();
