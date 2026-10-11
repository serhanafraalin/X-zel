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

function detect(t){
 const l=t.toLowerCase();
 const m=t.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[];
 const d=t.match(/\b\d+\s*(?:dakika|dk|saat|gün|hafta|ay|yıl)\b/gi)||[];
 const counts=t.match(/\b\d+\s*(?:kişi|arkadaş|üye|katılımcı)\b/gi)||[];
 const group=/grup|ekip|beraber|birlikte/.test(l),live=/canlı|yayın/.test(l),question=/\?|sizce|ne düşünüyorsunuz|hangisi/.test(l);
 const giveaway=/hediye|dağıt|çekiliş|kazanan|kazandır|vereceğim|veriyorum|göndereceğim|paylaştır/.test(l);
 const announce=/açıklarım|açıklıyorum|duyur|bir saat sonra|yarın|bu akşam|birazdan/.test(l);
 const celebrate=/ev aldı|araba aldı|tapu|borcunu kapattı|çekim yaptı|parasını çekti|satın aldı/.test(l);
 const journey=/başlad|serüven|ulaşt|bakiye|işlem|kâr|kar|pnl|kazand/.test(l);
 const reaction=/inanamıyorum|şaka gibi|garip|sevindim|gurur|mutlu|şaşırdım|sinir/.test(l);
 let intent='general';
 if(giveaway)intent='giveaway'; else if(question)intent='question'; else if(celebrate)intent='celebrate_other'; else if(journey&&m.length>=2)intent='journey'; else if(group&&journey)intent='group_story'; else if(announce)intent='announcement'; else if(reaction)intent='reaction';
 return{raw:t,l,m,d,counts,s:sentences(t),g:group,live,intent,giveaway,announce,question};
}
const moneyPair=d=>({A:d.m[0]||'',B:d.m.length>1?d.m[d.m.length-1]:'',valid:d.m.length>1&&d.m[0]!==d.m[d.m.length-1]});
const firstDuration=d=>d.d[0]||'';
const firstCount=d=>d.counts[0]||'';
const norm=t=>t.toLowerCase().replace(/\s+/g,' ').trim();

function semanticLock(text,d){
 const l=text.toLowerCase();
 const originalMoney=new Set(d.m.map(norm));
 const outMoney=text.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[];
 for(const x of outMoney)if(!originalMoney.has(norm(x)))return false;
 if(d.intent==='giveaway'){
   if(!/hediye|dağıt|verece|veriyorum|gönderece|kazanan/.test(l))return false;
   if(/başlad|başlangıç|bakiye|işlem aç|pnl|kâr ett|kar ett/.test(l) && !/başlad|başlangıç|bakiye|işlem|pnl|kâr|kar/.test(d.l))return false;
 }
 if(d.intent==='announcement'&&!/açıkla|duyur|yarın|bu akşam|birazdan|saat sonra/.test(l))return false;
 if(d.intent!=='journey'&&d.intent!=='group_story'&&/başlangıçta|ile başladık|ile başladım|bakiye/.test(l)&&!/başlad|bakiye/.test(d.l))return false;
 if(!d.g&&/grupça|grupta|ekiple|ekipçe/.test(l))return false;
 if(!d.live&&/canlı yayın/.test(l))return false;
 return true;
}

function cleanClause(x){return x.replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim()}
function baseClauses(d){return d.s.map(cleanClause).filter(Boolean)}
function exactVariants(d){
 const raw=cleanClause(d.raw), ss=baseClauses(d), out=[];
 out.push({text:raw,arch:'raw_sharp',intent:d.intent});
 if(ss.length>1){out.push({text:ss.join('\n\n'),arch:'clean_blocks',intent:d.intent});out.push({text:[ss[0],...ss.slice(1)].join('\n'),arch:'tight_blocks',intent:d.intent})}
 return out;
}

