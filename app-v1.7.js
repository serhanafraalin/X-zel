(function(){
const $=id=>document.getElementById(id),I=$('idea'),IMG=$('img'),ST=$('stage'),RES=$('results'),BAR=$('bar'),SCAN=$('scanText');
const pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}},set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const json=(k,d)=>{try{return JSON.parse(get(k)||JSON.stringify(d))}catch(e){return d}};
const protect=t=>t.replace(/(\d)\.(?=\d)/g,'$1§DOT§'),restore=t=>t.replace(/§DOT§/g,'.');
const sentences=t=>(protect(t.replace(/[\r\n]+/g,' ')).match(/[^.!?]+[.!?]?/g)||[t]).map(x=>restore(x.trim())).filter(Boolean);
const words=t=>t.toLowerCase().replace(/[^a-z0-9çğıöşü$₺€ ]/g,' ').split(/\s+/).filter(x=>x.length>2);
function sim(a,b){const A=new Set(words(a)),B=words(b);let i=0,u=A.size,s=new Set(A);for(const w of B){if(A.has(w))i++;else if(!s.has(w)){s.add(w);u++}}return u?i/u:0}
I.value=get('vanta_idea')||'';IMG.checked=get('vanta_img')==='1';I.oninput=()=>set('vanta_idea',I.value);IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');
const norm=t=>t.toLowerCase().replace(/\s+/g,' ').trim();
function detect(t){
 const l=t.toLowerCase(),s=sentences(t);
 const m=t.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[];
 const d=t.match(/\b\d+\s*(?:dakika|dk|saat|gün|hafta|ay|yıl|gece)\b/gi)||[];
 const counts=t.match(/\b\d+\s*(?:kişi|arkadaş|üye|katılımcı)\b/gi)||[];
 const giveaway=/hediye|çekiliş|kazanan|vereceğim|veriyorum|göndereceğim|dağıt/.test(l);
 const question=/\?|sizce|ne düşünüyorsunuz|hangisi/.test(l);
 const group=/grup|ekip|beraber|birlikte/.test(l),live=/canlı|yayın/.test(l);
 const journey=/başlad|başlangıç|bakiye|işlem|kâr|kar|pnl|kazand|ulaşt/.test(l)&&m.length>=2;
 const loss=/zarar|eksi|yanlış|geri verd|kaybet|eksi pnl|-\s*\d/.test(l);
 const pressure=/risk|karar|bekle|kork|uyuma|uyku|gece|sabah|bir işlem daha|pozisyon/.test(l);
 const time=/gece|sabah|bugün|dün|hafta|gün|saat/.test(l);
 const life=/ev|araba|tapu|borç|çekim|satın al/.test(l);
 let intent='general'; if(giveaway)intent='giveaway'; else if(question)intent='question'; else if(journey)intent='journey'; else if(life)intent='life_result';
 let mode='natural';
 if(intent==='journey'){
   if(loss)mode='contrast';
   else if(m.length>=3)mode='progressive';
   else if(pressure)mode='pressure';
   else mode='scale';
 }
 return{raw:t,l,s,m,d,counts,g:group,live,intent,mode,loss,pressure,time,life};
}
function clean(x){return x.replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim()}
function moneyPair(d){return{A:d.m[0]||'',B:d.m[d.m.length-1]||'',valid:d.m.length>=2&&d.m[0]!==d.m[d.m.length-1]}}
function semanticLock(text,d){
 const l=text.toLowerCase(),allowed=new Set(d.m.map(norm));
 const mm=text.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[];
 for(const x of mm)if(!allowed.has(norm(x)))return false;
 if(d.intent==='giveaway'&&!/hediye|verece|veriyorum|gönderece|kazanan|dağıt/.test(l))return false;
 if(d.intent!=='journey'&&/ile başladık|ile başladım|başlangıçta|bakiye|pnl/.test(l)&&!/başlad|başlangıç|bakiye|pnl/.test(d.l))return false;
 if(!d.g&&/grupta|grupça|ekiple/.test(l))return false;
 if(!d.live&&/canlı yayın/.test(l))return false;
 return true;
}
function splitFacts(d){
 const facts=d.s.map(clean).filter(Boolean),p=moneyPair(d);
 const start=facts.find(x=>p.A&&norm(x).includes(norm(p.A)))||facts[0]||'';
 const result=facts.find(x=>p.B&&norm(x).includes(norm(p.B)))||'';
 const neg=facts.filter(x=>/zarar|eksi|yanlış|geri verd|kaybet|-\s*\d/i.test(x));
 const tense=facts.filter(x=>/risk|karar|bekle|kork|uyuma|uyku|gece|sabah|pozisyon|bir işlem daha/i.test(x));
 return{facts,start,result,neg,tense};
}
function rawBuild(d,i){const s=d.s.map(clean).filter(Boolean);if(s.length<=1)return{text:clean(d.raw),arch:'raw',intent:d.intent};const orders=[s,[s[0],...s.slice(1)],[s[s.length-1],...s.slice(0,-1)]];return{text:orders[i%orders.length].join(i%2?'\n':'\n\n'),arch:['raw_blocks','tight_raw','reverse_raw'][i%3],intent:d.intent}}
function giveawayBuild(d,i){const amt=d.m[0]||'',cnt=d.counts[0]||'birkaç kişi',dur=d.d[0]||(/bir saat/.test(d.l)?'1 saat':'');const when=dur?dur+' sonra':'birazdan';const a=[`${cnt}ye ${amt} hediye edeceğim.\n\n${when} isimleri açıklıyorum.`,`${amt}.\n\n${cnt}.\n\n${when} açıklıyorum.`,`Bu kez ${amt} bende kalmıyor.\n\n${cnt}ye gidiyor.\n\n${when} açıklıyorum.`];return{text:a[i%a.length],arch:['giveaway_direct','giveaway_stack','giveaway_reverse'][i%3],intent:d.intent}}
function progressiveBuild(d,i){const f=splitFacts(d),p=moneyPair(d),money=d.m;const mids=money.slice(1,-1);const ladder=[p.A,...mids,p.B].filter(Boolean);const first=pick([`${f.start||p.A}`,`${p.A} ile başladık.`,`Başlangıç küçüktü: ${p.A}.`]);const ladderText=ladder.length>2?ladder.slice(1,-1).map(x=>`${x}.`).join('\n\n'):'';const tense=f.tense[0]||'';const second=pick([`Ama rakam büyüdükçe hikâye kolaylaşmadı.`,`Büyüyen sadece rakam değildi; kararların ağırlığı da arttı.`,`Bir yerden sonra mesele büyümek değil, doğru yerde durabilmekti.`]);const end=pick([`Ve sonunda:\n\n${p.B}`,`${p.B}.\n\nBaşlangıçta ${p.A} vardı.`,`Son ekranda ${p.B} yazıyordu.`]);let parts=[first,ladderText,tense,second,end].filter(Boolean);if(i%3===1)parts=[first,tense,ladderText,end,second].filter(Boolean);if(i%3===2)parts=[first,ladderText,end,second].filter(Boolean);return{text:parts.join('\n\n'),arch:['progressive_ladder','progressive_pressure','progressive_second_loop'][i%3],intent:d.intent}}
function contrastBuild(d,i){const f=splitFacts(d),p=moneyPair(d);const neg=f.neg.join('\n');const opener=pick([f.start||`${p.A} ile başladık.`,`${p.A} ile başladım.`,`${p.A} ile başlayan hafta beklediğim gibi gitmedi.`]);const result=f.result||`${p.B}.`;const turn=pick([`Ama tablo dışarıdan göründüğü kadar temiz değildi.`,`Sonuç büyük. Süreç o kadar kusursuz değildi.`,`Rakam güzel görünüyor; arka tarafı o kadar pürüzsüz değil.`]);const second=pick([`İşte beni asıl burada durduran şey bu.`,`Büyük rakamın yanında bu kısmı da unutmuyorum.`,`Sonuca bakınca güzel. Sürece bakınca bambaşka bir hikâye.`]);const parts=i%2===0?[opener,result,turn,neg,second]:[opener,turn,neg,result,second];return{text:parts.filter(Boolean).join('\n\n'),arch:i%2?'contrast_delayed_result':'contrast_early_result',intent:d.intent}}
function pressureBuild(d,i){const f=splitFacts(d),p=moneyPair(d);const pressure=f.tense.join('\n');const opener=pick([f.start||`${p.A} ile başladık.`,`Başlangıçta sadece ${p.A} vardı.`,`İlk rakam küçüktü: ${p.A}.`]);const bridge=pick([`Rakam büyüdükçe karar vermek kolaylaşmadı.`,`İşin zor kısmı büyümek değil, büyüdükçe aynı sakinliği korumaktı.`,`Küçük rakamla aldığın karar ile büyük rakamla aldığın karar aynı hissettirmiyor.`]);const result=f.result||`${p.B}.`;const close=pick([`Sonuç ekranda: ${p.B}.`,`Bugün ekranda ${p.B} var.`,`Bittiğinde ekranda ${p.B} yazıyordu.`]);const parts=i%2===0?[opener,pressure,bridge,close]:[opener,bridge,pressure,result];return{text:parts.filter(Boolean).join('\n\n'),arch:i%2?'pressure_reflection':'pressure_build',intent:d.intent}}
function scaleBuild(d,i){const f=splitFacts(d),p=moneyPair(d);const opener=pick([f.start||`${p.A} ile başladık.`,`İlk rakam ${p.A}.`,`Başlangıç: ${p.A}.`]);const result=f.result||`${p.B}.`;const shock=pick([`Ekranı açınca bir süre sadece rakama baktım.`,`Rakamı görünce ilk refleksim tekrar bakmak oldu.`,`Bazen sonuç geldiğinde ilk tepki sevinmek değil, birkaç saniye durmak oluyor.`]);const second=pick([`Ama benim için ilginç olan sadece sonuç değil; başlangıçla arasındaki mesafe.`,`Sonuç büyük. Benim aklım hâlâ başladığımız yerde.`,`Rakam tek başına güçlü. Ama onu anlamlı yapan nereden başladığın.`]);const parts=i%3===0?[shock,result,second,opener]:i%3===1?[opener,result,second]:[opener,shock,result,second];return{text:parts.join('\n\n'),arch:['scale_shock','scale_contrast','scale_pause'][i%3],intent:d.intent}}
function journeyBuild(d,i){if(d.mode==='progressive')return progressiveBuild(d,i);if(d.mode==='contrast')return contrastBuild(d,i);if(d.mode==='pressure')return pressureBuild(d,i);return scaleBuild(d,i)}
function build(d,i){if(d.intent==='giveaway')return giveawayBuild(d,i);if(d.intent==='journey')return journeyBuild(d,i);return rawBuild(d,i)}
function aiPenalty(t){let p=0;const bad=[/bu süreçte/i,/yolculuk/i,/serüven/i,/bir noktada/i,/şimdi dönüp bakınca/i,/hikâyenin bugün başka bir yere/i,/bazen hiçbir şey yapmamak/i,/sonuç ekranda\. benim aklım/i];for(const r of bad)if(r.test(t))p+=10;return clamp(p,0,50)}
function hookScore(t){const first=(t.split(/\n/).find(Boolean)||'').trim();let s=56;if(first.length<85)s+=12;if(first.length<55)s+=8;if(/\d|\$|₺|€|usdt/i.test(first))s+=8;if(/dün|bugün|gece|başlangıç|başlad|ekran|rakam/.test(first.toLowerCase()))s+=5;if(first.length>115)s-=16;return clamp(s,20,98)}
function rhythmScore(t){const ls=t.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!ls.length)return 20;let s=62;const short=ls.filter(x=>x.length<=28).length,long=ls.filter(x=>x.length>=70).length;if(short>=1)s+=10;if(short>=2)s+=6;if(long>=1&&short>=1)s+=8;if(ls.length>=4&&ls.length<=10)s+=8;if(ls.length>12)s-=12;return clamp(s,20,98)}
function secondLoop(t,d){if(d.intent!=='journey')return 72;const l=t.toLowerCase();let s=55;const lastMoney=d.m[d.m.length-1]||'';const pos=lastMoney?t.toLowerCase().lastIndexOf(lastMoney.toLowerCase()):-1;if(pos>=0&&pos<t.length*.8)s+=18;if(/ama|fakat|ilginç olan|benim aklım|asıl|arka taraf|süreç/.test(l.slice(Math.max(0,pos))))s+=16;if(/başlangıç|başlad|ilk rakam|nereden başlad/.test(l.slice(Math.max(0,pos))))s+=8;return clamp(s,20,98)}
function contrastScore(t,d){let s=58;const l=t.toLowerCase();if(/ama|fakat|değil|kusursuz|yanlış|zarar|eksi|risk/.test(l))s+=16;if(d.loss&&/zarar|eksi|yanlış|geri verd|kusursuz/.test(l))s+=12;if(d.pressure&&/karar|risk|büyüdükçe|sakin|dur/.test(l))s+=8;return clamp(s,20,98)}
function resultPlacement(t,d){if(d.intent!=='journey'||d.m.length<2)return 75;const B=d.m[d.m.length-1],pos=t.toLowerCase().indexOf(B.toLowerCase());if(pos<0)return 20;const r=pos/t.length;let s=70;if(r>.15&&r<.72)s+=16;if(r<.12||r>.88)s-=8;return clamp(s,20,98)}
function clarity(t,d){let s=94;if(!semanticLock(t,d))return 0;for(const x of d.m){if(d.intent==='journey'&&d.m.length>=2&&!t.toLowerCase().includes(x.toLowerCase())&&x===d.m[0])s-=8}return clamp(s,20,98)}
function voiceScore(t,d){const rw=new Set(words(d.raw)),tw=words(t);let c=0;for(const w of tw)if(rw.has(w))c++;let s=70+(tw.length?Math.round(c/tw.length*30):0);if(t.length>Math.max(520,d.raw.length*4))s-=12;return clamp(s,20,98)}
function novelty(t){const old=json('vanta_runs',[]).concat(json('vanta_hist',[]));let worst=0;for(const o of old)worst=Math.max(worst,sim(t,o.text||''));return clamp(Math.round(98-worst*68),20,98)}
function score(v,d){const fact=semanticLock(v.text,d)?98:0,hook=hookScore(v.text),rhythm=rhythmScore(v.text),loop=secondLoop(v.text,d),contrast=contrastScore(v.text,d),place=resultPlacement(v.text,d),voice=voiceScore(v.text,d),nov=novelty(v.text),ai=aiPenalty(v.text);let total=Math.round(fact*.19+hook*.14+rhythm*.13+loop*.15+contrast*.12+place*.08+voice*.11+nov*.08-ai*.28);if(!fact)total=0;return{fact,hook,rhythm,loop,contrast,place,voice,nov,ai,total:clamp(total,0,96)}}
function finalists(d){const all=[];for(let i=0;i<900;i++)all.push(build(d,i));all.push(rawBuild(d,0));for(const v of all)v.s=score(v,d);all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){if(v.s.fact<98||v.s.total<64)continue;let ok=true;for(const x of out)if(sim(v.text,x.text)>.58||v.arch===x.arch)ok=false;if(ok)out.push(v);if(out.length===3)break}if(!out.length){const r={text:clean(d.raw),arch:'fact_safe',intent:d.intent};r.s=score(r,d);out.push(r)}return out}
function saveRun(arr){let h=json('vanta_runs',[]);for(const v of arr)h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_runs',JSON.stringify(h.slice(0,320)))}
function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,120)))}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>alert('Kopyalandı.'));else{const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();alert('Kopyalandı.')}}
const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.hook+'</b><span>İlk satır</span></div><div class="metric"><b>'+v.s.rhythm+'</b><span>Ritim</span></div><div class="metric"><b>'+v.s.loop+'</b><span>2. merak</span></div><div class="metric"><b>'+v.s.contrast+'</b><span>Çelişki</span></div><div class="metric"><b>'+v.s.place+'</b><span>Sonuç yeri</span></div><div class="metric"><b>'+v.s.voice+'</b><span>Senin sesin</span></div><div class="metric"><b>'+v.s.fact+'</b><span>Anlam kilidi</span></div><div class="metric"><b>'+v.s.nov+'</b><span>Tekrar riski</span></div></div>';
$('run').onclick=function(){const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}ST.style.display='block';RES.innerHTML='';BAR.style.width='7%';SCAN.textContent='v1.7 olay tipini ve çalışan psikolojiyi seçiyor…';setTimeout(()=>{BAR.style.width='22%';SCAN.textContent='Winning DNA: küçük başlangıç / ölçek / baskı / çelişki ayrılıyor…'},120);setTimeout(()=>{BAR.style.width='39%';SCAN.textContent='Progressive Reveal: bilgi satır satır açılıyor…'},240);setTimeout(()=>{BAR.style.width='56%';SCAN.textContent='Second Curiosity Loop: sonuçtan sonra da okutuyor mu…'},360);setTimeout(()=>{BAR.style.width='72%';SCAN.textContent='Rhythm Engine: kısa vuruş + uzun anlatı dengeleniyor…'},480);setTimeout(()=>{BAR.style.width='86%';SCAN.textContent='Contrast Engine: başarı ile risk/hata aynı hikâyede tutuluyor…'},600);setTimeout(()=>{BAR.style.width='95%';SCAN.textContent='Semantic Fact Lock: yazmadığın olay eklenmiyor…'},720);setTimeout(()=>{const d=detect(t),arr=finalists(d);saveRun(arr);BAR.style.width='100%';SCAN.textContent='v1.7 · gerçek kazanan psikolojileri + anlam kilidi tamamlandı · 3 finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">EN GÜÇLÜ ADAY · '+w.arch+' · '+d.mode+' · winning DNA</div></div><div class="score">'+w.s.total+'<small>/96</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+v.arch+' · '+v.s.total+'/96</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'})},860)};
})();