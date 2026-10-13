(()=>{
  const byId=id=>document.getElementById(id);
  const getCustomerItems=(customerId)=>cust(customerId)?.items||[];
  const itemOptions=(customerId,selected='')=>{
    const items=getCustomerItems(customerId);
    if(!items.length)return '<option value="">Genel işlem</option>';
    return items.map(it=>`<option value="${it.id}" ${selected===it.id?'selected':''}>${esc(it.name||'Hizmet')} ${Number(it.sessions||0)?`· ${it.sessions} seans`:''}</option>`).join('');
  };
  const customerOptions=(selected='')=>data.customers.map(c=>`<option value="${c.id}" ${selected===c.id?'selected':''}>${esc(c.name)}${c.phone?` · ${esc(c.phone)}`:''}</option>`).join('');
  const closeThen=(fn)=>{try{closeModal()}catch(e){} setTimeout(()=>{try{fn()}catch(err){console.error(err);toast('İşlem açılamadı. Sayfayı yenileyip tekrar deneyin.')}},40)};
  window.closeThen=closeThen;

  // Make modal deterministic: backdrop never closes it.
  const baseModal=window.modal;
  window.modal=function(title,subtitle,body,footer=''){
    baseModal(title,subtitle,body,footer);
    const ov=document.querySelector('.overlay');
    if(ov){ov.onclick=e=>{e.stopPropagation();};}
  };

  // Appointment form rebuilt without hidden/local helper dependencies.
  window.openAppointmentForm=function(id='',customerId=''){
    if(!data.customers.length)return toast('Önce müşteri ekleyin');
    const a=id?data.appointments.find(x=>x.id===id):null;
    const selectedCustomer=a?.customerId||customerId||data.customers[0].id;
    modal(a?'Rezervasyonu düzenle':'Yeni rezervasyon','Müşteri, işlem, tarih ve durum bilgilerini kaydedin.',`
      <div class="v9FieldGrid">
        <div class="field full"><label>Müşteri</label><select id="v9ApptCustomer"></select></div>
        <div class="field full"><label>Hizmet / Paket</label><select id="v9ApptItem"></select></div>
        <div class="field"><label>Tarih ve saat</label><input id="v9ApptStart" type="datetime-local" value="${a?.start?String(a.start).slice(0,16):localDT()}"></div>
        <div class="field"><label>Uzman / Personel</label><input id="v9ApptStaff" value="${esc(a?.staff||'')}" placeholder="Opsiyonel"></div>
        <div class="field"><label>Durum</label><select id="v9ApptStatus">${['Planlandı','Onaylandı','Tamamlandı','Gelmedi','İptal'].map(s=>`<option ${a?.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
        <div class="field full"><label>Not</label><textarea id="v9ApptNote" placeholder="Rezervasyon notu...">${esc(a?.note||'')}</textarea></div>
      </div>
    `,`<button class="softBtn" type="button" onclick="closeModal()">Vazgeç</button>${a?`<button class="dangerBtn" type="button" onclick="deleteAppointment('${a.id}')">Sil</button>`:''}<button class="primaryBtn" type="button" onclick="saveAppointmentV9('${a?.id||''}')">Kaydet</button>`);
    const csel=byId('v9ApptCustomer'),isel=byId('v9ApptItem');
    csel.innerHTML=customerOptions(selectedCustomer);
    isel.innerHTML=itemOptions(selectedCustomer,a?.itemId||'');
    csel.onchange=()=>{isel.innerHTML=itemOptions(csel.value,'')};
  };

  window.saveAppointmentV9=function(id=''){
    const customerId=byId('v9ApptCustomer')?.value,start=byId('v9ApptStart')?.value,itemId=byId('v9ApptItem')?.value||'';
    if(!customerId||!start)return toast('Müşteri ve tarih seçin');
    const c=cust(customerId),it=getCustomerItems(customerId).find(x=>x.id===itemId);
    const obj={id:id||uid('appt'),customerId,itemId,serviceId:it?.serviceId||'',serviceName:it?.name||'Genel İşlem',start,status:byId('v9ApptStatus')?.value||'Planlandı',staff:byId('v9ApptStaff')?.value.trim()||'',note:byId('v9ApptNote')?.value.trim()||''};
    if(id)data.appointments=data.appointments.map(x=>x.id===id?obj:x);else data.appointments.push(obj);
    activity(`${c?.name||'Müşteri'} · ${obj.serviceName} rezervasyonu ${id?'güncellendi':'eklendi'}`);save();closeModal();toast('Rezervasyon kaydedildi');render();
  };

  // Session form rebuilt without local helper dependencies.
  window.openSessionForm=function(customerId=''){
    if(!data.customers.length)return toast('Önce müşteri ekleyin');
    const selectedCustomer=customerId||data.customers[0].id;
    modal('Seans işle','Müşterinin hangi hizmet veya paket seansına geldiğini kaydedin.',`
      <div class="v9FieldGrid">
        <div class="field full"><label>Müşteri</label><select id="v9SessionCustomer"></select></div>
        <div class="field full"><label>Hizmet / Paket</label><select id="v9SessionItem"></select></div>
        <div class="field full"><div id="v9SessionHint" class="v9FormHint"></div></div>
        <div class="field"><label>Tarih ve saat</label><input id="v9SessionDate" type="datetime-local" value="${localDT()}"></div>
        <div class="field"><label>Uzman / Personel</label><input id="v9SessionStaff" placeholder="Opsiyonel"></div>
        <div class="field full"><label>Bu seansta ne yapıldı?</label><textarea id="v9SessionNote" placeholder="Bölge, cihaz, uygulama ve önemli notlar..."></textarea></div>
      </div>
    `,`<button class="softBtn" type="button" onclick="closeModal()">Vazgeç</button><button class="primaryBtn" type="button" onclick="saveSessionV9()">Seansı kaydet</button>`);
    const csel=byId('v9SessionCustomer'),isel=byId('v9SessionItem');
    csel.innerHTML=customerOptions(selectedCustomer);
    isel.innerHTML=itemOptions(selectedCustomer,'');
    const refresh=()=>{
      const cid=csel.value,it=getCustomerItems(cid).find(x=>x.id===isel.value);const used=data.sessions.filter(s=>s.customerId===cid&&(!isel.value||s.itemId===isel.value)).length;
      byId('v9SessionHint').textContent=it?`${it.name}: Bu kayıt ${used+1}. seans olacak${Number(it.sessions||0)?` · toplam ${it.sessions} seans · sonrasında ${Math.max(0,Number(it.sessions)-used-1)} seans kalacak`:''}.`:`Bu müşteri için genel seans kaydı oluşturulacak. Şimdiye kadar ${used} seans kaydı var.`;
    };
    csel.onchange=()=>{isel.innerHTML=itemOptions(csel.value,'');refresh()};isel.onchange=refresh;refresh();
  };

  window.saveSessionV9=function(){
    const customerId=byId('v9SessionCustomer')?.value,itemId=byId('v9SessionItem')?.value||'',c=cust(customerId);
    if(!c)return toast('Müşteri seçin');
    const it=getCustomerItems(customerId).find(x=>x.id===itemId);const seq=data.sessions.filter(s=>s.customerId===customerId&&(!itemId||s.itemId===itemId)).length+1;
    data.sessions.unshift({id:uid('ses'),customerId,itemId,serviceId:it?.serviceId||'',serviceName:it?.name||'Genel Seans',sequence:seq,date:byId('v9SessionDate')?.value||new Date().toISOString(),staff:byId('v9SessionStaff')?.value.trim()||'',note:byId('v9SessionNote')?.value.trim()||''});
    activity(`${c.name} · ${it?.name||'Genel Seans'} · ${seq}. seans işlendi`);save();closeModal();toast('Seans kaydedildi');render();
  };

  // Stable quick actions.
  window.openQuick=function(){
    modal('Yeni işlem','Salon operasyonu için işlem seçin.',`<div class="quickGrid"><button class="quickCard" id="v9QuickCustomer">${icon('users')}<b>Yeni müşteri</b><span>Profil, hizmet ve paket oluştur</span></button><button class="quickCard" id="v9QuickAppt">${icon('calendar')}<b>Rezervasyon</b><span>Takvime yeni randevu ekle</span></button><button class="quickCard" id="v9QuickPay">${icon('wallet')}<b>Ödeme al</b><span>Tahsilatı müşteri hesabına işle</span></button><button class="quickCard" id="v9QuickSession">${icon('session')}<b>Seans işle</b><span>Gelen müşterinin seansını kaydet</span></button></div>`);
    byId('v9QuickCustomer').onclick=()=>closeThen(()=>openCustomerForm());
    byId('v9QuickAppt').onclick=()=>closeThen(()=>openAppointmentForm());
    byId('v9QuickPay').onclick=()=>closeThen(()=>openPaymentForm());
    byId('v9QuickSession').onclick=()=>closeThen(()=>openSessionForm());
  };

  // Repair customer-profile action buttons every time a profile opens.
  const originalOpenCustomer=window.openCustomer;
  window.openCustomer=function(id){
    originalOpenCustomer(id);
    setTimeout(()=>{
      const modalEl=document.querySelector('.modal');if(!modalEl)return;
      [...modalEl.querySelectorAll('button')].forEach(btn=>{
        const t=(btn.textContent||'').trim().toLocaleLowerCase('tr-TR');
        if(t.includes('rezervasyon ekle'))btn.onclick=e=>{e.preventDefault();e.stopPropagation();closeThen(()=>openAppointmentForm('',id))};
        if(t.includes('seans işle'))btn.onclick=e=>{e.preventDefault();e.stopPropagation();closeThen(()=>openSessionForm(id))};
        if(t.includes('ödeme ekle'))btn.onclick=e=>{e.preventDefault();e.stopPropagation();closeThen(()=>openPaymentForm(id))};
        if(t==='düzenle')btn.onclick=e=>{e.preventDefault();e.stopPropagation();closeThen(()=>openCustomerForm(id))};
      });
    },20);
  };

  // Generic button safety: stop dead buttons from silently failing and provide fallbacks by label/context.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button');if(!btn)return;
    setTimeout(()=>{
      if(btn.disabled)return;
      const label=(btn.textContent||'').trim().toLocaleLowerCase('tr-TR');
      if(label==='+ yeni müşteri'&&!document.querySelector('.overlay'))openCustomerForm();
    },0);
  },true);

  // Keyboard accessibility.
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openQuick()}if(e.key==='Escape'&&document.querySelector('.overlay'))closeModal()});
  if(typeof render==='function')render();
})();