function giveawayBuild(d,i){
 const amount=d.m[0]||'', count=firstCount(d)||(/5\s+arkadaş/.test(d.l)?'5 kişi':''), dur=firstDuration(d)||(/bir saat/.test(d.l)?'1 saat':''), c=count||'birkaç kişi';
 const when=dur?`${dur} sonra`:(d.announce?'birazdan':'sonra');
 const A=[
   `${c}ye ${amount} hediye edeceğim. ${when} isimleri açıklıyorum.`,
   `${amount}. ${c}. ${when} açıklıyorum.`,
   `${c} için ${amount} ayırdım. ${when} kimlere gittiğini açıklıyorum.`,
   `${c}ye toplam ${amount} gönderiyorum. ${when} kazananları açıklıyorum.`,
   `Bu kez ${amount} bende kalmıyor. ${c}ye gidiyor. ${when} açıklıyorum.`,
   `${when} burada ${c} açıklayacağım. Toplam ${amount} hediye ediyorum.`
 ];
 const B=[
   `${c}ye ${amount} hediye edeceğim.\n\n${when} açıklıyorum.`,
   `${amount} hediye ediyorum.\n\n${c}.\n\n${when} isimleri açıklıyorum.`,
   `Bugünün olayı kısa:\n\n${c}ye ${amount}.\n\n${when} açıklıyorum.`
 ];
 const text=(i%3===0?A:B)[i%(i%3===0?A.length:B.length)];
 return{text,arch:['direct_drop','number_stack','delayed_names','reverse_reward','minimal_shock','time_first'][i%6],intent:d.intent};
}

function journeyBuild(d,i){
 const p=moneyPair(d),dur=firstDuration(d), g=d.g?'grupta ':'', live=d.live?'canlı yayında ':'';
 const A=p.A,B=p.B;
 const lines=[
  `${A} ile başladık. ${dur?dur+' sonra ':''}${B}.`,
  `${dur?dur+' önce ':''}${A} vardı. Şimdi ${B}.`,
  `${A} → ${B}. ${dur||'Bu sürede'} olan şey sadece rakam değil, disiplin oldu.`,
  `${B} ekranda. Benim aklım hâlâ ilk ${A}da.`,
  `${g}${A} ile başladık. ${live?'Her şeyi '+live+'yaptık. ':''}Bugün ${B}.`
 ];
 let text=lines[i%lines.length];
 if(i%2===1&&dur)text+=`\n\n${dur}. Hepsi bu.`;
 return{text,arch:['result_first','time_first','arrow','reflection','group_fact'][i%5],intent:d.intent};
}

function celebrateBuild(d,i){
 const ss=baseClauses(d); const raw=cleanClause(d.raw);
 const starts=['Bazen kendi kazancından çok başkasının haberine seviniyorsun.','Bugün gelen bir mesaj bütün günümü değiştirdi.','En güzel sonuç bazen ekrandaki rakam olmuyor.','Bugün gruptan gelen haber buydu.'];
 let text=i%2===0?`${starts[i%starts.length]}\n\n${raw}`:raw;
 return{text,arch:['emotion_first','message_first','meaning_first','raw_result'][i%4],intent:d.intent};
}

function questionBuild(d,i){const raw=cleanClause(d.raw);const ss=baseClauses(d);const hooks=['Bunu gerçekten merak ediyorum:','Tek soru:','Şunu net sorayım:','Siz olsanız ne yapardınız?'];let text=raw;if(i%2===0&&!/^sizce|^ne düşün/.test(d.l))text=`${hooks[i%hooks.length]}\n\n${raw}`;return{text,arch:['direct_question','single_question','sharp_question','audience_question'][i%4],intent:d.intent}}
function announcementBuild(d,i){const raw=cleanClause(d.raw);const ss=baseClauses(d);const hooks=['Kısa duyuru:','Bunu burada bırakıyorum:','Birazdan detayını açıklayacağım:','Not edin:'];let text=i%2===0?`${hooks[i%hooks.length]}\n\n${raw}`:raw;return{text,arch:['short_notice','raw_notice','delay_notice','note_notice'][i%4],intent:d.intent}}
function reactionBuild(d,i){const raw=cleanClause(d.raw);const hooks=['Şaka gibi ama gerçek:','Buna hâlâ alışamadım.','Bugün gördüğüm şey buydu:','Tek cümleyle:'];let text=i%2===0?`${hooks[i%hooks.length]}\n\n${raw}`:raw;return{text,arch:['shock','feeling','scene','one_line'][i%4],intent:d.intent}}
function generalBuild(d,i){const ss=baseClauses(d),raw=cleanClause(d.raw);if(ss.length<=1)return{text:raw,arch:'raw_general',intent:d.intent};const modes=[ss, [ss[0],...ss.slice(1)], [ss[ss.length-1],...ss.slice(0,-1)], ss.slice(0,2)];const x=modes[i%modes.length];return{text:x.join(i%2?'\n':'\n\n'),arch:['natural','tight','reverse','compressed'][i%4],intent:d.intent}}
function build(d,i){if(d.intent==='giveaway')return giveawayBuild(d,i);if(d.intent==='journey'||d.intent==='group_story')return journeyBuild(d,i);if(d.intent==='celebrate_other')return celebrateBuild(d,i);if(d.intent==='question')return questionBuild(d,i);if(d.intent==='announcement')return announcementBuild(d,i);if(d.intent==='reaction')return reactionBuild(d,i);return generalBuild(d,i)}

