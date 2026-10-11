(function(){
'use strict';
const $=id=>document.getElementById(id);
const I=$('idea'),IMG=$('img'),ST=$('stage'),RES=$('results'),BAR=$('bar'),SCAN=$('scanText'),RUN=$('run');
if(!I||!IMG||!ST||!RES||!BAR||!SCAN||!RUN)return;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const json=(k,d)=>{try{return JSON.parse(get(k)||JSON.stringify(d))}catch(e){return d}};
const clean=x=>String(x||'').replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
const norm=x=>clean(x).toLocaleLowerCase('tr-TR').replace(/[.!?,:;]+$/,'');
const words=t=>norm(t).replace(/[^a-z0-9çğıöşü$₺€ ]/g,' ').split(/\s+/).filter(x=>x.length>2);
function sim(a,b){const A=new Set(words(a)),B=new Set(words(b));let i=0;for(const w of A)if(B.has(w))i++;return Math.max(A.size,B.size)?i/Math.max(A.size,B.size):0}
function protectDecimals(t){return String(t).replace(/(\d)\.(?=\d)/g,'$1§DOT§').replace(/(\d),(?=\d)/g,'$1§COMMA§')}
function restoreDecimals(t){return String(t).replace(/§DOT§/g,'.').replace(/§COMMA§/g,',')}
function splitClauses(t){return protectDecimals(t).split(/[.!?\n]+/).map(x=>restoreDecimals(clean(x))).filter(Boolean)}
const NUM='(?:\\d+|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)';
const MONEY_RE=/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi;
const DURATION_RE=new RegExp('\\b'+NUM+'\\s*(?:dakika(?:da|dır|lık)?|dk|saat(?:te|tir|lik)?|gün(?:de|dür|lük)?|hafta(?:da|dır|lık)?|ay(?:da|dır|lık)?|yıl(?:da|dır|lık)?|gece(?:de)?)\\b','gi');
const COUNT_RE=new RegExp('\\b'+NUM+'\\s*(?:kişi(?:ye|den)?|arkadaş(?:a|la|tan|ımız|ımıza)?|üye(?:ye|den)?|katılımcı(?:ya|dan)?)\\b','gi');
I.value=get('vanta_idea')||'';IMG.checked=get('vanta_img')==='1';
I.oninput=()=>set('vanta_idea',I.value);IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');
function detect(t){
 const l=norm(t),money=t.match(MONEY_RE)||[],durations=t.match(DURATION_RE)||[],counts=t.match(COUNT_RE)||[],clauses=splitClauses(t);
 const giveaway=/hediye|çekiliş|kazanan|vereceğim|veriyorum|göndereceğim|dağıt/.test(l);
 const question=/\?|sizce|ne düşünüyorsunuz|hangisi/.test(t.toLowerCase());
 const journey=/başlad|başlangıç|bakiye|işlem|kâr|kar|pnl|kazand|ulaşt|elimde|vardı|oldu|çıktı|dönüştü|yaptık|geldi|çıkardık|arttı/.test(l)&&money.length>=2;
 const signals={loss:/zarar|eksi|yanlış|geri verd|kaybet/.test(l),pressure:/risk|karar|bekle|kork|uyuma|uyku|gece|sabah|pozisyon|tereddüt/.test(l),human:/uykusuz|uyuyamad|yemeği unut|sabaha kadar|stres|yorul|geceler|saatlerce|yüzlerce saat/.test(l),invisible:/kimsenin görmediği|görünmeyen|yüzlerce saat|uyumadan|tereddüt ettiğim|arkasında|arasında/.test(l),identity:/bir lira param|param olmadığı|nerelere geldim|nereden nereye|hayat|şans|umut|savaş/.test(l),group:/grup|ekip|beraber|birlikte/.test(l),live:/canlı|yayın/.test(l)};
 let intent='general';if(giveaway)intent='giveaway';else if(journey)intent='journey';else if(question)intent='question';
 const richness=clauses.length+Object.values(signals).filter(Boolean).length+Math.max(0,money.length-2)+Math.min(2,durations.length);
 const sparse=richness<=3;
 let mode='natural';if(intent==='journey'){if(sparse)mode='sparse';else if(signals.identity)mode='identity';else if(signals.human)mode='human_cost';else if(signals.invisible)mode='invisible_work';else if(signals.loss)mode='contrast';else if(money.length>=3)mode='progressive';else if(signals.pressure)mode='pressure';else mode='scale'}
 return{raw:t,l,money,durations,counts,clauses,signals,intent,mode,sparse};
}
function semanticLock(text,d){
 const outMoney=text.match(MONEY_RE)||[],allowMoney=new Set(d.money.map(norm));for(const x of outMoney)if(!allowMoney.has(norm(x)))return false;
 const outDur=text.match(DURATION_RE)||[],allowDur=new Set(d.durations.map(norm));for(const x of outDur)if(!allowDur.has(norm(x)))return false;
 const outCount=text.match(COUNT_RE)||[],allowCount=new Set(d.counts.map(norm));for(const x of outCount)if(!allowCount.has(norm(x)))return false;
 const l=norm(text);
 if(d.intent==='giveaway'&&!/hediye|verece|veriyorum|gönderece|kazanan|dağıt/.test(l))return false;
 if(!d.signals.group&&/grupta|grupça|ekiple|ekipçe/.test(l))return false;
 if(!d.signals.live&&/canlı yayın/.test(l))return false;
 return true;
}
function dedupeLines(text){const out=[],seen=[];for(const raw of String(text).split(/\n+/)){const x=clean(raw);if(!x)continue;if(seen.some(y=>norm(x)===norm(y)||sim(x,y)>.90))continue;seen.push(x);out.push(x)}return out.join('\n\n')}
function escapeRe(s){return String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function clauseWith(c,re){return c.find(x=>re.test(x))||''}
function sourceCandidates(d){const c=d.clauses.slice(),A=d.money[0]||'',B=d.money[d.money.length-1]||'';const start=clauseWith(c,A?new RegExp(escapeRe(A),'i'):/$a/),result=clauseWith(c,B?new RegExp(escapeRe(B),'i'):/$a/);
 const psych=c.filter(x=>{const l=norm(x);if(d.mode==='human_cost')return /uyku|stres|gece|sabah|yorul|saat/.test(l);if(d.mode==='invisible_work')return /görünm|saat|tereddüt|uyumadan|arasında/.test(l);if(d.mode==='contrast')return /zarar|eksi|yanlış|geri verd|kaybet/.test(l);if(d.mode==='pressure')return /risk|karar|bekle|kork|pozisyon|tereddüt/.test(l);if(d.mode==='identity')return /param|hayat|şans|umut|nereden|geldim|savaş/.test(l);return false});
 return{c,A,B,start,result,psych};
}
function sparseBuild(d,i){const A=d.money[0]||'',B=d.money[d.money.length-1]||'',T=d.durations[0]||'',source=clean(d.raw);const v=[source,[A,T,B].filter(Boolean).join('\n\n'),T?[`${A}.`,`${T}.`,`${B}.`].join('\n\n'):[`${A}.`,`${B}.`].join('\n\n'),T?`${T}: ${A} → ${B}`:`${A} → ${B}`];return{text:dedupeLines(v[i%v.length]),arch:['source_clean','sparse_stack','sparse_punch','sparse_arrow'][i%4],intent:d.intent}}
function giveawayBuild(d,i){const source=clean(d.raw),clauses=d.clauses.filter(Boolean);const variants=[source];if(clauses.length>1)variants.push(dedupeLines(clauses.join('\n\n')));return{text:variants[i%variants.length],arch:i%2?'giveaway_blocks':'source_clean',intent:d.intent}}
function journeyBuild(d,i){const s=sourceCandidates(d),all=s.c.slice();if(!all.length)return{text:clean(d.raw),arch:'source_clean',intent:d.intent};let parts=[];
 if(d.mode==='progressive'){const mids=d.money.slice(1,-1);parts=[s.start||all[0],...mids.map(x=>x),...all.filter(x=>x!==s.start&&x!==s.result&&!mids.some(m=>norm(x).includes(norm(m)))),s.result||s.B];}
 else if(['human_cost','invisible_work','contrast','pressure','identity'].includes(d.mode)){const remaining=all.filter(x=>x!==s.start&&x!==s.result&&!s.psych.includes(x));parts=i%2===0?[s.start||all[0],...s.psych,s.result||s.B,...remaining]:[s.start||all[0],s.result||s.B,...s.psych,...remaining];}
 else parts=i%2===0?[s.start||all[0],s.result||s.B,...all.filter(x=>x!==s.start&&x!==s.result)]:[s.start||all[0],...all.filter(x=>x!==s.start&&x!==s.result),s.result||s.B];
 parts=parts.filter(Boolean);if(IMG.checked&&parts.length>5)parts=parts.slice(0,5);return{text:dedupeLines(parts.join('\n\n')),arch:d.mode+'_'+(i%2?'late':'early'),intent:d.intent};
}
function build(d,i){if(d.intent==='giveaway')return giveawayBuild(d,i);if(d.mode==='sparse')return sparseBuild(d,i);if(d.intent==='journey')return journeyBuild(d,i);return{text:clean(d.raw),arch:'source_clean',intent:d.intent}}
function repetitionPenalty(t){const lines=t.split(/\n+/).map(clean).filter(Boolean);let p=0;for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++)if(norm(lines[i])===norm(lines[j])||sim(lines[i],lines[j])>.88)p+=30;return clamp(p,0,90)}
function hookScore(t){const first=(t.split(/\n/).find(Boolean)||'').trim();let s=58;if(first.length<=70)s+=12;if(/\d|\$|₺|€|usdt/i.test(first))s+=10;if(first.length<=45)s+=6;if(first.length>110)s-=18;return clamp(s,20,98)}
function rhythmScore(t){const ls=t.split(/\n+/).map(clean).filter(Boolean);let s=60;if(ls.length>=2&&ls.length<=7)s+=14;if(ls.some(x=>x.length<=28))s+=8;if(ls.some(x=>x.length>=65)&&ls.some(x=>x.length<=28))s+=8;if(ls.length>10)s-=16;return clamp(s,20,98)}
function factUse(t,d){let used=0,total=d.money.length+d.durations.length+d.counts.length;for(const x of [...d.money,...d.durations,...d.counts])if(norm(t).includes(norm(x)))used++;let s=total?60+Math.round(38*used/total):82;return clamp(s,20,98)}
function secondLoop(t,d){if(d.intent!=='journey'||!d.money.length)return 74;const B=d.money[d.money.length-1],pos=norm(t).lastIndexOf(norm(B));if(pos<0)return 45;const ratio=pos/Math.max(1,t.length);let s=62;if(ratio<.82)s+=16;if(ratio<.68)s+=8;return clamp(s,20,98)}
function psychologyScore(t,d){if(d.intent!=='journey')return 76;const l=norm(t);let s=62;if(d.signals.human&&/uyku|stres|gece|sabah|yorul|saat/.test(l))s+=16;if(d.signals.invisible&&/görünm|saat|tereddüt|uyumadan|arasında/.test(l))s+=16;if(d.signals.loss&&/zarar|eksi|yanlış|geri verd|kaybet/.test(l))s+=16;if(d.signals.pressure&&/risk|karar|bekle|kork|pozisyon|tereddüt/.test(l))s+=14;if(d.signals.identity&&/param|hayat|şans|umut|nereden|geldim|savaş/.test(l))s+=14;return clamp(s,20,98)}
function voiceScore(t,d){const rw=new Set(words(d.raw)),tw=words(t);let c=0;for(const w of tw)if(rw.has(w))c++;return clamp(58+(tw.length?Math.round(c/tw.length*40):0),20,98)}
function noveltyScore(t){const posted=json('vanta_hist',[]);let worst=0;for(const o of posted)worst=Math.max(worst,sim(t,o.text||''));return clamp(Math.round(98-worst*58),20,98)}
function imageFit(t){if(!IMG.checked)return 82;let s=80;if(t.length<420)s+=10;if((t.match(/\n\n/g)||[]).length<=5)s+=6;return clamp(s,20,98)}
function score(v,d){const fact=semanticLock(v.text,d)?98:0,h=hookScore(v.text),r=rhythmScore(v.text),use=factUse(v.text,d),loop=secondLoop(v.text,d),psy=psychologyScore(v.text,d),vo=voiceScore(v.text,d),nov=noveltyScore(v.text),vis=imageFit(v.text),rep=repetitionPenalty(v.text);let total=Math.round(fact*.22+h*.12+r*.11+use*.13+loop*.11+psy*.12+vo*.09+nov*.06+vis*.04-rep*.45);if(!fact)total=0;if(rep>=30)total=Math.min(total,55);return{fact,hook:h,rhythm:r,use,loop,psy,voice:vo,nov,vis,rep,total:clamp(total,0,96)}}
function finalists(d){const all=[];for(let i=0;i<48;i++)all.push(build(d,i));for(const v of all)v.s=score(v,d);all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){if(v.s.fact<98||v.s.rep>0)continue;if(out.some(x=>sim(v.text,x.text)>.76||v.arch===x.arch))continue;out.push(v);if(out.length===3)break}if(!out.length){const r={text:clean(d.raw),arch:'source_safe',intent:d.intent};r.s=score(r,d);out.push(r)}return out}
function saveRun(arr){let h=json('vanta_runs',[]);for(const v of arr)h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_runs',JSON.stringify(h.slice(0,160)))}
function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,120)))}
async function copy(t){try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(t)}else{const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove()}alert('Kopyalandı.')}catch(e){alert('Kopyalama başarısız. Metni basılı tutup kopyalayabilirsin.')}}
const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.hook+'</b><span>İlk satır</span></div><div class="metric"><b>'+v.s.rhythm+'</b><span>Ritim</span></div><div class="metric"><b>'+v.s.loop+'</b><span>2. merak</span></div><div class="metric"><b>'+v.s.psy+'</b><span>Psikoloji</span></div><div class="metric"><b>'+v.s.use+'</b><span>Bilgi kullanımı</span></div><div class="metric"><b>'+v.s.voice+'</b><span>Senin sesin</span></div><div class="metric"><b>'+v.s.fact+'</b><span>Anlam kilidi</span></div><div class="metric"><b>'+v.s.nov+'</b><span>Tekrar riski</span></div></div>';
let runSeq=0,timers=[];function clearTimers(){for(const id of timers)clearTimeout(id);timers=[]}
RUN.onclick=function(){const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}const seq=++runSeq;clearTimers();RUN.disabled=true;ST.style.display='block';RES.innerHTML='';BAR.style.width='8%';SCAN.textContent='v2.0 veri bütünlüğünü kontrol ediyor…';const step=(ms,w,txt)=>timers.push(setTimeout(()=>{if(seq!==runSeq)return;BAR.style.width=w;SCAN.textContent=txt},ms));step(120,'27%','Türkçe sayı/süre ayrıştırması kontrol ediliyor…');step(240,'46%','Duplicate Guard: aynı bilgi ikinci kez yazılmıyor…');step(360,'65%','Winning DNA: kaynakta gerçekten bulunan psikoloji korunuyor…');step(480,'82%','Second Loop + Image Fit test ediliyor…');step(600,'94%','Semantic Fact Lock son kontrolü yapıyor…');timers.push(setTimeout(()=>{if(seq!==runSeq)return;try{const d=detect(t),arr=finalists(d);saveRun(arr);BAR.style.width='100%';SCAN.textContent='v2.0 · güvenli ayrıştırma + psikoloji + tekrar kilidi · '+arr.length+' finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">EN GÜÇLÜ ADAY · '+w.arch+' · '+d.mode+'</div></div><div class="score">'+w.s.total+'<small>/96</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+v.arch+' · '+v.s.total+'/96</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'});}catch(e){console.error(e);SCAN.textContent='Bir hata oluştu. Girdi korunarak işlem durduruldu.';alert('Beklenmeyen bir hata oluştu. Sayfayı yenileyip tekrar dene.')}finally{RUN.disabled=false}},720))};
})();