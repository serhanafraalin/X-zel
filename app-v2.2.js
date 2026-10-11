(function(){
'use strict';
const $=id=>document.getElementById(id),I=$('idea'),IMG=$('img'),ST=$('stage'),RES=$('results'),BAR=$('bar'),SCAN=$('scanText'),RUN=$('run');
if(!I||!IMG||!ST||!RES||!BAR||!SCAN||!RUN)return;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const clean=x=>String(x||'').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
const norm=x=>clean(x).toLocaleLowerCase('tr-TR').replace(/[.!?,:;]+$/,'');
const esc=x=>String(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const json=(k,d)=>{try{return JSON.parse(get(k)||JSON.stringify(d))}catch(e){return d}};
const words=t=>norm(t).replace(/[^a-z0-9çğıöşü$₺€ ]/g,' ').split(/\s+/).filter(x=>x.length>2);
function sim(a,b){const A=new Set(words(a)),B=new Set(words(b));let i=0;for(const w of A)if(B.has(w))i++;return Math.max(A.size,B.size)?i/Math.max(A.size,B.size):0}
const NUMWORD='(?:bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|on bir|on iki|on üç|on dört|on beş|on altı|on yedi|on sekiz|on dokuz|yirmi|otuz|kırk|elli)';
const MONEY_RE=/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi;
const DURATION_RE=new RegExp('\\b(?:\\d+|'+NUMWORD+')\\s*(?:dakika(?:da|dır|lık)?|dk|saat(?:te|tir|lik)?|gün(?:de|dür|lük)?|hafta(?:da|dır|lık)?|ay(?:da|dır|lık)?|yıl(?:da|dır|lık)?|gece(?:de)?)\\b','gi');
const COUNT_RE=new RegExp('\\b(?:\\d+|'+NUMWORD+')\\s*(?:kişi(?:ye|den)?|arkadaş(?:a|la|tan|ımız|ımıza)?|üye(?:ye|den)?|katılımcı(?:ya|dan)?)\\b','gi');
function protectNum(t){return String(t).replace(/(\d)\.(?=\d)/g,'$1§DOT§').replace(/(\d),(?=\d)/g,'$1§COMMA§')}
function restoreNum(t){return String(t).replace(/§DOT§/g,'.').replace(/§COMMA§/g,',')}
function clauses(t){return protectNum(t).split(/(?<=[.!?])\s+|\n+/).map(x=>restoreNum(clean(x))).filter(Boolean)}
function withPunc(x){x=clean(x);return x&&!/[.!?…]$/.test(x)?x+'.':x}
I.value=get('vanta_idea')||'';IMG.checked=get('vanta_img')==='1';I.oninput=()=>set('vanta_idea',I.value);IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');
function detect(t){
 const l=norm(t),money=t.match(MONEY_RE)||[],dur=t.match(DURATION_RE)||[],counts=t.match(COUNT_RE)||[],c=clauses(t);
 const signals={group:/grup|ekip|beraber|birlikte/.test(l),live:/canlı|yayın/.test(l),loss:/zarar|eksi|yanlış|geri verd|kaybet/.test(l),pressure:/risk|karar|bekle|kork|uyuma|uyku|gece|sabah|pozisyon|tereddüt/.test(l),human:/uykusuz|uyuyamad|stres|yorul|sabaha kadar|saatlerce|yemeği unut/.test(l),invisible:/kimsenin görmediği|görünmeyen|yüzlerce saat|uyumadan|arkasında|arasında/.test(l),identity:/bir lira param|param olmadığı|nereden nereye|nerelere geldim|hayat|şans|umut|savaş/.test(l)};
 const giveaway=/hediye|çekiliş|kazanan|vereceğim|veriyorum|göndereceğim|dağıt/.test(l);
 const journey=/başlad|başlangıç|bakiye|işlem|kâr|kar|pnl|kazand|ulaşt|elimde|vardı|serüven|çıktığım|geldiğim/.test(l)&&money.length>=2;
 let intent=giveaway?'giveaway':journey?'journey':'general';
 let mode='natural';if(intent==='journey'){if(signals.identity)mode='identity';else if(signals.human)mode='human_cost';else if(signals.invisible)mode='invisible_work';else if(signals.loss)mode='contrast';else if(money.length>=3)mode='progressive';else if(signals.pressure)mode='pressure';else mode=c.length<=2?'sparse':'scale'}
 return{raw:t,l,money,dur,counts,c,signals,intent,mode};
}
function hasAll(text,arr){const n=norm(text);return arr.every(x=>n.includes(norm(x)))}
function completeness(text,d){const l=norm(text);if(!hasAll(text,d.money)||!hasAll(text,d.dur)||!hasAll(text,d.counts))return false;if(d.signals.group&&!/grup|ekip|beraber|birlikte/.test(l))return false;if(d.signals.live&&!/canlı|yayın/.test(l))return false;if(d.intent==='giveaway'&&!/hediye|çekiliş|kazanan|vereceğim|veriyorum|göndereceğim|dağıt/.test(l))return false;return true}
function noInventedStructured(text,d){const om=text.match(MONEY_RE)||[],od=text.match(DURATION_RE)||[],oc=text.match(COUNT_RE)||[];if(om.some(x=>!d.money.some(y=>norm(y)===norm(x))))return false;if(od.some(x=>!d.dur.some(y=>norm(y)===norm(x))))return false;if(oc.some(x=>!d.counts.some(y=>norm(y)===norm(x))))return false;const l=norm(text);if(!d.signals.group&&/grupta|grupça|ekiple|ekipçe/.test(l))return false;if(!d.signals.live&&/canlı yayın/.test(l))return false;return true}
function semanticLock(text,d){return completeness(text,d)&&noInventedStructured(text,d)}
function dedupe(text){const out=[];for(const raw of String(text).split(/\n+/)){const x=withPunc(raw);if(!x)continue;if(out.some(y=>norm(y)===norm(x)||sim(y,x)>.94))continue;out.push(x)}return out.join('\n\n')}
function classifyClauses(d){const B=d.money[d.money.length-1]||'';const result=d.c.filter(x=>B&&norm(x).includes(norm(B)));const psych=d.c.filter(x=>{const l=norm(x);return (d.signals.human&&/uyku|stres|gece|sabah|yorul|saat|yemeği/.test(l))||(d.signals.invisible&&/görünm|saat|uyumadan|arasında/.test(l))||(d.signals.loss&&/zarar|eksi|yanlış|geri verd|kaybet/.test(l))||(d.signals.pressure&&/risk|karar|bekle|kork|pozisyon|tereddüt/.test(l))||(d.signals.identity&&/param|hayat|şans|umut|nereden|geldim|savaş/.test(l))});return{result,psych}}
function build(d,i){const src=d.c.length?d.c:[clean(d.raw)],k=classifyClauses(d);let arr=src.slice();if(d.intent==='journey'&&src.length>2){const result=k.result,psych=k.psych,other=src.filter(x=>!result.includes(x)&&!psych.includes(x));if(i%4===1&&result.length)arr=[other[0],...result,...psych,...other.slice(1)].filter(Boolean);else if(i%4===2&&psych.length)arr=[other[0],...psych,...result,...other.slice(1)].filter(Boolean);else if(i%4===3)arr=[src[0],...src.slice(1).reverse()];}
 if(IMG.checked&&arr.length>7)arr=arr.slice(0,7);
 let text=dedupe(arr.join('\n\n'));
 if(!semanticLock(text,d))text=dedupe(src.join('\n\n'));
 return{text,arch:i%4===0?'source_complete':d.mode+'_'+(i%4),intent:d.intent};}
function repPenalty(t){const ls=t.split(/\n+/).map(clean).filter(Boolean);let p=0;for(let i=0;i<ls.length;i++)for(let j=i+1;j<ls.length;j++)if(norm(ls[i])===norm(ls[j])||sim(ls[i],ls[j])>.90)p+=30;return clamp(p,0,90)}
function hook(t){const f=(t.split(/\n/).find(Boolean)||'').trim();let s=58;if(f.length<=75)s+=12;if(/\d|\$|₺|€|usdt/i.test(f))s+=10;if(f.length<=48)s+=6;if(f.length>115)s-=18;return clamp(s,20,98)}
function rhythm(t){const ls=t.split(/\n+/).map(clean).filter(Boolean);let s=60;if(ls.length>=2&&ls.length<=8)s+=14;if(ls.some(x=>x.length<=30))s+=8;if(ls.some(x=>x.length>=65)&&ls.some(x=>x.length<=30))s+=7;if(ls.length>11)s-=12;return clamp(s,20,98)}
function psych(t,d){let s=66,l=norm(t);if(d.signals.group&&/grup|ekip|beraber|birlikte/.test(l))s+=6;if(d.signals.human&&/uyku|stres|gece|sabah|yorul|saat|yemeği/.test(l))s+=12;if(d.signals.invisible&&/görünm|saat|uyumadan|arasında/.test(l))s+=12;if(d.signals.loss&&/zarar|eksi|yanlış|geri verd|kaybet/.test(l))s+=12;if(d.signals.pressure&&/risk|karar|bekle|kork|pozisyon|tereddüt/.test(l))s+=10;if(d.signals.identity&&/param|hayat|şans|umut|nereden|geldim|savaş/.test(l))s+=10;return clamp(s,20,98)}
function secondLoop(t,d){if(d.intent!=='journey'||!d.money.length)return 74;const B=d.money[d.money.length-1],p=norm(t).lastIndexOf(norm(B));if(p<0)return 45;let s=62,r=p/Math.max(1,norm(t).length);if(r<.82)s+=14;if(r<.65)s+=10;return clamp(s,20,98)}
function voice(t,d){const rw=new Set(words(d.raw)),tw=words(t);let c=0;for(const w of tw)if(rw.has(w))c++;return clamp(60+(tw.length?Math.round(c/tw.length*38):0),20,98)}
function novelty(t){const h=json('vanta_hist',[]);let worst=0;for(const o of h)worst=Math.max(worst,sim(t,o.text||''));return clamp(Math.round(98-worst*58),20,98)}
function score(v,d){const fact=semanticLock(v.text,d)?98:0,h=hook(v.text),r=rhythm(v.text),p=psych(v.text,d),loop=secondLoop(v.text,d),vo=voice(v.text,d),n=novelty(v.text),rep=repPenalty(v.text);let total=Math.round(fact*.32+h*.13+r*.12+p*.12+loop*.11+vo*.12+n*.08-rep*.45);if(!fact)total=0;if(rep)total=Math.min(total,55);return{fact,hook:h,rhythm:r,psy:p,loop,voice:vo,nov:n,rep,total:clamp(total,0,96)}}
function finalists(d){const all=[];for(let i=0;i<16;i++)all.push(build(d,i));for(const v of all)v.s=score(v,d);all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){if(v.s.fact<98||v.s.rep>0)continue;if(out.some(x=>sim(v.text,x.text)>.91))continue;out.push(v);if(out.length===3)break}if(!out.length){const r=build(d,0);r.s=score(r,d);out.push(r)}return out}
async function copy(t){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(t);else throw 0;alert('Kopyalandı.')}catch(e){const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();alert('Kopyalandı.')}}
function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,120)))}
const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.hook+'</b><span>İlk satır</span></div><div class="metric"><b>'+v.s.rhythm+'</b><span>Ritim</span></div><div class="metric"><b>'+v.s.loop+'</b><span>2. merak</span></div><div class="metric"><b>'+v.s.psy+'</b><span>Psikoloji</span></div><div class="metric"><b>'+v.s.voice+'</b><span>Senin sesin</span></div><div class="metric"><b>'+v.s.fact+'</b><span>Fact lock</span></div></div>';
function selfTest(){const cases=[
 '200$ ile başladığımız serüven üç günde 6.088$\'a ulaştı. İşlemleri grupta hep birlikte yaptık.',
 '1.000$ ile başladım. Bir haftada 77.191,08 USDT oldu. Bugün -2.479$ zarar görünüyor.',
 'Dün gece 200$ vardı. Sonra 500$. Sonra 1.000$. Sabah 6.156$ oldu.',
 '5 kişiye 700$ hediye edeceğim. Bir saat sonra isimleri açıklayacağım.',
 'Ocak ayında elimde 1.000 dolar vardı. Bugün 244.000 dolar var. Arada kimsenin görmediği yüzlerce saat var.',
 '20 gün önce 1.000 dolar vardı. Uykusuz kaldım, sabaha kadar ekrana baktım. Bugün 111.601 USDT var.'
 ];for(const t of cases){const d=detect(t),a=finalists(d);if(!a.length||a.some(v=>!semanticLock(v.text,d)))return false;}return true}
