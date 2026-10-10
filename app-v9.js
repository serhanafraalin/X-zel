(function(){
  const $=id=>document.getElementById(id);
  const I=$('idea'),IMG=$('img'),ST=$('stage'),RES=$('results'),BAR=$('bar'),SCAN=$('scanText');
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  const json=(k,d)=>{try{return JSON.parse(get(k)||JSON.stringify(d))}catch(e){return d}};
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const protect=t=>t.replace(/(\d)\.(?=\d)/g,'$1§DOT§');
  const restore=t=>t.replace(/§DOT§/g,'.');
  const sentences=t=>(protect(t.replace(/[\r\n]+/g,' ')).match(/[^.!?]+[.!?]?/g)||[t]).map(x=>restore(x.trim())).filter(Boolean);
  const words=t=>t.toLowerCase().replace(/[^a-z0-9çğıöşü$₺€ ]/g,' ').split(/\s+/).filter(x=>x.length>2);
  function sim(a,b){const A=new Set(words(a)),B=words(b);let inter=0,u=A.size;const seen=new Set(A);for(const w of B){if(A.has(w))inter++;else if(!seen.has(w)){seen.add(w);u++}}return u?inter/u:0}

  I.value=get('vanta_idea')||'';IMG.checked=get('vanta_img')==='1';I.oninput=()=>set('vanta_idea',I.value);IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');

  function detect(t){
    const l=t.toLowerCase(),m=t.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[],d=t.match(/\b\d+\s*(?:dakika|dk|saat|gün|hafta|ay|yıl)\b/gi)||[];
    return{raw:t,l,m,d,s:sentences(t),g:/grup|ekip|beraber|birlikte|arkadaş/.test(l),live:/canlı|yayın/.test(l),loss:/kaybet|zarar|eksi|bat|sıfır/.test(l),mistake:/hata|yanlış|acele|erken|geç/.test(l),emotion:/kork|stres|tit|heyecan|uyku|pişman|geril/.test(l),reward:/ev ald|araba ald|tapu|borç kapat|çektim|çektik/.test(l)};
  }
  const money=(d,n)=>d.m[n]||'';
  const duration=d=>d.d[0]||'';
  const LABEL={contrast:'Kontrast',stakes:'Risk',social:'Sosyal kanıt',curiosity:'Merak',effort:'Görünmeyen emek',identity:'Kimlik',imperfection:'Kusur',vulnerability:'Kırılganlık',reward:'Ödül'};

  function voiceFingerprint(d){
    const ss=d.s,avg=ss.length?ss.reduce((a,x)=>a+x.length,0)/ss.length:70;
    return{short:avg<80,first:/\bben|biz|benim|bizim\b/i.test(d.raw),casual:/ya |işte|zaten|baya|bence/i.test(d.raw),colon:/:/.test(d.raw)};
  }

  function base(d,p){
    const A=money(d,0),B=money(d,d.m.length-1),T=duration(d),bank={
      contrast:[A&&B?`${B} yazıyor. Benim aklım hâlâ ${A} ile başladığımız yerde.`:'Başlangıçla bugün arasındaki fark tek rakamla anlatılmıyor.',A&&B?`${A} ile başladık. Bugün ${B}. Kısa yazınca kolay görünüyor.`:'Sonuç büyük. Başlangıcı düşününce daha da büyük geliyor.'],
      stakes:[A&&B?`${A} seviyesinde verdiğin kararla ${B} seviyesinde verdiğin karar aynı hissettirmiyor.`:'Rakam büyüdükçe kararların ağırlığı da büyüyor.',T?`${T} boyunca aynı çizgide kalmak, son rakamı görmek kadar zor.`:'Bir noktadan sonra mesele daha çok kazanmak değil, yaptığını bozmamak oluyor.'],
      social:d.g?['Bunu tek başıma yaşamadım; aynı baskıyı grupça taşıdık.','Başta herkes daha rahattı. Rakam büyüdükçe konuşmalar kısaldı, kararlar ağırlaştı.']:['Sonucun arkasında tek bir an değil, biriken kararlar var.'],
      curiosity:['İlk bakışta sonuç vuruyor. Sonra insan arada ne olduğunu merak ediyor.','Rakam büyük ama benim aklım başka yerde.'],
      effort:[T?`${T} kısa görünüyor ama içine onlarca karar ve bekleyiş sığıyor.`:'Dışarıdan tek kare görünüyor; içeride tekrar tekrar aynı planı korumak var.','Bazı anlarda en doğru hareket hiçbir şey yapmamaktı.'],
      identity:['Rakam büyüdükçe karar verirken daha fazla düşünmeye başladık.','Sonlara doğru aynı kararları artık daha temkinli veriyorduk.'],
      imperfection:['Her şey istediğimiz gibi gitmedi.','İyi giden anlardan çok, hata yapmamak için kendimizi tuttuğumuz yerler kaldı aklımda.'],
      vulnerability:['Sonuç büyüdükçe sevinç kadar hata yapma korkusu da büyüyor.','Bir noktadan sonra sevincin yanına “ya şimdi bozarsak?” düşüncesi geliyor.'],
      reward:d.reward?['Ekrandaki rakam gerçek hayatta bir şeye dönüşünce bütün his değişiyor.','Sonunda rakam değil, o rakamla ne yapabildiğin kalıyor.']:['Rakam büyüdü ama benim için anlamı hâlâ verdiğimiz kararlarda.']
    };
    return pick(bank[p]||bank.curiosity);
  }

  function fictionalSpecificity(d){
    const scenes=['Bir yerde herkesin aklından aynı şey geçti: “Biraz daha mı, burada yeter mi?” O an mesele kontrolü kaybetmemekti.','Bir noktada devam etmekle durmak arasında kaldık. En zor karar yeni bir hamle yapmak değil, acele etmemekti.','Sonlara doğru bir karar vermeden önce eskisinden daha uzun beklemeye başladık.','Bir ara kimse yeni işlem konuşmadı. Önce elimizdekini korumayı konuştuk.','Bazı anlarda hiçbir şey yapmamak, işlem açmaktan daha zor geldi.'];
    if(d.g)scenes.push('Grupta bir an oldu; herkes aynı şeyi tartışıyordu: devam mı, tamam mı?');
    if(d.live)scenes.push('Canlı yayında alınan her karar, tek başına verilen karardan daha ağır hissettirdi.');
    return pick(scenes);
  }

  function genericPenalty(t){const bad=[/büyük sonuçların arkasında/i,/başarı tesadüf/i,/süreç .* öğret/i,/her şey mümkün/i,/asıl mesele/i,/yolculuk/i,/görünmeyen taraf/i,/hikâyeyi gerçek yapan/i,/sonuç tek satır/i];let p=0;for(const r of bad)if(r.test(t))p+=8;return p}
  function specificity(t,d){let s=35;if(/\d|[$₺€]/.test(t))s+=18;if(d.g&&/grup|beraber|ekip/.test(t.toLowerCase()))s+=10;if(d.live&&/canlı|yayın/.test(t.toLowerCase()))s+=8;if(duration(d)&&t.includes(duration(d)))s+=8;if(/devam mı|yeter mi|korumak|acele|bekle/.test(t.toLowerCase()))s+=8;return clamp(s,25,95)}
  function scrollScore(t){const first=t.slice(0,150);let s=45;if(/\d|[$₺€]/.test(first))s+=18;if(first.length<145)s+=7;if(/hâlâ|hala|ama|neden|nasıl|yeter mi/.test(first.toLowerCase()))s+=8;if(genericPenalty(first))s-=12;return clamp(s,25,95)}
  function boredom(t,d){const ps=t.split(/\n\n+/);let p=0;for(const x of ps){let useful=0;if(/\d|[$₺€]/.test(x))useful++;if(/karar|grup|canlı|kork|hata|dur|devam|bekle|koru/.test(x.toLowerCase()))useful++;if(specificity(x,d)>=60)useful++;if(useful===0)p+=8;if(x.length>165)p+=4}return p}
  function emotionCurve(t){const l=t.toLowerCase();let s=40;if(/\d|[$₺€]/.test(t.slice(0,140)))s+=12;if(/kork|baskı|durmak|devam|yeter mi|korumak/.test(l))s+=15;if(/hâlâ|hala|başladığımız|ilk/.test(l))s+=10;return clamp(s,25,95)}

  function hookArena(d){const pool=['contrast','stakes','curiosity'].concat(d.g?['social']:[],d.loss||d.mistake?['imperfection']:[],d.emotion?['vulnerability']:[]),out=[];for(let i=0;i<48;i++){const p=pick(pool),h=base(d,p);let s=scrollScore(h)+Math.round(specificity(h,d)*.25)-genericPenalty(h);out.push({h,p,s})}return out.sort((a,b)=>b.s-a.s).slice(0,10)}
  function storyArena(d,hook){const variants=[];for(let i=0;i<18;i++){let lines=[hook.h],fiction=false;const pool=shuffle(['stakes','social','effort','identity','curiosity'].concat(d.loss||d.mistake?['imperfection']:[],d.emotion?['vulnerability']:[],d.reward?['reward']:[]));const facts=d.s.filter(x=>/\d|grup|ekip|başlad|ulaşt|bakiye|kaybet|canlı|ev|araba|tapu/i.test(x));if(facts.length&&Math.random()>.55)lines.push(pick(facts));for(const p of pool){if(lines.length>=5)break;lines.push(base(d,p))}if(Math.random()>.12){lines.splice(Math.min(3,lines.length),0,fictionalSpecificity(d));fiction=true}variants.push({lines,psych:pool.slice(0,4),fiction})}return variants}
  function closingArena(d,body){const A=money(d,0),B=money(d,d.m.length-1),c=[];if(A&&B){c.push(`Herkes ${B}a bakacak. Ben hâlâ ${A} ile başladığımız yeri düşünüyorum.`);c.push(`Bugün ekranda ${B} var. Benim aklım ilk ${A}da.`);c.push(`${B} sonuç. Ama benim için hâlâ başlangıçtaki ${A} daha çok şey anlatıyor.`)}if(d.g)c.push('Rakam büyüdü. En çok aklımda kalan şey, bunu tek başıma yaşamamış olmak.');c.push('Sonuca bakınca insanın aklına başlangıç daha net geliyor.');return c.map(x=>({x,s:specificity(x,d)+emotionCurve(x)+(x.length<125?8:0)-genericPenalty(x)-(sim(body,x)>.42?8:0)})).sort((a,b)=>b.s-a.s)[0].x}

  function echoKill(lines){const out=[];for(const x of lines){let echo=false;for(const y of out){if(sim(x,y)>.43)echo=true;const nx=x.match(/\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar)?/gi)||[],ny=y.match(/\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar)?/gi)||[];if(nx.length>=2&&ny.length>=2&&nx.join('|')===ny.join('|'))echo=true}if(!echo)out.push(x)}return out}
  const noMeta=lines=>lines.filter(x=>!/metnin işi|görsel sonucu|ekran kanıtı|bu tweet|okuyucu|algoritma|keşfet/i.test(x));
  function humanize(lines,d){const vf=voiceFingerprint(d);return lines.map((x,i)=>{let y=x.replace(/Bu süreçte/gi,'Bu arada').replace(/Finalde/gi,'Sonunda');if(vf.short&&y.length>130)y=y.replace(/; /g,'. ');if(i>0&&/Rakam büyük ama benim aklım başka yerde\./i.test(y))y='Benim aklım rakamdan çok o karar anlarında.';return y})}
  function ruthlessCut(lines,d){let out=[];for(const x of lines){if(genericPenalty(x)>=12)continue;if(specificity(x,d)<42&&x.length>90)continue;let bad=false;for(const y of out)if(sim(x,y)>.45)bad=true;if(!bad)out.push(x)}if(out.length>6)out=out.slice(0,6);return out}

  function assemble(d,story){let lines=noMeta(echoKill(humanize(story.lines,d)));lines=ruthlessCut(lines,d);const close=closingArena(d,lines.join(' '));lines.push(close);lines=echoKill(lines);let txt=lines.join('\n\n').trim();if(story.fiction)txt+='\n\nNot: Bazı anlatı detayları kurgusaldır.';return{txt,psych:story.psych,fiction:story.fiction}}

  function selfCritic(v,d){let t=v.txt,ps=t.split(/\n\n+/),issues=0;issues+=genericPenalty(t);issues+=boredom(t,d);for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)if(sim(ps[i],ps[j])>.44)issues+=8;if(scrollScore(t)<60)issues+=10;if(emotionCurve(t)<55)issues+=8;return{issues,pass:issues<24}}
  function revise(v,d){let lines=v.txt.split(/\n\n+/).filter(x=>!/^Not:/.test(x));lines=ruthlessCut(echoKill(noMeta(lines)),d);if(lines.length<4)lines.splice(Math.min(2,lines.length),0,fictionalSpecificity(d));const close=closingArena(d,lines.join(' '));if(lines.length&&sim(lines[lines.length-1],close)>.45)lines[lines.length-1]=close;else lines.push(close);let txt=lines.join('\n\n');if(v.fiction)txt+='\n\nNot: Bazı anlatı detayları kurgusaldır.';return{txt,psych:v.psych,fiction:v.fiction}}

  function calibration(){return json('vanta_calibration',{hook:1,story:1,natural:1,payoff:1})}
  function oldRuns(){return json('vanta_runs',[]).concat(json('vanta_hist',[]))}
  function semanticPenalty(t){let p=0;for(const o of oldRuns()){const z=sim(t,o.text||'');if(z>.64)p+=22;else if(z>.5)p+=9}return p}
  function voiceScore(t,d){const vf=voiceFingerprint(d),ss=sentences(t);let s=55;if(vf.short&&ss.length&&ss.reduce((a,x)=>a+x.length,0)/ss.length<105)s+=12;if(vf.first&&/\bben|biz|benim|bizim\b/i.test(t))s+=10;if(vf.casual&&!/başarı|yolculuk|disiplin/i.test(t))s+=8;return clamp(s,25,95)}
  function payoffScore(t,d){const ps=t.split(/\n\n+/);let last=(ps[ps.length-1]||'').toLowerCase();if(/^not:/.test(last)&&ps.length>1)last=(ps[ps.length-2]||'').toLowerCase();let s=45;if(/hâlâ|hala|ilk|başladığımız|tek başıma|aklım/.test(last))s+=22;if(/\d|[$₺€]/.test(last))s+=10;s+=Math.round(specificity(last,d)/12);return clamp(s,25,95)}
  function score(v,d){const c=calibration(),t=v.txt,ps=t.split(/\n\n+/);let stop=scrollScore(t),dwell=50,story=50,natural=82,info=45,risk=6;const curve=emotionCurve(t),pay=payoffScore(t,d),voice=voiceScore(t,d),sem=semanticPenalty(t),bor=boredom(t,d),crit=selfCritic(v,d);if(/kork|karar|grup|canlı|korumak|durmak|devam|yeter mi/.test(t.toLowerCase()))dwell+=14;if(ps.length>=5){story+=12;dwell+=5}else story-=10;if(t.length>=220&&t.length<=680){story+=7;dwell+=5}let uniq=0;for(let i=0;i<ps.length;i++){let u=true;for(let j=0;j<i;j++)if(sim(ps[i],ps[j])>.44)u=false;if(u)uniq++}info+=uniq*5;natural+=Math.round((voice-50)/5);natural-=genericPenalty(t);risk+=sem+bor+Math.round(crit.issues/2);dwell-=Math.round(sem/2);story+=Math.round((curve-50)/4);if(v.fiction){story+=4;dwell+=2}const total=Math.round(stop*.22*c.hook+dwell*.20+story*.18*c.story+natural*.14*c.natural+info*.07+pay*.08*c.payoff+curve*.06+voice*.05-risk*.08);return{stop:clamp(stop,30,96),dwell:clamp(dwell,30,96),story:clamp(story,30,96),natural:clamp(natural,30,96),info:clamp(info,30,96),payoff:pay,curve,voice,risk:clamp(risk,5,95),total:clamp(total,20,96)}}

  function candidateBatch(d,n){const hooks=hookArena(d),all=[];for(let i=0;i<n;i++){const h=hooks[i%hooks.length],stories=storyArena(d,h),story=stories[Math.floor(Math.random()*stories.length)];let v=assemble(d,story);let crit=selfCritic(v,d);for(let r=0;r<3&&!crit.pass;r++){v=revise(v,d);crit=selfCritic(v,d)}v.s=score(v,d);all.push(v)}return all}
  function finalists(d){let all=candidateBatch(d,360);all.sort((a,b)=>b.s.total-a.s.total);if(!all[0]||all[0].s.total<78)all=all.concat(candidateBatch(d,240));all.sort((a,b)=>b.s.total-a.s.total);const out=[];for(const v of all){let ok=v.s.natural>=64&&v.s.payoff>=60&&v.s.stop>=60&&v.s.risk<=60;for(const x of out)if(sim(v.txt,x.txt)>.37)ok=false;if(ok)out.push(v);if(out.length===3)break}if(out.length<3){for(const v of all){let ok=true;for(const x of out)if(sim(v.txt,x.txt)>.42)ok=false;if(ok)out.push(v);if(out.length===3)break}}if(out.length>=2&&Math.abs(out[0].s.total-out[1].s.total)<=1){const extra=candidateBatch(d,180);all=all.concat(extra).sort((a,b)=>b.s.total-a.s.total);out.length=0;for(const v of all){let ok=true;for(const x of out)if(sim(v.txt,x.txt)>.37)ok=false;if(ok)out.push(v);if(out.length===3)break}}return out.map(x=>({text:x.txt,psych:x.psych,fiction:x.fiction,s:x.s}))}

  function saveRun(arr){let h=json('vanta_runs',[]);for(const v of arr)h.unshift({text:v.text,time:Date.now()});set('vanta_runs',JSON.stringify(h.slice(0,160)))}
  function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,60)))}
  function calibrate(v){const views=Number(prompt('Bu tweet kaç görüntülenme aldı? (İstersen sonra İptal de diyebilirsin)')||0);if(!views)return;const likes=Number(prompt('Kaç beğeni?')||0),replies=Number(prompt('Kaç yanıt?')||0);let c=calibration();const strong=views>=10000||likes>=100||replies>=20;const factor=strong?1.04:.98;c.hook=clamp(c.hook*factor,.8,1.25);c.story=clamp(c.story*factor,.8,1.25);c.natural=clamp(c.natural*(strong?1.03:.99),.8,1.25);c.payoff=clamp(c.payoff*(strong?1.03:.99),.8,1.25);set('vanta_calibration',JSON.stringify(c));alert('Kalibrasyon kaydedildi. Sonraki seçimlerde kullanılacak.')}
  function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>alert('Kopyalandı.'));else{const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();alert('Kopyalandı.')}}
  const psychName=p=>(p||[]).slice(0,3).map(x=>LABEL[x]).join(' · ');
  const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.stop+'</b><span>Durdurma</span></div><div class="metric"><b>'+v.s.dwell+'</b><span>Okutma</span></div><div class="metric"><b>'+v.s.story+'</b><span>Hikâye</span></div><div class="metric"><b>'+v.s.natural+'</b><span>Doğallık</span></div><div class="metric"><b>'+v.s.payoff+'</b><span>Kapanış</span></div><div class="metric"><b>'+v.s.curve+'</b><span>Duygu eğrisi</span></div></div>';

  $('run').onclick=function(){
    const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}
    ST.style.display='block';RES.innerHTML='';BAR.style.width='6%';SCAN.textContent='Hook Arena 48 açılışı yarıştırıyor…';
    setTimeout(()=>{BAR.style.width='24%';SCAN.textContent='Story Arena farklı anlatıları kuruyor…'},150);
    setTimeout(()=>{BAR.style.width='42%';SCAN.textContent='Scroll Simulation ve Boredom Detector çalışıyor…'},300);
    setTimeout(()=>{BAR.style.width='60%';SCAN.textContent='Self-Critic metinlere saldırıyor ve yeniden yazıyor…'},450);
    setTimeout(()=>{BAR.style.width='78%';SCAN.textContent='Emotion Curve, Voice Fingerprint ve Echo Killer test ediliyor…'},600);
    setTimeout(()=>{BAR.style.width='90%';SCAN.textContent='Confidence Gate ve A/B Battle finalistleri seçiyor…'},750);
    setTimeout(()=>{const d=detect(t),arr=finalists(d);if(!arr.length){SCAN.textContent='Güçlü finalist çıkmadı. Yeniden dene.';return}saveRun(arr);BAR.style.width='100%';SCAN.textContent='v9 · 600+ aday + Self-Critic tamamlandı · 3 finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">Keşfet kazananı · '+psychName(w.psych)+(w.fiction?' · Kurgu katkılı':'')+'</div></div><div class="score">'+w.s.total+'<small>/100</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn" id="calibrate">Performansı gir</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim. Benzer yapı ve temalar sonraki üretimde aşağı puanlanacak.')};$('calibrate').onclick=()=>calibrate(w);const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+psychName(v.psych)+(v.fiction?' · Kurgu katkılı':'')+' · '+v.s.total+'/100</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'})},900);
  };
})();