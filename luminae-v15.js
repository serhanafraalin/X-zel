(()=>{
  const prevRender=window.render;
  function addGlobalSearch(){
    const actions=document.querySelector('.topActions');
    if(!actions||document.querySelector('.v15Search'))return;
    const wrap=document.createElement('div');
    wrap.className='v15Search';
    wrap.innerHTML=`<span>⌕</span><input placeholder="Müşteri ara..." autocomplete="off"><div class="v15SearchPop"></div>`;
    actions.prepend(wrap);
    const input=wrap.querySelector('input'),pop=wrap.querySelector('.v15SearchPop');
    input.oninput=()=>{
      const q=input.value.trim().toLocaleLowerCase('tr-TR');
      if(!q){pop.innerHTML='';pop.classList.remove('show');return}
      const list=data.customers.filter(c=>(`${c.name||''} ${c.phone||''}`).toLocaleLowerCase('tr-TR').includes(q)).slice(0,6);
      pop.innerHTML=list.length?list.map(c=>`<button data-id="${c.id}"><span class="miniava">${initials(c.name)}</span><div><b>${esc(c.name)}</b><small>${esc(c.phone||'Telefon yok')} · Kalan ${money(debt(c))}</small></div></button>`).join(''):`<div class="v15NoResult">Sonuç bulunamadı</div>`;
      pop.classList.add('show');
      pop.querySelectorAll('button').forEach(b=>b.onclick=()=>{input.value='';pop.classList.remove('show');openCustomer(b.dataset.id)});
    };
  }
  function addCommandBar(){
    if(route!=='dashboard'||document.querySelector('.v15Command'))return;
    const content=document.querySelector('.content');if(!content)return;
    const upcoming=[...data.appointments].filter(a=>new Date(a.start)>=new Date()&&!['İptal','Tamamlandı'].includes(a.status)).sort((a,b)=>new Date(a.start)-new Date(b.start))[0];
    const c=upcoming?cust(upcoming.customerId):null,s=upcoming?svc(upcoming.serviceId):null;
    const todayPay=data.payments.filter(p=>String(p.date||'').slice(0,10)===isoDate()).reduce((a,b)=>a+Number(b.amount||0),0);
    const openDebt=data.customers.reduce((a,c)=>a+debt(c),0);
    const el=document.createElement('section');el.className='v15Command';
    el.innerHTML=`<div class="v15Live"><span>CANLI OPERASYON</span><b>${todayAppts().length} rezervasyon · ${money(todayPay)} tahsilat</b><small>Toplam açık alacak: ${money(openDebt)}</small></div><div class="v15Next"><span>SIRADAKİ</span>${upcoming?`<b>${new Date(upcoming.start).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})} · ${esc(c?.name||'Müşteri')}</b><small>${esc(s?.name||upcoming.serviceName||'İşlem')}</small>`:`<b>Planlanmış rezervasyon yok</b><small>Takvim şu an boş.</small>`}</div><button onclick="openQuick()">＋ Hızlı işlem</button>`;
    content.prepend(el);
  }
  function addPremiumBadges(){
    document.querySelectorAll('.statCard,.card,.tableCard').forEach(x=>x.classList.add('v15Lift'));
  }
  function enhance(){addGlobalSearch();addCommandBar();addPremiumBadges()}
  window.render=function(){prevRender();setTimeout(enhance,0)};
  setTimeout(enhance,0);
})();