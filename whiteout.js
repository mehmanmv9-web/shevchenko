/* белые плашки и белые фоны схем → цвет страницы */
(function(){
  var PG='#F6F1E7';
  var PLAN=/(^|\/)(plan-|type-[A-D]|var-|ep-|tex3-|tex-|sec|street|gen|topo|mgn|arbat-logo)/;
  function dark(e){return e.closest('#invest,#s3d,#walk,.dark,.hero,#hero,.modal,.lbx,.lightbox,#lb,[data-keepwhite]')}
  function run(){
    document.querySelectorAll('body *').forEach(function(e){
      if(e.tagName==='IMG'||e.tagName==='SVG'||e.tagName==='CANVAS'||dark(e))return;
      var cs=getComputedStyle(e),m=cs.backgroundColor.match(/[\d.]+/g);if(!m||m.length<3)return;
      var r=+m[0],g=+m[1],b=+m[2],a=m.length>3?+m[3]:1;
      if(a>0.5&&r>=246&&g>=244&&b>=236&&!(r===246&&g===241&&b===231)){var w=e.offsetWidth,h=e.offsetHeight;if(w*h>3500&&cs.position!=='fixed'){e.style.backgroundColor=PG;e.style.boxShadow='none'}}
    });
    document.querySelectorAll('img').forEach(function(i){
      if(dark(i))return;var n=(i.getAttribute('src')||'').split('/').slice(-2).join('/');
      if(PLAN.test(n)||PLAN.test(n.split('/').pop())){i.style.mixBlendMode='multiply'}
    });
  }
  window.SHEV_whiteout=run;
  var t;function later(){clearTimeout(t);t=setTimeout(run,250)}
  if(document.readyState!=='loading')later();else document.addEventListener('DOMContentLoaded',later);
  window.addEventListener('load',later);
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}catch(e){}
})();
