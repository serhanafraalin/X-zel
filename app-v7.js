(function(){
  const $=id=>document.getElementById(id);
  const I=$('idea'), IMG=$('img'), ST=$('stage'), RES=$('results'), BAR=$('bar'), SCAN=$('scanText');
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
  I.value=get('vanta_idea')||''; IMG.checked=get('vanta_img')==='1';
  I.oninput=()=>set('vanta_idea',I.value); IMG.onchange=()=>set('vanta_img',IMG.checked?'1':'0');

  function detect(t){
    const l=t.toLowerCase(), m=t.match(/(?:\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar))|(?:(?:\$|₺|€)\s*\d[\d.,]*)/gi)||[], d=t.match(/\b\d+\s*(?:dakika|dk|saat|gün|hafta|ay|yıl)\b/gi)||[];
    return {raw:t,l,m,d,s:sentences(t),g:/grup|ekip|beraber|birlikte|arkadaş/.test(l),live:/canlı|yayın/.test(l),loss:/kaybet|zarar|eksi|bat|sıfır/.test(l),mistake:/hata|yanlış|acele|erken|geç/.test(l),emotion:/kork|stres|tit|heyecan|uyku|pişman|geril/.test(l)};
  }
  const money=(d,n)=>d.m[n]||'';
  const duration=d=>d.d[0]||'';
  const LABEL={contrast:'Kontrast',stakes:'Risk',social:'Sosyal kanıt',curiosity:'Merak',effort:'Görünmeyen emek',identity:'Kimlik',imperfection:'Kusur',vulnerability:'Kırılganlık'};

  function base(d,p){
    const A=money(d,0), B=money(d,d.m.length-1), T=duration(d);
    const bank={
      contrast:[A&&B?`${B} yazıyor. Benim aklım hâlâ ${A} ile başladığımız yerde.`:'Başlangıçla bugün arasındaki fark tek rakamla anlatılmıyor.',A&&B?`${A} ile başladık. Bugün ${B}. Kısa yazınca kolay görünüyor.`:'Sonuç büyük. Başlangıcı düşününce daha da büyük geliyor.'],
      stakes:[A&&B?`${A} seviyesinde verdiğin kararla ${B} seviyesinde verdiğin karar aynı hissettirmiyor.`:'Rakam büyüdükçe kararların ağırlığı da büyüyor.',T?`${T} boyunca aynı çizgide kalmak, son rakamı görmek kadar zor.`:'Bir noktadan sonra mesele daha çok kazanmak değil, yaptığını bozmamak oluyor.'],
      social:d.g?['Bunu tek başıma yaşamadım; aynı baskıyı grupça taşıdık.','Bir noktadan sonra rakam kadar gruptaki psikoloji de değişiyor.']:['Sonucun arkasında tek bir an değil, biriken kararlar var.'],
      curiosity:['İlk bakışta sonuç vuruyor. İkinci bakışta insan “orada ne oldu?” diye düşünüyor.','Rakam büyük ama benim aklım başka yerde.'],
      effort:[T?`${T} kısa görünüyor ama içine onlarca karar ve bekleyiş sığıyor.`:'Dışarıdan tek kare görünüyor; içeride tekrar tekrar aynı planı korumak var.','Büyük sonuçların arkasında gösterişli anlardan çok, tekrar eden doğru kararlar var.'],
      identity:['Rakam büyüdükçe karar verirken daha fazla düşünmeye başladık.','Sonlara doğru aynı kararları artık daha temkinli veriyorduk.'],
      imperfection:['Her şey istediğimiz gibi gitmedi.','İyi giden anlardan çok, hata yapmamak için kendimizi tuttuğumuz yerler kaldı aklımda.'],
      vulnerability:['Sonuç büyüdükçe sevinç kadar hata yapma korkusu da büyüyor.','Bir noktadan sonra sevincin yanına “ya şimdi bozarsak?” düşüncesi geliyor.']
    };
    return pick(bank[p]||bank.curiosity);
  }

  function scene(d){
    const b=['Bir noktada devam etmekle durmak arasında kaldık. En zor karar yeni bir hamle yapmak değil, acele etmemekti.','Bir yerde herkesin aklından aynı şey geçti: “Biraz daha mı, burada yeter mi?” O an mesele kontrolü kaybetmemekti.','Bazı anlarda hiçbir şey yapmamak, işlem açmaktan daha zor geldi.','Finale yaklaştıkça herkes önce elimizdekini korumayı düşünüyordu.'];
    if(d.g)b.push('Grupta bir an oldu; herkes sonucu değil, planın bozulmamasını konuşuyordu.');
    if(d.live)b.push('Canlı yayında alınan kararların ağırlığı daha farklı hissediliyordu.');
    return pick(b);
  }

  function hookArena(d){
    const pool=['contrast','stakes','curiosity'].concat(d.g?['social']:[],d.loss||d.mistake?['imperfection']:[],d.emotion?['vulnerability']:[]), out=[];
    for(let i=0;i<30;i++){const p=pick(pool),h=base(d,p);let s=50;if(h.length<105)s+=10;if(/\d|[$₺€]/.test(h))s+=9;if(/ama|hâlâ|hala|neden|nasıl/.test(h.toLowerCase()))s+=4;if(/süreç|hikâye|değişim|final/.test(h.toLowerCase()))s-=6;out.push({h,p,s})}
    return out.sort((a,b)=>b.s-a.s).slice(0,6);
  }

  function dedupe(lines){
    const out=[];
    for(const x of lines){let ok=true;for(const y of out){if(sim(x,y)>.46)ok=false;const nx=x.match(/\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar)?/gi)||[],ny=y.match(/\d[\d.,]*\s*(?:\$|₺|€|usdt|usd|tl|dolar)?/gi)||[];if(nx.length>=2&&ny.length>=2&&nx.join('|')===ny.join('|'))ok=false}if(ok)out.push(x)}
    return out;
  }
  const noMeta=lines=>lines.filter(x=>!/metnin işi|görsel sonucu|ekran kanıtı|bu tweet|okuyucu|algoritma|keşfet/i.test(x));
  const compress=lines=>lines.map(x=>x.replace(/\bgerçekten\b/gi,'').replace(/\baslında\b/gi,'').replace(/\s{2,}/g,' ').trim()).filter(Boolean);
  function payoff(d){const A=money(d,0),B=money(d,d.m.length-1),a=['Sonuca bakınca insanın aklına başlangıç daha net geliyor.'];if(A&&B)a.push(`Herkes ${B}a bakacak. Ben ${A} ile başladığımız yeri unutmak istemiyorum.`);if(d.g)a.push('Bunu grupça yaşamış olmak, benim için rakamdan daha kalıcı.');return pick(a)}

  function build(d,hook){
    let lines=[hook.h], psych=shuffle(['stakes','social','effort','identity','curiosity']), fiction=false;
    const facts=d.s.filter(x=>/\d|grup|ekip|başlad|ulaşt|bakiye|kaybet|canlı/i.test(x));
    if(facts.length&&Math.random()>.35)lines.push(pick(facts));
    if(d.loss||d.mistake)psych.unshift('imperfection'); if(d.emotion)psych.unshift('vulnerability');
    for(const p of psych){if(lines.length>=5)break;lines.push(base(d,p))}
    if(Math.random()>.2){lines.splice(Math.min(3,lines.length),0,scene(d));fiction=true}
    lines.push(payoff(d));
    lines=compress(noMeta(dedupe(lines))).slice(0,7);
    let txt=lines.join('\n\n').trim(); if(fiction)txt+='\n\nNot: Bazı anlatı detayları kurgusaldır.';
    return {txt,psych:psych.slice(0,4),fiction};
  }

  function oldRuns(){return json('vanta_runs',[]).concat(json('vanta_hist',[]))}
  function semanticPenalty(t){let p=0;for(const o of oldRuns()){const z=sim(t,o.text||'');if(z>.64)p+=24;else if(z>.5)p+=10}return p}
  function payoffScore(t){const ps=t.split(/\n\n+/);let last=(ps[ps.length-1]||'').toLowerCase();if(/^not:/.test(last)&&ps.length>1)last=(ps[ps.length-2]||'').toLowerCase();let s=50;if(/unut|başlangıç|grupça|kalıcı|başladığımız/.test(last))s+=18;if(last.length<130)s+=5;return clamp(s,25,95)}
  function score(v){
    const t=v.txt, ps=t.split(/\n\n+/), first=ps[0]||'';let stop=50,dwell=50,story=52,natural=82,info=50,risk=6;
    if(first.length<110)stop+=12;if(/\d|[$₺€]/.test(first))stop+=10;if(/kork|hata|karar|grup|canlı|korumak|durmak|devam/.test(t.toLowerCase())){dwell+=12;story+=9}if(ps.length>=5){story+=10;dwell+=5}else{story-=14;risk+=12}if(t.length>=240&&t.length<=680){story+=7;dwell+=5}
    let uniq=0;for(let i=0;i<ps.length;i++){let u=true;for(let j=0;j<i;j++)if(sim(ps[i],ps[j])>.46)u=false;if(u)uniq++}info+=uniq*5;
    const abstract=((t.match(/\b(süreç|hikâye|değişim|yolculuk|başarı|disiplin|final|asıl mesele)\b/gi)||[]).length)*3, sem=semanticPenalty(t), pay=payoffScore(t);natural-=abstract;risk+=abstract+sem;dwell-=Math.round(sem/2);if(v.fiction){story+=5;dwell+=3}
    const total=Math.round(stop*.24+dwell*.23+story*.2+natural*.15+info*.1+pay*.08-risk*.08);
    return {stop:clamp(stop,30,96),dwell:clamp(dwell,30,96),story:clamp(story,30,96),natural:clamp(natural,30,96),info:clamp(info,30,96),payoff:pay,risk:clamp(risk,5,95),total:clamp(total,20,96)};
  }

  function finalists(d){
    const hooks=hookArena(d),all=[];for(const h of hooks)for(let i=0;i<55;i++){const v=build(d,h);v.s=score(v);all.push(v)}all.sort((a,b)=>b.s.total-a.s.total);
    const out=[];for(const v of all){let ok=v.s.natural>=60&&v.s.payoff>=55;for(const x of out)if(sim(v.txt,x.txt)>.40)ok=false;if(ok)out.push(v);if(out.length===3)break}
    return out.map(x=>({text:x.txt,psych:x.psych,fiction:x.fiction,s:x.s}));
  }
  function saveRun(arr){let h=json('vanta_runs',[]);for(const v of arr)h.unshift({text:v.text,time:Date.now()});set('vanta_runs',JSON.stringify(h.slice(0,140)))}
  function saveHistory(v){let h=json('vanta_hist',[]);h.unshift({text:v.text,time:Date.now()});set('vanta_hist',JSON.stringify(h.slice(0,50)))}
  function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>alert('Kopyalandı.'));else{const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();alert('Kopyalandı.')}}
  const psychName=p=>(p||[]).slice(0,3).map(x=>LABEL[x]).join(' · ');
  const metrics=v=>'<div class="metrics"><div class="metric"><b>'+v.s.stop+'</b><span>Durdurma</span></div><div class="metric"><b>'+v.s.dwell+'</b><span>Okutma</span></div><div class="metric"><b>'+v.s.story+'</b><span>Hikâye</span></div><div class="metric"><b>'+v.s.natural+'</b><span>Doğallık</span></div><div class="metric"><b>'+v.s.info+'</b><span>Yeni bilgi</span></div><div class="metric"><b>'+v.s.payoff+'</b><span>Kapanış</span></div></div>';

  $('run').onclick=function(){
    const t=I.value.trim();if(!t){alert('Önce bir şey yaz.');return}
    ST.style.display='block';RES.innerHTML='';BAR.style.width='8%';SCAN.textContent='Hook Arena çalışıyor…';
    setTimeout(()=>{BAR.style.width='30%';SCAN.textContent='Duplicate Killer tekrarları siliyor…'},150);
    setTimeout(()=>{BAR.style.width='50%';SCAN.textContent='Natural Speech metni temizliyor…'},300);
    setTimeout(()=>{BAR.style.width='70%';SCAN.textContent='Scene Quality ve Payoff test ediliyor…'},450);
    setTimeout(()=>{BAR.style.width='88%';SCAN.textContent='Final kalite kapıları çalışıyor…'},600);
    setTimeout(()=>{const d=detect(t),arr=finalists(d);if(!arr.length){SCAN.textContent='Güçlü finalist çıkmadı. Tekrar dene.';return}saveRun(arr);BAR.style.width='100%';SCAN.textContent='v7 · kalite kapıları tamamlandı · 3 finalist';const w=arr[0];RES.innerHTML='<div class="winner"><div class="winnerHead"><div><div class="crown">Keşfet kazananı · '+psychName(w.psych)+(w.fiction?' · Kurgu katkılı':'')+'</div></div><div class="score">'+w.s.total+'<small>/100</small></div></div><div class="tweet"></div>'+metrics(w)+'<div class="actions"><button class="btn" id="posted">Bunu attım</button><button class="btn primary" id="copyWinner">Kopyala</button></div></div><div class="alts"></div>';RES.querySelector('.winner .tweet').textContent=w.text;$('copyWinner').onclick=()=>copy(w.text);$('posted').onclick=()=>{saveHistory(w);alert('Kaydettim.')};const alts=RES.querySelector('.alts');for(let i=1;i<arr.length;i++){const v=arr[i],el=document.createElement('div');el.className='alt';el.innerHTML='<div class="crown">Finalist '+(i+1)+' · '+psychName(v.psych)+(v.fiction?' · Kurgu katkılı':'')+' · '+v.s.total+'/100</div><div class="tweet"></div><div class="actions"><button class="btn">Kopyala</button></div>';el.querySelector('.tweet').textContent=v.text;el.querySelector('.btn').onclick=()=>copy(v.text);alts.appendChild(el)}ST.scrollIntoView({behavior:'smooth'})},760);
  };
})();