function aiPenalty(t){let p=0;const bad=[/hikâyenin bugün başka bir yere geldiğini/i,/bir yerde daha fazlasını kovalamak/i,/benim aklım hâlâ o karar anında/i,/bu süreçte/i,/asıl mesele/i,/yolculuk/i,/serüven/i,/bir noktada/i,/şimdi dönüp bakınca/i,/sonuç ekranda/i,/bazen hiçbir şey yapmamak/i,/önce elimizdekine baktık/i];for(const r of bad)if(r.test(t))p+=12;return clamp(p,0,60)}
function hookScore(t,d){const first=(t.split(/\n/).find(Boolean)||'').trim();let s=58;if(first.length<=72)s+=12;if(first.length<=48)s+=8;if(/\d|\$|₺|€/.test(first))s+=8;if(/[?:!]$/.test(first))s+=4;if(/bugün|şimdi|1 saat|saat sonra|kişiye|hediye|başlad|ekranda/.test(first.toLowerCase()))s+=6;if(first.length>110)s-=18;return clamp(s,20,98)}
function readability(t){const ss=sentences(t);let s=92;const avg=ss.reduce((a,x)=>a+x.length,0)/Math.max(1,ss.length);if(avg>95)s-=18;if(avg>125)s-=14;if(t.length>520)s-=14;if(t.length<55)s-=5;return clamp(s,20,98)}
function curiosity(t,d){let s=58;const l=t.toLowerCase();if(/sonra|açıkl|kim|neden|ama|şimdi|bugün/.test(l))s+=12;if(t.includes('\n\n'))s+=6;if(d.intent==='giveaway'&&/saat sonra|sonra.*açıkl/.test(l))s+=12;if(/her şeyi anlatayım|uzun lafın kısası/.test(l))s-=10;return clamp(s,20,98)}
function punch(t){let s=70;const lines=t.split(/\n+/).filter(Boolean);if(lines.some(x=>x.length<35))s+=8;if(lines.length<=4)s+=6;if(/[→:]/.test(t))s+=4;if(t.length<260)s+=6;if(t.length>500)s-=14;return clamp(s,20,98)}
function clarity(t,d){let s=90;if(d.m.length&&!(d.m.some(x=>t.toLowerCase().includes(x.toLowerCase()))))s-=22;if(d.intent==='giveaway'&&!/hediye|dağıt|verece|veriyorum|gönderece|kazanan/.test(t.toLowerCase()))s-=30;if(d.intent==='question'&&!/\?/.test(t))s-=15;return clamp(s,20,98)}
function voiceScore(t,d){let s=84;const rawWords=new Set(words(d.raw)),tw=words(t);let common=0;for(const w of tw)if(rawWords.has(w))common++;const ratio=tw.length?common/tw.length:0;if(ratio>.55)s+=8;if(ratio<.28)s-=16;if(/vallahi|kanka|çok şükür/.test(d.l)&&!/vallahi|kanka|çok şükür/.test(t.toLowerCase()))s-=6;return clamp(s,20,98)}
function noveltyScore(t){const old=json('vanta_runs',[]).concat(json('vanta_hist',[]));let worst=0;for(const o of old)worst=Math.max(worst,sim(t,o.text||''));return clamp(Math.round(98-worst*70),20,98)}
function frictionScore(t){let s=92;if((t.match(/\n\n/g)||[]).length>5)s-=12;if((t.match(/,/g)||[]).length>8)s-=8;if(/not:|bazı anlatı detayları/.test(t.toLowerCase()))s-=30;if(t.split(/\s+/).length>90)s-=12;return clamp(s,20,98)}
function score(v,d){const fact=semanticLock(v.text,d)?98:0,hook=hookScore(v.text,d),read=readability(v.text),cur=curiosity(v.text,d),pn=punch(v.text),clear=clarity(v.text,d),voice=voiceScore(v.text,d),novel=noveltyScore(v.text),fric=frictionScore(v.text),ai=aiPenalty(v.text);let total=Math.round(fact*.20+hook*.14+read*.10+cur*.10+pn*.10+clear*.12+voice*.10+novel*.08+fric*.06-ai*.35);if(!fact)total=0;return{fact,hook,read,cur,punch:pn,clear,voice,novel,fric,ai,total:clamp(total,0,96)}}
function finalists(d){const all=[...exactVariants(d)];for(let i=0;i<1200;i++)all.push(build(d,i));for(const v of all)v.s=score(v,d);all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){if(v.s.fact<98||v.s.clear<78||v.s.voice<62||v.s.total<68)continue;let ok=true;for(const x of out)if(sim(v.text,x.text)>.52||v.arch===x.arch)ok=false;if(ok)out.push(v);if(out.length===3)break}if(!out.length){const raw={text:cleanClause(d.raw),arch:'fact_safe',intent:d.intent};raw.s=score(raw,d);out.push(raw)}return out}
function saveRun(arr){let h=json('vanta_runs',[]);for(const v of arr)h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_runs',JSON.stringify(h.slice(0,320)))}
function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,arch:v.arch,intent:v.intent,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,120)))}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>alert('Kopyalandı.'));else{const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();alert('Kopyalandı.')}}
const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.hook+'</b><span>İlk satır</span></div><div class="metric"><b>'+v.s.read+'</b><span>Okutma</span></div><div class="metric"><b>'+v.s.cur+'</b><span>Merak</span></div><div class="metric"><b>'+v.s.punch+'</b><span>Vuruş</span></div><div class="metric"><b>'+v.s.clear+'</b><span>Netlik</span></div><div class="metric"><b>'+v.s.fact+'</b><span>Anlam kilidi</span></div><div class="metric"><b>'+v.s.voice+'</b><span>Senin sesin</span></div><div class="metric"><b>'+v.s.novel+'</b><span>Tekrar riski</span></div></div>';
$('run').onclick=function(){const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}ST.style.display='block';RES.innerHTML='';BAR.style.width='6%';SCAN.textContent='v1.6 niyeti çözüyor: ne söyledin, ne söylemedin…';setTimeout(()=>{BAR.style.width='20%';SCAN.textContent='Semantic Fact Lock: rakamın anlamı da kilitleniyor…'},130);setTimeout(()=>{BAR.style.width='36%';SCAN.textContent='Hook Stress Test: ilk satır 2 saniyede durduruyor mu…'},260);setTimeout(()=>{BAR.style.width='52%';SCAN.textContent='Scroll Friction: gereksiz cümleler ve AI kokusu eleniyor…'},390);setTimeout(()=>{BAR.style.width='68%';SCAN.textContent='Curiosity Gap: merak var mı, kandırmadan açık bırakıyor mu…'},520);setTimeout(()=>{BAR.style.width='82%';SCAN.textContent='Pattern Break: önceki tweetlere benzeyen yapılar aşağı itiliyor…'},650);setTimeout(()=>{BAR.style.width='93%';SCAN.textContent='Voice Match: senin yazdığın olay bozulmadan sıkıştırılıyor…'},780);setTimeout(()=>{const d=detect(t),arr=finalists(d);saveRun(arr);BAR.style.width='100%';SCAN.textContent='v1.6 · anlam kilidi + sert keşfet filtresi tamamlandı · 3 finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">EN GÜÇLÜ ADAY · '+w.arch+' · '+d.intent+' · anlam korundu</div></div><div class="score">'+w.s.total+'<small>/96</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+v.arch+' · '+v.s.total+'/96</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'})},920)};
})();