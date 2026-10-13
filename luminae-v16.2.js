(()=>{
  const oldCForm=window.cForm;
  const oldSaveC16=window.saveC16;

  const itemName16=(c,it)=>{
    const service=it?.serviceId?sv(it.serviceId):null;
    const customerService=c?.serviceId?sv(c.serviceId):null;
    const raw=String(it?.name||'').trim();
    if(raw && !/belirtilmedi|işlem bilgisi|^hizmet$/i.test(raw)) return raw;
    if(service?.name) return service.name;
    if(customerService?.name) return customerService.name;
    if(c?.serviceName) return c.serviceName;
    return 'Genel hizmet';
  };

  // Eski müşteri kayıtlarında paket/hizmet alanı boş kalmışsa otomatik onar.
  for(const c of d.customers){
    if(!Array.isArray(c.items)) c.items=[];
    if(!c.items.length && (c.serviceId||c.serviceName||c.totalSessions||c.packagePrice)){
      c.items.push({
        id:uid('item'),
        serviceId:c.serviceId||'',
        name:sv(c.serviceId)?.name||c.serviceName||'Genel hizmet',
        price:+c.packagePrice||0,
        sessions:+c.totalSessions||0
      });
    }
    c.items=c.items.map((it,i)=>{
      const serviceId=it.serviceId||((i===0&&c.serviceId)?c.serviceId:'');
      const service=serviceId?sv(serviceId):null;
      return {...it,id:it.id||uid('item'),serviceId,name:itemName16(c,{...it,serviceId,name:it.name||service?.name}),price:+it.price||0,sessions:+it.sessions||0};
    });
    if(c.items.length){
      c.serviceId=c.items[0].serviceId||c.serviceId||'';
      c.serviceName=c.items.map(x=>itemName16(c,x)).join(' + ');
      c.totalSessions=c.items.reduce((a,x)=>a+(+x.sessions||0),0);
      c.packagePrice=c.items.reduce((a,x)=>a+(+x.price||0),0);
    }
  }
  save();

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
      itemId:firstItem?.id||'',
      staffId:'',
      start:dt,
      status:'Planlandı'
    });
    log(customer.name+' için ilk rezervasyon oluşturuldu');
    save();
    render();
    toast('Müşteri ve ilk rezervasyon kaydedildi');
  };

  // Seans ekranında paket adı her zaman gerçek hizmetten çözülür.
  window.itemOptions16=function(cid,sel=''){
    const c=cu(cid),a=c?.items||[];
    if(!a.length) return `<option value="">${esc(itemName16(c,null))} · ${used(cid)}/${+c?.totalSessions||0}</option>`;
    return a.map(x=>{
      const n=itemName16(c,x),count=d.sessions.filter(s=>s.customerId===cid&&(s.itemId===x.id||(!s.itemId&&s.serviceId&&s.serviceId===x.serviceId))).length;
      return `<option value="${x.id}" ${x.id===sel?'selected':''}>${esc(n)} · ${count}/${+x.sessions||0} seans</option>`;
    }).join('');
  };

  window.sForm=function(cid=''){
    if(!d.customers.length)return toast('Önce müşteri ekleyin');
    let first=cid||d.customers[0]?.id;
    modal('Seans İşle',`<div class="form"><label>Müşteri<select id="sCus" onchange="document.getElementById('sItem').innerHTML=itemOptions16(this.value)">${opts(d.customers,first)}</select></label><label>Hizmet / Paket<select id="sItem">${itemOptions16(first)}</select></label><label>Tarih<input id="sDate" type="date" value="${today()}"></label><label>Not<input id="sNote" placeholder="İsteğe bağlı"></label></div>`,`<button class="primary" onclick="saveSession16()">Seansı Kaydet</button>`)
  };

  window.saveSession16=function(){
    let cid=sCus.value,iid=sItem.value,c=cu(cid),it=(c?.items||[]).find(x=>x.id===iid),name=itemName16(c,it);
    const total=+it?.sessions||+c?.totalSessions||0;
    const current=it?d.sessions.filter(s=>s.customerId===cid&&(s.itemId===iid||(!s.itemId&&s.serviceId&&s.serviceId===it.serviceId))).length:used(cid);
    if(total>0&&current>=total&&!confirm(`${name} paketindeki ${total} seansın tamamı kullanılmış görünüyor. Yine de yeni seans işlensin mi?`))return;
    d.sessions.push({id:uid('s'),customerId:cid,itemId:iid||'',serviceId:it?.serviceId||c?.serviceId||'',serviceName:name,date:sDate.value,note:sNote.value,historical:false});
    log(`${c?.name||'Müşteri'} · ${name} seansı işlendi`);
    save();closeM();render();toast('Seans işlendi');
  };

  // Paket kartlarını da eski/eksik kayıtlarda doğru isimle göster.
  const oldProfileCard=window.profileCard;
  window.profileCard=function(id){
    const c=cu(id);
    if(c?.items?.length)c.items=c.items.map(x=>({...x,name:itemName16(c,x)}));
    return oldProfileCard(id);
  };
})();