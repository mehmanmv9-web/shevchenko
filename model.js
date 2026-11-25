/* Шевченко — единая модель данных (площади и планировки). Все площади — по экспликации альбома 31.10.2026. */
(function(root){
/* ЖК «Шевченко» — единая модель v4 (10.11.2026): 2 блока × 2 подъезда, 9 этажей (1 — коммерция с антресолью, 2–9 — квартиры),
   ядро по центру секции (2 лифта, холл, лестница Н2), 4 квартиры на этаже подъезда. Площади — по чертежам; квартира — сумма помещений
   между отделанными поверхностями стен и перегородок, без лоджий. 128 квартир = 15 000,0 м² (как в таблице команды). */
const TYPES = {
 '2':{rooms:2,name:'2-комнатная',side:'',loggia:0,total:80,range:[75,85],color:'#3D6FA8',r:[]},
 '3':{rooms:3,name:'3-комнатная',side:'',loggia:0,total:145,range:[130,160],color:'#2E8B7E',r:[]},
 '4':{rooms:4,name:'4-комнатная',side:'',loggia:0,total:205,range:[180,250],color:'#B8862F',r:[]},
 '5':{rooms:5,name:'5-комнатная',side:'',loggia:0,total:301,range:[280,330],color:'#8E64A8',r:[]},
 '6':{rooms:6,name:'6-комнатная · пентхаус',side:'',loggia:0,total:470,range:[450,470],color:'#A8433D',r:[]}
};
const TYPE_KEYS = Object.keys(TYPES);
const FLOORS = [2,3,4,5,6,7,8,9];
/* раскладка по подъездам и этажам (сценарий А: все 4 подъезда Luxury): состав этажа — типы по возрастанию номера */
const LAYOUTS = {A:{"1": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "2": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "3": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "44", "8": "35", "9": "35"}, "4": {"2": "234", "3": "234", "4": "234", "5": "333", "6": "244", "7": "44", "8": "35", "9": "6"}},B:{"1": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "2": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "244", "8": "44", "9": "35"}, "3": {"2": "234", "3": "234", "4": "234", "5": "234", "6": "333", "7": "44", "8": "35", "9": "35"}, "4": {"2": "44", "3": "44", "4": "44", "5": "44", "6": "5", "7": "5", "8": "5", "9": "6"}}};
let SCEN='A'; try{ const q=/[?&#]v=([AaBb])/.exec(location.search+location.hash); if(q){SCEN=q[1].toUpperCase(); localStorage.setItem('shevScen',SCEN);} else {SCEN=(localStorage.getItem('shevScen')==='B')?'B':'A';} }catch(e){}
const LAYOUT = LAYOUTS[SCEN];
const SECTIONS = [{n:1,name:'Подъезд 1 · блок 1, у ул. Жамбыла'},{n:2,name:'Подъезд 2 · блок 1'},{n:3,name:'Подъезд 3 · блок 2'},{n:4,name:(SCEN==='B'?'Private Residence · ':'')+'Подъезд 4 · блок 2, у ул. Шевченко'}];
const PER_FLOOR = 3, PARK_PER_APT = 2;
const COMM = {"К-1.1": {"L1": 183.59, "MZ": 233.42, "B1": 141.51}, "К-1.2": {"L1": 234.71, "MZ": 240.91, "B1": 141.51}, "К-2.1": {"L1": 199.79, "MZ": 233.42, "B1": 141.51}, "К-2.2": {"L1": 234.71, "MZ": 240.91, "B1": 141.51}, "К-3.1": {"L1": 199.79, "MZ": 233.42, "B1": 141.51}, "К-3.2": {"L1": 234.71, "MZ": 240.91, "B1": 131.97}, "К-4.1": {"L1": 183.59, "MZ": 233.42, "B1": 92.98}, "К-4.2": {"L1": 234.71, "MZ": 240.91, "B1": 92.98}};
const PARK = {levels:[98, 132], total:230, guest:7};
const GROUND = [['Коммерция 1 этажа · 8 помещений',1705.6],['Антресоль коммерции',1897.32],['Торговый цоколь −1',1025.48],['Итого коммерция',4628.40],['Лобби 4 подъездов',197.28]];
const r1 = x => Math.round(x*10)/10;
function inner(t){ return r1(TYPES[t].r.reduce((s,x)=>s+x[1],0)); }
function aptArea(t,sec){ return TYPES[t].total; }
function units(sc){
  const LAY=sc?LAYOUTS[sc]:LAYOUT; const u=[];
  for(const f of FLOORS){ let n=0; for(const s of SECTIONS){ const ks=LAY[s.n][f].split(''); ks.forEach((t,i)=>{
    n++; const a=aptArea(t,s.n);
    u.push({no:f+'-'+String(n).padStart(2,'0'),floor:f,section:s.n,pos:i,count:ks.length,type:t,rooms:TYPES[t].rooms,area:a,end:false});
  }); }}
  return u;
}
const AREA = r1(units().reduce((s,u)=>s+u.area,0)), NUNITS = units().length; // 85 квартир = 14 000,0 м² (рекомендация по квартирографии, Arbat Real Estate)
function scenarioStats(sc){ const us=units(sc), area=r1(us.reduce((t,x)=>t+x.area,0)), by={}; us.forEach(x=>by[x.type]=(by[x.type]||0)+1); return {n:us.length,area,by,avg:r1(area/us.length),maxFloorSec:Math.max(...Object.values(us.reduce((m,x)=>{const k=x.section+'-'+x.floor; m[k]=(m[k]||0)+x.area; return m;},{})))}; }

/* распределение машино-мест: 2 на квартиру (ближайшие к своему подъезду), 7 гостевых, остальные — сверх нормы */
function parkAssign(){
  const G=(typeof window!=='undefined'&&window.GEO3)||null; if(!G) return null;
  const us=units(), need={}; us.forEach(u=>need[u.section]=(need[u.section]||0)+PARK_PER_APT);
  const cat={}, taken=new Set(), res=G.stalls.filter(s=>s.cat!=='guest');
  G.stalls.filter(s=>s.cat==='guest').forEach(s=>cat[s.no]='guest');
  const SY={1:110.5,2:83.9,3:42.4,4:15.8}, secY=n=>SY[n]+13.3, short={};
  Object.keys(need).map(Number).sort((a,b)=>a-b).forEach(n=>{
    const cy=secY(n), cand=res.filter(s=>!taken.has(s.no)).map(s=>({s,c:Math.abs((s.r[2]+s.r[3])/2-cy)+30*(-s.lv-1)})).sort((a,b)=>a.c-b.c);
    let k=0; for(const c of cand){ if(k>=need[n]) break; taken.add(c.s.no); cat[c.s.no]='apt'; k++; } short[n]=need[n]-k; });
  res.forEach(s=>{ if(!taken.has(s.no)) cat[s.no]='extra'; });
  const nApt=us.length*PARK_PER_APT, nGuest=G.stalls.filter(s=>s.cat==='guest').length, total=G.stalls.length;
  return {cat,nApt,nGuest,total,extra:total-nApt-nGuest,flats:us.length,short:Object.values(short).reduce((a,b)=>a+b,0)};
}
function setScenario(sc){ try{localStorage.setItem('shevScen',sc);}catch(e){} try{sessionStorage.setItem('shevKeep',JSON.stringify({y:window.scrollY||0,h:document.documentElement.scrollHeight,t:Date.now()}));}catch(e){} const u=new URL(location.href); u.searchParams.set('v',sc); u.hash=''; location.href=u.pathname+u.search; }

const API={parkAssign,SCEN,LAYOUTS,scenarioStats,setScenario,LAYOUT,COMM,PARK,aptArea,PER_FLOOR,PARK_PER_APT,TYPES,TYPE_KEYS,FLOORS,SECTIONS,GROUND,AREA,units,inner};
if(typeof module!=='undefined') module.exports=API; else root.SHEV=API;
})(this);