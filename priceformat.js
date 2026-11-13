/* цены: тысячи — точкой, десятичные — запятой ($527.400 · $67.500.000 · 2.300.000 ₸) */
(function(){
  var SP='[ \\u00a0\\u202f\\u2009]';
  var G='\\d{1,3}(?:'+SP+'\\d{3})+';
  var RE=[
    [new RegExp('(\\$\\s?)('+G+')','g'),null],
    [new RegExp('('+G+')(?=(?:,\\d+)?\\s?(?:₸|тг\\b|тенге|KZT|\\$|USD))','g'),null],
    [/(\$\s?)(\d{4,})(?![\d.,])/g,null],
    [/(\d{4,})(?=\s?(?:₸|тг\b|тенге|KZT))/g,null],
    [new RegExp('('+G+')(?='+'\\s?(?:до|–|—|-)\\s?'+G+'(?:,\\d+)?\\s?(?:₸|\\$|тг\\b|тенге))','g'),null]
  ];
  function dot(n){return n.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.');}
  function fix(s){
    if(!s||s.length<4||!/[\$₸]|тг|тенге|KZT|USD/.test(s)) return s;
    var o=s;
    s=s.replace(RE[4][0],function(m){return dot(m)});
    s=s.replace(RE[0][0],function(m,a,b){return a+dot(b)});
    s=s.replace(RE[1][0],function(m){return dot(m)});
    s=s.replace(RE[2][0],function(m,a,b){return a+dot(b)});
    s=s.replace(RE[3][0],function(m){return dot(m)});
    return s;
  }
  window.SHEV_priceFix=fix;
  function walk(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode&&n.parentNode.nodeName;return (p==='SCRIPT'||p==='STYLE'||p==='TEXTAREA')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
    var n,list=[];while(n=w.nextNode())list.push(n);
    list.forEach(function(t){var v=fix(t.nodeValue);if(v!==t.nodeValue)t.nodeValue=v;});
  }
  var t;function later(){clearTimeout(t);t=setTimeout(function(){walk(document.body)},120)}
  window.SHEV_priceWalk=function(){walk(document.body)};
  if(document.readyState!=='loading')later();else document.addEventListener('DOMContentLoaded',later);
  window.addEventListener('load',later);
  try{new MutationObserver(later).observe(document.body,{childList:true,subtree:true,characterData:true})}catch(e){}
})();
