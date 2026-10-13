(()=>{
  const previousOpenCustomer=window.openCustomer;
  window.openCustomer=function(id){
    previousOpenCustomer(id);
    setTimeout(()=>{
      const modalEl=document.querySelector('.modal');
      if(!modalEl)return;
      modalEl.classList.add('v13CustomerProfile');
      const body=modalEl.querySelector('.modalBody');
      if(!body)return;
      const c=cust(id);
      const now=Date.now();
      const future=[...data.appointments]
        .filter(a=>a.customerId===id && new Date(a.start).getTime()>=now && !['İptal','Tamamlandı'].includes(a.status))
        .sort((a,b)=>new Date(a.start)-new Date(b.start));
      const wrap=document.createElement('section');
      wrap.className='v13FutureWrap';
      wrap.innerHTML=`<div class="v13FutureHead"><h4>Gelecek Rezervasyonlar</h4><span>${future.length} kayıt</span></div>${future.length?`<div class="v13FutureList">${future.map(a=>{const d=new Date(a.start);const service=a.serviceName||svc(a.serviceId)?.name||'İşlem';return `<div class="v13FutureRow" data-appt-id="${a.id}"><div class="v13FutureDate"><b>${d.toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'})}</b><span>${d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</span></div><div class="v13FutureInfo"><b>${esc(service)}</b><span>${a.staff?`Uzman: ${esc(a.staff)} · `:''}${a.note?esc(a.note):'Rezervasyon notu yok'}</span></div><div class="v13FutureStatus">${esc(a.status||'Planlandı')}</div></div>`}).join('')}</div>`:`<div class="v13FutureEmpty">Bu müşteri için gelecek tarihli rezervasyon bulunmuyor.</div>`}`;
      const profileHistories=[...body.querySelectorAll('.profileHistory')];
      const noteBlock=profileHistories.find(x=>(x.querySelector('h4')?.textContent||'').toLocaleLowerCase('tr-TR').includes('müşteri notu'));
      if(noteBlock) body.insertBefore(wrap,noteBlock); else body.appendChild(wrap);
      wrap.querySelectorAll('[data-appt-id]').forEach(row=>row.onclick=()=>{const apptId=row.dataset.apptId;closeModal();setTimeout(()=>openAppointmentForm(apptId),30)});
    },40);
  };
  if(typeof render==='function')render();
})();