let runToken=0;const TEST_OK=selfTest();if(!TEST_OK){RUN.disabled=true;SCAN.textContent='Güvenlik testi başarısız. Motor durduruldu.';RUN.textContent='Motor kilitli';}
RUN.onclick=function(){if(!TEST_OK)return;const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}const token=++runToken;RUN.disabled=true;ST.style.display='block';RES.innerHTML='';BAR.style.width='10%';SCAN.textContent='v2.2 gerçekleri kilitliyor…';const step=(ms,w,msg)=>setTimeout(()=>{if(token!==runToken)return;BAR.style.width=w;SCAN.textContent=msg},ms);step(120,'35%','Fact lock: rakam, süre, grup ve kişi bilgileri kontrol ediliyor…');step(240,'62%','Regression guard: eski hatalar tekrar test ediliyor…');step(360,'84%','Winning DNA: yalnızca verdiğin psikoloji sinyalleri kullanılıyor…');setTimeout(()=>{if(token!==runToken)return;try{const d=detect(t),arr=finalists(d);if(!arr.length||arr.some(v=>!semanticLock(v.text,d)))throw new Error('fact-lock');BAR.style.width='100%';SCAN.textContent='v2.2 · regression lock geçti · '+arr.length+' finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">EN GÜÇLÜ ADAY · '+w.arch+' · '+d.mode+'</div></div><div class="score">'+w.s.total+'<small>/96</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+v.arch+' · '+v.s.total+'/96</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'});}catch(e){RES.innerHTML='<div class="winner"><div class="crown">GÜVENLİK KİLİDİ</div><div class="tweet">Bu girdide tüm gerçekleri güvenli biçimde koruyamadım. Tweet üretmedim.</div></div>';SCAN.textContent='Fact lock başarısız · çıktı engellendi';}finally{RUN.disabled=false}},500)};
})();