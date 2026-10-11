(function(){
'use strict';
const $=id=>document.getElementById(id),I=$('idea'),IMG=$('img'),ST=$('stage'),RES=$('results'),BAR=$('bar'),SCAN=$('scanText'),RUN=$('run');
if(!I||!IMG||!ST||!RES||!BAR||!SCAN||!RUN)return;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const json=(k,d)=>{try{return JSON.parse(get(k)||JSON.stringify(d))}catch(e){return d}};
const clean=x=>String(x||'').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
const norm=x=>clean(x).toLocaleLowerCase('tr-TR').replace(/[.!?,:;]+$/,'');
const words=t=>norm(t).replace(/[^a-z0-9çğıöşü$₺€ ]/g,' ').split(/\s+/).filter(x=>x.length>2);
function sim(a,b){const A=new Set(words(a)),B=new Set(words(b));let i=0;for(const w of A)if(B.has(w))i++;return Math.max(A.size,B.size)?i/Math.max(A.size,B.size):0}
function protectNum(t){return String(t).replace(/(\d)\.(?=\d)/g,'$1§DOT§').replace(/(\d),(?=\d)/g,'$1§COMMA§')}
function restoreNum(t){return String(t).replace(/§DOT§/g,'.').replace(/§COMMA§/g,',')}
function clauses(t){return protectNum(t).split(/[.!?\n]+/).map(x=>restoreNum(clean(x))).filter(Boolean)}
const MONEY_RE=/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi;
const NUMWORD='(?:bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|on bir|on iki|on üç|on dört|on beş|yirmi|otuz)';
const DURATION_RE=new RegExp('\\b(?:\\d+|'+NUMWORD+')\\s*(?:dakika(?:da|dır|lık)?|dk|saat(?:te|tir|lik)?|gün(?:de|dür|lük)?|hafta(?:da|dır|lık)?|ay(?:da|dır|lık)?|yıl(?:da|dır|lık)?|gece(?:de)?)\\b','gi');
const COUNT_RE=new RegExp('\\b(?:\\d+|'+NUMWORD+')\\s*(?:kişi(?:ye|den)?|arkadaş(?:a|la|tan|ımız|ımıza)?|üye(?:ye|den)?|katılımcı(?:ya|dan)?)\\b','gi');
I.value=get('vanta_idea')||'';IMG.checked=get('vanta_img')==='1';I.oninput=()=>set('vanta_idea',I.value);IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');
function detect(t){
 const l=norm(t),money=t.match(MONEY_RE)||[],dur=t.match(DURATION_RE)||[],counts=t.match(COUNT_RE)||[],c=clauses(t);
 const signals={group:/grup|ekip|beraber|birlikte/.test(l),live:/canlı|yayın/.test(l),loss:/zarar|eksi|yanlış|geri verd|kaybet/.test(l),pressure:/risk|karar|bekle|kork|uyuma|uyku|gece|sabah|pozisyon|tereddüt/.test(l),human:/uykusuz|uyuyamad|stres|yorul|sabaha kadar|saatlerce/.test(l),invisible:/kimsenin görmediği|görünmeyen|yüzlerce saat|uyumadan|arkasında|arasında/.test(l),identity:/bir lira param|param olmadığı|nereden nereye|nerelere geldim|hayat|şans|umut|savaş/.test(l)};
 const giveaway=/hediye|çekiliş|kazanan|vereceğim|veriyorum|göndereceğim|dağıt/.test(l);
 const journey=/başlad|başlangıç|bakiye|işlem|kâr|kar|pnl|kazand|ulaşt|elimde|vardı|serüven/.test(l)&&money.length>=2;
 let intent=giveaway?'giveaway':journey?'journey':'general';
 let mode='natural';if(intent==='journey'){if(signals.identity)mode='identity';else if(signals.human)mode='human_cost';else if(signals.invisible)mode='invisible_work';else if(signals.loss)mode='contrast';else if(money.length>=3)mode='progressive';else if(signals.pressure)mode='pressure';else mode=c.length<=2?'sparse':'scale'}
 return{raw:t,l,money,dur,counts,c,signals,intent,mode};
}
function containsAll(text,arr){const n=norm(text);return arr.every(x=>n.includes(norm(x)))}
function completeness(text,d){if(!containsAll(text,d.money)||!containsAll(text,d.dur)||!containsAll(text,d.counts))return false;const l=norm(text);if(d.signals.group&&!/grup|ekip|beraber|birlikte/.test(l))return false;if(d.signals.live&&!/canlı|yayın/.test(l))return false;return true}
function semanticLock(text,d){if(!completeness(text,d))return false;const om=text.match(MONEY_RE)||[];for(const x of om)if(!d.money.some(y=>norm(y)===norm(x)))return false;const od=text.match(DURATION_RE)||[];for(const x of od)if(!d.dur.some(y=>norm(y)===norm(x)))return false;const oc=text.match(COUNT_RE)||[];for(const x of oc)if(!d.counts.some(y=>norm(y)===norm(x)))return false;return true}
function dedupe(text){const out=[];for(const raw of String(text).split(/\n+/)){const x=clean(raw);if(!x)continue;if(out.some(y=>norm(y)===norm(x)||sim(y,x)>.92))continue;out.push(x)}return out.join('\n\n')}
function sourceBuild(d){return{text:dedupe(d.c.join('\n\n')),arch:'source_complete',intent:d.intent}}
function reorderBuild(d,i){const c=d.c.slice();if(c.length<=1)return sourceBuild(d);let arr=c.slice();if(d.intent==='journey'){
  const psy=c.filter(x=>{const l=norm(x);if(d.mode==='human_cost')return /uyku|stres|gece|sabah|yorul|saat/.test(l);if(d.mode==='invisible_work')return /görünm|saat|uyumadan|arasında/.test(l);if(d.mode==='contrast')return /zarar|eksi|yanlış|geri verd|kaybet/.test(l);if(d.mode==='pressure')return /risk|karar|bekle|kork|pozisyon|tereddüt/.test(l);if(d.mode==='identity')return /param|hayat|şans|umut|nereden|geldim|savaş/.test(l);return false});
  const rest=c.filter(x=>!psy.includes(x));
  if(psy.length&&i%2===1)arr=[rest[0],...psy,...rest.slice(1)].filter(Boolean);
  else if(i%3===2)arr=[c[0],...c.slice(1).reverse()];
 }
 return{text:dedupe(arr.join('\n\n')),arch:d.mode+'_'+(i%3),intent:d.intent};
}
function compactBuild(d){const c=d.c.slice();return{text:dedupe(c.join('\n')),arch:'compact_complete',intent:d.intent}}
function build(d,i){if(i%4===0)return sourceBuild(d);if(i%4===1)return reorderBuild(d,i);if(i%4===2)return compactBuild(d);return reorderBuild(d,i+1)}
function repPenalty(t){const ls=t.split(/\n+/).map(clean).filter(Boolean);let p=0;for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++)if(norm(ls[i])===norm(ls[j])||sim(ls[i],ls[j])>.88)p+=30;return clamp(p,0,90)}
function hook(t){const f=(t.split(/\n/).find(Boolean)||'').trim();let s=58;if(f.length<=75)s+=12;if(/\d|\$|₺|€|usdt/i.test(f))s+=10;if(f.length<=48)s+=6;if(f.length>115)s-=18;return clamp(s,20,98)}
function rhythm(t){const ls=t.split(/\n+/).map(clean).filter(Boolean);let s=60;if(ls.length>=2&&ls.length<=7)s+=14;if(ls.some(x=>x.length<=30))s+=8;if(ls.some(x=>x.length>=65)&&ls.some(x=>x.length<=30))s+=7;return clamp(s,20,98)}
function psych(t,d){let s=68,l=norm(t);if(d.signals.group&&/grup|ekip|beraber|birlikte/.test(l))s+=6;if(d.signals.human&&/uyku|stres|gece|sabah|yorul|saat/.test(l))s+=12;if(d.signals.invisible&&/görünm|saat|uyumadan|arasında/.test(l))s+=12;if(d.signals.loss&&/zarar|eksi|yanlış|geri verd|kaybet/.test(l))s+=12;if(d.signals.pressure&&/risk|karar|bekle|kork|pozisyon|tereddüt/.test(l))s+=10;if(d.signals.identity&&/param|hayat|şans|umut|nereden|geldim|savaş/.test(l))s+=10;return clamp(s,20,98)}
function voice(t,d){const rw=new Set(words(d.raw)),tw=words(t);let c=0;for(const w of tw)if(rw.has(w))c++;return clamp(60+(tw.length?Math.round(c/tw.length*38):0),20,98)}
function novelty(t){const h=json('vanta_hist',[]);let worst=0;for(const o of h)worst=Math.max(worst,sim(t,o.text||''));return clamp(Math.round(98-worst*58),20,98)}
function score(v,d){const fact=semanticLock(v.text,d)?98:0,h=hook(v.text),r=rhythm(v.text),p=psych(v.text,d),vo=voice(v.text,d),n=novelty(v.text),rep=repPenalty(v.text);let total=Math.round(fact*.31+h*.16+r*.14+p*.14+vo*.15+n*.10-rep*.45);if(!fact)total=0;if(rep)total=Math.min(total,55);return{fact,hook:h,rhythm:r,psy:p,voice:vo,nov:n,rep,total:clamp(total,0,96)}}
function finalists(d){const all=[];for(let i=0;i<24;i++)all.push(build(d,i));for(const v of all)v.s=score(v,d);all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){if(v.s.fact<98||v.s.rep>0)continue;if(out.some(x=>sim(v.text,x.text)>.90))continue;out.push(v);if(out.length===3)break}if(!out.length){const r=sourceBuild(d);r.s=score(r,d);out.push(r)}return out}
function copy(t){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).then(()=>alert('Kopyalandı.')).catch(()=>{});}
function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,120)))}
const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.hook+'</b><span>İlk satır</span></div><div class="metric"><b>'+v.s.rhythm+'</b><span>Ritim</span></div><div class="metric"><b>'+v.s.psy+'</b><span>Psikoloji</span></div><div class="metric"><b>'+v.s.voice+'</b><span>Senin sesin</span></div><div class="metric"><b>'+v.s.fact+'</b><span>Fact completeness</span></div><div class="metric"><b>'+v.s.nov+'</b><span>Tekrar riski</span></div></div>';
RUN.onclick=function(){const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}ST.style.display='block';RES.innerHTML='';BAR.style.width='12%';SCAN.textContent='v2.1 bütün gerçekleri kilitliyor…';setTimeout(()=>{BAR.style.width='42%';SCAN.textContent='Türkçe süreler + rakamlar ayrıştırılıyor…'},150);setTimeout(()=>{BAR.style.width='72%';SCAN.textContent='Fact completeness: hiçbir bilgi düşürülemiyor…'},300);setTimeout(()=>{const d=detect(t),arr=finalists(d);BAR.style.width='100%';SCAN.textContent='v2.1 · tam bilgi koruması + tekrar kilidi · '+arr.length+' finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">EN GÜÇLÜ ADAY · '+w.arch+' · '+d.mode+'</div></div><div class="score">'+w.s.total+'<small>/96</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+v.arch+' · '+v.s.total+'/96</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'})},520)};
})();