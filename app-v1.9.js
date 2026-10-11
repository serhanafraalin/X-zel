(function(){
const $=id=>document.getElementById(id),I=$('idea'),IMG=$('img'),ST=$('stage'),RES=$('results'),BAR=$('bar'),SCAN=$('scanText');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const json=(k,d)=>{try{return JSON.parse(get(k)||JSON.stringify(d))}catch(e){return d}};
const clean=x=>x.replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();
const norm=x=>clean(x).toLowerCase().replace(/[.!?,:;]+$/,'');
const words=t=>t.toLowerCase().replace(/[^a-z0-9çğıöşü$₺€ ]/g,' ').split(/\s+/).filter(x=>x.length>2);
function sim(a,b){const A=new Set(words(a)),B=new Set(words(b));let i=0;for(const w of A)if(B.has(w))i++;return Math.max(A.size,B.size)?i/Math.max(A.size,B.size):0}
I.value=get('vanta_idea')||'';IMG.checked=get('vanta_img')==='1';I.oninput=()=>set('vanta_idea',I.value);IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');
try{document.querySelectorAll('.live').forEach(x=>{if(/^v1\./i.test(x.textContent.trim()))x.textContent='v1.9'});const p=document.querySelector('.hero p');if(p)p.textContent='Kazanan tweetlerin psikolojisini kullanır ama kaynakta olmayan duygu, olay veya detay üretmez. Az bilgi varsa kısa yazar; çok bilgi varsa hikâyeyi derinleştirir.'}catch(e){}
function detect(t){
 const l=t.toLowerCase();
 const money=t.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[];
 const durations=t.match(/\b\d+\s*(?:dakika|dk|saat|gün|hafta|ay|yıl|gece)\b/gi)||[];
 const counts=t.match(/\b\d+\s*(?:kişi|arkadaş|üye|katılımcı)\b/gi)||[];
 const clauses=t.split(/[.!?\n]+/).map(clean).filter(Boolean);
 const giveaway=/hediye|çekiliş|kazanan|vereceğim|veriyorum|göndereceğim|dağıt/.test(l);
 const question=/\?|sizce|ne düşünüyorsunuz|hangisi/.test(l);
 const journey=/başlad|başlangıç|bakiye|işlem|kâr|kar|pnl|kazand|ulaşt|elimde|vardı/.test(l)&&money.length>=2;
 const signals={
  loss:/zarar|eksi|yanlış|geri verd|kaybet/.test(l),
  pressure:/risk|karar|bekle|kork|uyuma|uyku|gece|sabah|pozisyon|tereddüt/.test(l),
  human:/uykusuz|uyuyamad|yemeği unut|sabaha kadar|stres|yorul|geceler|saatlerce|yüzlerce saat/.test(l),
  invisible:/kimsenin görmediği|görünmeyen|yüzlerce saat|uyumadan|tereddüt ettiğim|arkasında|arasında/.test(l),
  identity:/bir lira param|param olmadığı|nerelere geldim|nereden nereye|hayat|şans|umut|savaş/.test(l),
  group:/grup|ekip|beraber|birlikte/.test(l),
  live:/canlı|yayın/.test(l)
 };
 let intent='general';if(giveaway)intent='giveaway';else if(question)intent='question';else if(journey)intent='journey';
 const richness=clauses.length + Object.values(signals).filter(Boolean).length + Math.max(0,money.length-2);
 const sparse=richness<=2;
 let mode='natural';if(intent==='journey'){if(sparse)mode='sparse';else if(signals.identity)mode='identity';else if(signals.human)mode='human_cost';else if(signals.invisible)mode='invisible_work';else if(signals.loss)mode='contrast';else if(money.length>=3)mode='progressive';else if(signals.pressure)mode='pressure';else mode='scale'}
 return{raw:t,l,money,durations,counts,clauses,signals,intent,mode,sparse};
}
function semanticLock(text,d){
 const allowedMoney=new Set(d.money.map(norm));
 const outMoney=text.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[];
 for(const x of outMoney)if(!allowedMoney.has(norm(x)))return false;
 const allowedDur=new Set(d.durations.map(norm));
 const outDur=text.match(/\b\d+\s*(?:dakika|dk|saat|gün|hafta|ay|yıl|gece)\b/gi)||[];
 for(const x of outDur)if(!allowedDur.has(norm(x)))return false;
 if(d.intent==='giveaway'&&!/hediye|verece|veriyorum|gönderece|kazanan|dağıt/.test(text.toLowerCase()))return false;
 if(!d.signals.group&&/grupta|grupça|ekiple|ekipçe/.test(text.toLowerCase()))return false;
 if(!d.signals.live&&/canlı yayın/.test(text.toLowerCase()))return false;
 return true;
}
function dedupeLines(text){const out=[],seen=[];for(const raw of text.split(/\n+/)){const x=clean(raw);if(!x)continue;let dup=false;for(const y of seen)if(norm(x)===norm(y)||sim(x,y)>.9){dup=true;break}if(!dup){seen.push(x);out.push(x)}}return out.join('\n\n')}
function sparseBuild(d,i){const A=d.money[0]||'',B=d.money[d.money.length-1]||'',T=d.durations[0]||'';const source=clean(d.raw);const variants=[
 `${A} ile başladık.\n\n${T?T+' sonra:':''}\n\n${B}.`,
 `${A}.\n\n${T?T+'.':''}\n\n${B}.`,
 `${T?T+' içinde ':''}${A} → ${B}.`,
 source
 ];return{text:dedupeLines(variants[i%variants.length]),arch:['sparse_reveal','sparse_stack','sparse_arrow','source_clean'][i%4],intent:d.intent}}
function giveawayBuild(d,i){const A=d.money[0]||'',C=d.counts[0]||'',T=d.durations[0]||'';const a=[`${C||'Birkaç kişiye'} ${A} hediye edeceğim.\n\n${T?T+' sonra ':''}isimleri açıklıyorum.`,`${A}.\n\n${C}.\n\n${T?T+' sonra açıklıyorum.':'Birazdan açıklıyorum.'}`,clean(d.raw)];return{text:dedupeLines(a[i%a.length]),arch:['giveaway_direct','giveaway_stack','source_clean'][i%3],intent:d.intent}}
function richBuild(d,i){const A=d.money[0]||'',B=d.money[d.money.length-1]||'',T=d.durations[0]||'',c=d.clauses;const facts=c.filter(Boolean);let parts=[];
 if(d.mode==='contrast')parts=[facts[0]||`${A} ile başladık.`,facts.find(x=>/zarar|eksi|yanlış|geri verd|kaybet/i.test(x))||'',B?`${B}.`:''];
 else if(d.mode==='human_cost')parts=[facts[0]||`${A} ile başladık.`,...facts.filter(x=>/uyku|stres|gece|sabah|yorul|saat/i.test(x)),B?`${B}.`:''];
 else if(d.mode==='invisible_work')parts=[facts[0]||`${A} ile başladık.`,...facts.filter(x=>/görünm|saat|tereddüt|uyumadan|arasında/i.test(x)),B?`${B}.`:''];
 else if(d.mode==='progressive')parts=[facts[0]||`${A} ile başladık.`,...d.money.slice(1,-1).map(x=>`${x}.`),B?`${B}.`:''];
 else if(d.mode==='pressure')parts=[facts[0]||`${A} ile başladık.`,...facts.filter(x=>/risk|karar|bekle|kork|pozisyon|tereddüt/i.test(x)),B?`${B}.`:''];
 else parts=[facts[0]||`${A} ile başladık.`,B?`${B}.`:''];
 if(IMG.checked&&parts.length>3)parts=parts.slice(0,3);
 if(i%2===1)parts=[parts[0],...parts.slice(1).reverse()];
 return{text:dedupeLines(parts.filter(Boolean).join('\n\n')),arch:d.mode+'_'+(i%2?'reverse':'clean'),intent:d.intent};
}
function build(d,i){if(d.intent==='giveaway')return giveawayBuild(d,i);if(d.mode==='sparse')return sparseBuild(d,i);if(d.intent==='journey')return richBuild(d,i);return{text:clean(d.raw),arch:'source_clean',intent:d.intent}}
function repetitionPenalty(t){const lines=t.split(/\n+/).map(clean).filter(Boolean);let p=0;for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++)if(norm(lines[i])===norm(lines[j])||sim(lines[i],lines[j])>.88)p+=30;return clamp(p,0,90)}
function fillerPenalty(t,d){let p=0;const l=t.toLowerCase();const generic=[/bazen sonuç geldiğinde/i,/beni asıl vuran/i,/benim aklım hâlâ/i,/hikâyeyi asıl değiştiren/i,/bir zamanlar imkânsız/i,/sadece yaşayan biliyor/i,/ekran finali gösteriyor/i];for(const r of generic)if(r.test(l)&&!r.test(d.l))p+=18;return clamp(p,0,80)}
function hook(t){const first=(t.split(/\n/).find(Boolean)||'').trim();let s=60;if(first.length<=70)s+=12;if(/\d|\$|₺|€|usdt/i.test(first))s+=10;if(first.length<=45)s+=6;if(first.length>110)s-=20;return clamp(s,20,98)}
function rhythm(t){const ls=t.split(/\n+/).map(clean).filter(Boolean);let s=62;if(ls.length>=2&&ls.length<=6)s+=14;if(ls.some(x=>x.length<=25))s+=8;if(ls.length>8)s-=16;return clamp(s,20,98)}
function factUse(t,d){let s=70;for(const x of d.money)if(t.toLowerCase().includes(x.toLowerCase()))s+=7;for(const x of d.durations)if(t.toLowerCase().includes(x.toLowerCase()))s+=5;return clamp(s,20,98)}
function voice(t,d){const rw=new Set(words(d.raw)),tw=words(t);let c=0;for(const w of tw)if(rw.has(w))c++;return clamp(60+(tw.length?Math.round(c/tw.length*38):0),20,98)}
function novelty(t){const old=json('vanta_runs',[]).concat(json('vanta_hist',[]));let worst=0;for(const o of old)worst=Math.max(worst,sim(t,o.text||''));return clamp(Math.round(98-worst*60),20,98)}
function score(v,d){const fact=semanticLock(v.text,d)?98:0,h=hook(v.text),r=rhythm(v.text),use=factUse(v.text,d),vo=voice(v.text,d),nov=novelty(v.text),rep=repetitionPenalty(v.text),fill=fillerPenalty(v.text,d);let total=Math.round(fact*.25+h*.18+r*.14+use*.17+vo*.14+nov*.12-rep*.45-fill*.35);if(!fact)total=0;if(rep>=30)total=Math.min(total,55);return{fact,hook:h,rhythm:r,use,voice:vo,nov,rep,fill,total:clamp(total,0,96)}}
function finalists(d){const all=[];for(let i=0;i<160;i++)all.push(build(d,i));for(const v of all)v.s=score(v,d);all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){if(v.s.fact<98||v.s.rep>0)continue;let ok=true;for(const x of out)if(sim(v.text,x.text)>.72||v.arch===x.arch)ok=false;if(ok)out.push(v);if(out.length===3)break}if(!out.length){const r={text:clean(d.raw),arch:'source_safe',intent:d.intent};r.s=score(r,d);out.push(r)}return out}
function saveRun(arr){let h=json('vanta_runs',[]);for(const v of arr)h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_runs',JSON.stringify(h.slice(0,320)))}
function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,120)))}
function copy(t){navigator.clipboard?.writeText(t).then(()=>alert('Kopyalandı.'))}
const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.hook+'</b><span>İlk satır</span></div><div class="metric"><b>'+v.s.rhythm+'</b><span>Ritim</span></div><div class="metric"><b>'+v.s.use+'</b><span>Bilgi kullanımı</span></div><div class="metric"><b>'+v.s.voice+'</b><span>Senin sesin</span></div><div class="metric"><b>'+v.s.fact+'</b><span>Anlam kilidi</span></div><div class="metric"><b>'+v.s.nov+'</b><span>Tekrar riski</span></div></div>';
$('run').onclick=function(){const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}ST.style.display='block';RES.innerHTML='';BAR.style.width='8%';SCAN.textContent='v1.9 bilgi yoğunluğunu ölçüyor…';setTimeout(()=>{BAR.style.width='28%';SCAN.textContent='Fact Sufficiency: az bilgiye uzun hikâye uydurulmuyor…'},140);setTimeout(()=>{BAR.style.width='49%';SCAN.textContent='Duplicate Guard: aynı fikir ikinci kez yazılamıyor…'},280);setTimeout(()=>{BAR.style.width='70%';SCAN.textContent='Filler Filter: yapay psikoloji cümleleri eleniyor…'},420);setTimeout(()=>{BAR.style.width='88%';SCAN.textContent='Image Fit: görsel varsa metin gereksiz uzatılmıyor…'},560);setTimeout(()=>{const d=detect(t),arr=finalists(d);saveRun(arr);BAR.style.width='100%';SCAN.textContent='v1.9 · bilgiye göre uzunluk + tekrar kilidi tamamlandı · '+arr.length+' finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">EN GÜÇLÜ ADAY · '+w.arch+' · '+d.mode+'</div></div><div class="score">'+w.s.total+'<small>/96</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+v.arch+' · '+v.s.total+'/96</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'})},720)};
})();