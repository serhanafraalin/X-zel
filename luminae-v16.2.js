(()=>{
  const oldCForm=window.cForm;
  const oldSaveC16=window.saveC16;

  window.cForm=function(id=''){
    oldCForm(id);
    if(id) return;
    const form=document.querySelector('#modalRoot .form');
    if(!form) return;
    const box=document.createElement('div');
    box.className='firstAppointment16';
    box.innerHTML='<b>İlk randevu tarihi / saati</b><small>İsteğe bağlı. Tarih girerseniz müşteri kaydedildiğinde rezervasyon takvimine de otomatik eklenir.</small><input id="cFirstAppointment" type="datetime-local">';
    const pkg=form.querySelector('.pkgBox16');
    if(pkg) form.insertBefore(box,pkg); else form.appendChild(box);
  };

  window.saveC16=function(id=''){
    const dt=document.getElementById('cFirstAppointment')?.value||'';
    const before=new Set(d.customers.map(x=>x.id));
    oldSaveC16(id);
    if(id||!dt) return;
    const customer=d.customers.find(x=>!before.has(x.id));
    if(!customer) return;
    const firstItem=(customer.items||[])[0];
    d.appointments.push({
      id:uid('a'),
      customerId:customer.id,
      serviceId:firstItem?.serviceId||customer.serviceId||'',
      staffId:'',
      start:dt,
      status:'Planlandı'
    });
    log(customer.name+' için ilk rezervasyon oluşturuldu');
    save();
    render();
    toast('Müşteri ve ilk rezervasyon kaydedildi');
  };
})();