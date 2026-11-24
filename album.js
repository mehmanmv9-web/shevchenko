/* Фотоальбом: глянцевая мозаика с фильтром, увеличение — общий lightbox (data-zoom) */
(function(){
  const box=document.getElementById('albgrid'); if(!box) return;
  const A=[
   ['ph08','Фасад по ул. Амангельды','h'],['fac-long','Главный фасад','h'],['fac-long-night','Дом вечером','h'],
   ['mont-zhambyl','Вид со стороны ул. Жамбыла','h'],['ph05','Арка главного входа','e'],
   ['ph01','Холл этажа','e'],['ph04','Гостиная и коридор квартиры','i'],['ph16','Гостиная-столовая','i'],
   ['ph15','Спальня с видом на двор','i'],['ph18','Мастер-спальня и ванная','i'],['ph06','Квартира · гостиная, спальня, кухня, санузел','i'],
   ['ph07','Квартира · вечерний свет','i'],['ph10','Квартира · утренний свет','i'],['ph17','Квартира · пять комнат','i'],
   ['ph03','Вход и въезд в паркинг','e']
  ];
  const C=[['all','Все'],['h','Дом и двор'],['e','Входы и холл'],['i','Интерьеры']];
  document.getElementById('albtabs').innerHTML=C.map((c,i)=>`<button class="chip${i?'':' on'}" data-c="${c[0]}">${c[1]}</button>`).join('');
  box.innerHTML=A.map(a=>`<figure class="alb" data-c="${a[2]}"><img src="img/${a[0]}.jpg" alt="${a[1]}" loading="lazy" data-zoom><figcaption>${a[1]}</figcaption></figure>`).join('');
  document.getElementById('albtabs').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;
    document.querySelectorAll('#albtabs .chip').forEach(x=>x.classList.toggle('on',x===b));
    box.querySelectorAll('.alb').forEach(f=>f.style.display=(b.dataset.c==='all'||f.dataset.c===b.dataset.c)?'':'none');};
})();