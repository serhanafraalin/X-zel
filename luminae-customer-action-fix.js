(()=>{
  const deferOpen=(fn)=>{
    try{ closeModal(); }catch(e){}
    setTimeout(()=>{
      try{ fn(); }
      catch(e){ console.error(e); try{toast('İşlem penceresi açılamadı. Sayfayı yenileyip tekrar deneyin.')}catch(_){} }
    },30);
  };

  window.openCustomerActionReservation=(id)=>deferOpen(()=>openAppointmentForm('',id));
  window.openCustomerActionSession=(id)=>deferOpen(()=>openSessionForm(id));
  window.openCustomerActionPayment=(id)=>deferOpen(()=>openPaymentForm(id));

  const previousOpenCustomer=window.openCustomer;
  window.openCustomer=function(id){
    previousOpenCustomer(id);
    setTimeout(()=>{
      const modalEl=document.querySelector('.modal');
      if(!modalEl)return;
      const buttons=[...modalEl.querySelectorAll('button')];
      for(const btn of buttons){
        const label=(btn.textContent||'').trim().toLocaleLowerCase('tr-TR');
        if(label.includes('rezervasyon ekle')){
          btn.removeAttribute('onclick');
          btn.onclick=(e)=>{e.preventDefault();e.stopPropagation();openCustomerActionReservation(id)};
        }else if(label.includes('seans işle')){
          btn.removeAttribute('onclick');
          btn.onclick=(e)=>{e.preventDefault();e.stopPropagation();openCustomerActionSession(id)};
        }else if(label.includes('ödeme ekle')){
          btn.removeAttribute('onclick');
          btn.onclick=(e)=>{e.preventDefault();e.stopPropagation();openCustomerActionPayment(id)};
        }
      }
    },0);
  };

  if(typeof render==='function')render();
})();