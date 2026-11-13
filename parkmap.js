/* Интерактивная схема паркинга: каждое машино-место пронумеровано и нажимается (2 уровня) */
(function(){
  const box = document.getElementById('pkmap'); if(!box || !window.GEO3) return;
  const D = window.GEO3, Y0 = D.Y0, Y1 = D.Y1, W = D.WUX;
  const CAT = {res:'жителям', guest:'гостевое / МГН'};
  const COLOR = {res:'#ffffff', guest:'#DDEFE9'};
  const ABS = {'-1':'813,55','-2':'810,25'};
  const nf = (v,d) => Number(v).toLocaleString('ru-RU',{minimumFractionDigits:d,maximumFractionDigits:d});
  let lv = -1, sel = null;
  const X = y => Y1 - y;                       // север слева, ул. Амангельды сверху
  function outline(){
    const pts = [[0,Y0],[0,Y1],[D.WU,Y1]];
    let h = `<rect x="0" y="0" width="${Y1-Y0}" height="${D.WU}" fill="#e2ddd3" stroke="#2a2f2d" stroke-width="0.4"/>`;
    for (const [a,b] of D.EXT) h += `<rect x="${X(b)}" y="${D.WU-0.4}" width="${b-a}" height="${D.WUX-D.WU+0.4}" fill="#e2ddd3" stroke="#2a2f2d" stroke-width="0.4"/>`;
    return h;
  }
  function draw(){
    const ns = 'http://www.w3.org/2000/svg';
    let h = `<svg xmlns="${ns}" viewBox="-1 -3 ${Y1-Y0+2} ${W+6}">` + outline();
    const B = D.bands;
    h += `<rect x="0" y="${B.A1[0]}" width="${Y1-Y0}" height="${B.A1[1]-B.A1[0]}" fill="#d6d2c9"/>`;
    for (const [a,b] of D.EXT) h += `<rect x="${X(b)+0.4}" y="${B.A2[0]}" width="${b-a-0.8}" height="${B.A2[1]-B.A2[0]}" fill="#d6d2c9"/>`;
    h += `<text x="${(Y1-Y0)/2}" y="-1.2" text-anchor="middle" style="font-size:1.8px;fill:#6b6355">ул. Амангельды</text>`;
    h += `<text x="0.5" y="${W+2.6}" style="font-size:1.5px;fill:#6b6355">← север · ул. Жамбыла</text><text x="${Y1-Y0-0.5}" y="${W+2.6}" text-anchor="end" style="font-size:1.5px;fill:#6b6355">ул. Шевченко · юг →</text>`;
    const RR = (r, fill, t, fs=1.2) => { const [x0,x1,y0,y1] = r; h += `<rect x="${X(y1)}" y="${x0}" width="${y1-y0}" height="${x1-x0}" fill="${fill}" stroke="#555" stroke-width="0.1"/>` + (t ? `<text x="${X((y0+y1)/2)}" y="${(x0+x1)/2+0.45}" text-anchor="middle" style="font-size:${fs}px;fill:#222">${t}</text>` : ''); };
    RR([0.4, 24.7, D.gap[0], D.gap[1]], '#bdb8ae', lv === -1 ? 'рампы · въезд с ул. Амангельды' : 'рампы', 1.2);
    D.lifts.forEach(l => { RR([l[0], l[1], l[2], l[3]], '#3b3f3c', ''); h += `<text x="${X((l[2]+l[3])/2)}" y="${(l[0]+l[1])/2+0.5}" text-anchor="middle" style="font-size:1.2px;fill:#fff">лифты ${l[4]}</text>`; });
    D.evac.forEach(r => RR(r, '#cfe3cf', 'ЭЛ'));
    if (lv === -1) for (const [k, rs] of Object.entries(D.retail)) { rs.forEach(r => RR(r, '#E8D9BC', '')); const r = rs.reduce((a,b) => (b[1]-b[0])*(b[3]-b[2]) > (a[1]-a[0])*(a[3]-a[2]) ? b : a); h += `<text x="${X((r[2]+r[3])/2)}" y="${(r[0]+r[1])/2+0.4}" text-anchor="middle" style="font-size:1.1px;fill:#7a5a2a">${k} · ${nf(D.retailA[k],1)} м²</text>`; }
    if (lv === -2) D.tech.forEach(t => RR(t.slice(1), '#cfd8e4', t[0].split(' ')[0], 0.9));
    for (const c of D.cells.filter(c => c.lv === lv)) { const [x0,x1,y0,y1] = c.r; h += `<rect x="${X(y1)}" y="${x0}" width="${y1-y0}" height="${x1-x0}" fill="#E8D9BC" stroke="#a88a5a" stroke-width="0.1"/><text x="${X((y0+y1)/2)}" y="${(x0+x1)/2+0.4}" text-anchor="middle" style="font-size:0.9px;fill:#7a5a2a">К${c.no}</text>`; }
    for (const s of D.stalls.filter(s => s.lv === lv)) { const [x0,x1,y0,y1] = s.r;
      h += `<g class="st${sel===s.no?' on':''}" data-n="${s.no}"><rect x="${X(y1)+0.05}" y="${x0+0.05}" width="${y1-y0-0.1}" height="${x1-x0-0.1}" fill="${COLOR[s.cat]}" stroke="#77736a" stroke-width="0.12"/><text x="${X((y0+y1)/2)}" y="${(x0+x1)/2+0.55}" text-anchor="middle">${s.no}</text></g>`; }
    box.innerHTML = h + '</svg>';
  }
  const intro = () => { const n = D.stalls.filter(s => s.lv === lv).length; return `Уровень ${lv}: ${n} мест${lv === -1 ? ', въезд с ул. Амангельды, торговый цоколь' : ''}. Нажмите на место — номер, размер и назначение. Белые — жителям, зелёные — гостевые и МГН.`; };
  function show(n){
    const s = D.stalls.find(x => x.no === n); if(!s) return; sel = n; if(s.lv !== lv){ lv = s.lv; setBtns(); } draw();
    document.getElementById('pkinfo').innerHTML = `<b>Машино-место № ${s.no}</b> · уровень ${s.lv} (абс. ${ABS[s.lv]}) · ${nf(s.w,2)} × ${nf(s.l,2)} м (норма РК ≥ 2,50 × 5,30 м) · ${CAT[s.cat]} · ${s.cat==='guest'?'не продаётся':'$30 000'} · <a href="#s3d" id="pk3d">показать в 3D</a>`;
    const a = document.getElementById('pk3d'); if(a) a.onclick = () => setTimeout(() => window.SHEV3D && window.SHEV3D.stall(n), 600);
  }
  function setBtns(){ document.querySelectorAll('#pklv button').forEach(b => b.classList.toggle('on', +b.dataset.l === lv)); }
  box.addEventListener('click', e => { const g = e.target.closest('.st'); if(g) show(+g.dataset.n); });
  document.getElementById('pklv').addEventListener('click', e => { const b = e.target.closest('button'); if(!b) return; lv = +b.dataset.l; sel = null; setBtns(); draw(); document.getElementById('pkinfo').textContent = intro(); });
  draw(); document.getElementById('pkinfo').textContent = intro();
})();
