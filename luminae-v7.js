(()=>{
  const wait=(fn)=>setTimeout(fn,0);
  const safeOpen=(fn)=>{try{fn()}catch(e){console.error(e);toast('İşlem açılamadı. Sayfayı yenileyip tekrar deneyin.')}};

  // Make quick actions stable: close current modal first, then open next one on next tick.
  window.openQuick=function(){
    modal('Hızlı İşlem','Salon operasyonunda ne yapmak istiyorsunuz?',`<div class="quickGrid v7quick">${quickCard('Yeni müşteri','Profil, paket ve hizmet oluştur','users',"closeModal();wait(()=>safeOpen(()=>openCustomerForm()))")}${quickCard('Rezervasyon','Takvime yeni randevu ekle','calendar',"closeModal();wait(()=>safeOpen(()=>openAppointmentForm()))")}${quickCard('Ödeme al','Tahsilatı müşteri hesabına işle','wallet',"closeModal();wait(()=>safeOpen(()=>openPaymentForm()))")}${quickCard('Seans işle','Müşterinin geldiği seansı kaydet','session',"closeModal();wait(()=>safeOpen(()=>openSessionForm()))")}</div>`);
  };
  window.wait=wait;window.safeOpen=safeOpen;

  // Prevent accidental modal closure by clicking backdrop. X/Vazgeç/Kaydet only.
  const oldModal=window.modal;
  window.modal=function(title,subtitle,body,footer=''){
    oldModal(title,subtitle,body,footer);
    const overlay=document.querySelector('.overlay');
    if(overlay){overlay.onclick=(e)=>{e.stopPropagation();};}
  };

  // Add enterprise-like top search without changing stored data.
  const oldShell=window.shell;
  window.shell=function(content){
    const html=oldShell(content);
    return html.replace('<div class="topActions">',`<div class="topActions"><div class="v7TopSearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input placeholder="Müşteri, telefon veya işlem ara" onkeydown="if(event.key==='Enter'){search=this.value;go('customers')}"></div><span class="v7Pulse" title="Sistem aktif"></span>`);
  };

  // Premium dashboard heading / microcopy.
  const oldDashboard=window.dashboard;
  window.dashboard=function(){
    const html=oldDashboard();
    return html
      .replace('LUMINAE OPERASYON MERKEZİ','LUMINAE PRIVATE OPERATIONS')
      .replace('Salonun kontrolü tek ekranda.','Luminae’nin tüm operasyonu tek merkezde.')
      .replace('Hızlı İşlemler','Yönetim Kısayolları');
  };

  // Customer profile UX: keep package history visible and make next appointment more prominent.
  const originalOpenCustomer=window.openCustomer;
  window.openCustomer=function(id){
    originalOpenCustomer(id);
    const modalEl=document.querySelector('.modal');
    if(modalEl) modalEl.classList.add('v7CustomerModal');
  };

  // Global keyboard shortcut: Escape closes modal, Ctrl/Cmd+K opens quick action.
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'&&document.querySelector('.overlay')) closeModal();
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openQuick();}
  });

  if(typeof render==='function') render();
})();