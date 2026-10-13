(()=>{
  const norm=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  const digits=s=>String(s||'').replace(/\D/g,'');
  const findExisting=(r)=>{
    const names=[r.name,...(r.matchNames||[])].filter(Boolean).map(norm);
    const phone=digits(r.phone);
    return data.customers.find(c=>names.includes(norm(c.name))||(phone&&digits(c.phone)===phone));
  };
  const applyRecord=r=>{
    let c=findExisting(r),created=false;
    if(!c){
      c={id:uid('cust'),name:r.name||'İsimsiz Müşteri',phone:r.phone||'',items:[],serviceId:'',serviceName:'',packagePrice:Number(r.paid||0)+Number(r.debt||0),totalSessions:0,note:'Eski sistemden toplu aktarım',createdAt:new Date().toISOString(),gender:r.gender||''};
      data.customers.unshift(c);created=true;
      if(Number(r.paid||0)>0)data.payments.unshift({id:uid('pay'),customerId:c.id,amount:Number(r.paid||0),method:'Belirtilmedi',date:new Date().toISOString(),note:'Eski sistemden toplu aktarım'});
    }else{
      if(!c.phone&&r.phone)c.phone=r.phone;
      if(!c.gender&&r.gender)c.gender=r.gender;
      if(r.expert&&!c.note)c.note=`Uzman: ${r.expert}`;
    }
    return created;
  };
  window.openPrivateImport=function(){
    modal('Toplu müşteri içe aktar','Bu işlem dosyayı yalnızca bu tarayıcıda okur; bilgiler GitHub’a yüklenmez.',`<div class="v9FieldGrid"><div class="field full"><label>JSON müşteri dosyası</label><input id="v14ImportFile" type="file" accept="application/json,.json"></div><div class="field full"><div class="v10FormNote">Mevcut müşteriler isim/telefon üzerinden eşleştirilir. Var olan finans kayıtları değiştirilmez; yeni müşterilerde dosyadaki ödeme ve borç başlangıç değeri olarak eklenir.</div></div></div>`,`<button class="softBtn" onclick="closeModal()">Vazgeç</button><button class="primaryBtn" onclick="runPrivateImport()">İçe aktar</button>`);
  };
  window.runPrivateImport=async function(){
    const f=document.getElementById('v14ImportFile')?.files?.[0];if(!f)return toast('Dosya seçin');
    try{const obj=JSON.parse(await f.text());const arr=Array.isArray(obj)?obj:(obj.records||[]);if(!Array.isArray(arr)||!arr.length)throw new Error('empty');let added=0,updated=0;for(const r of arr){applyRecord(r)?added++:updated++;}activity(`${added} yeni müşteri eklendi, ${updated} mevcut kayıt eşleştirildi`);save();closeModal();toast(`${added} yeni müşteri eklendi · ${updated} kayıt güncellendi`);render();}catch(e){console.error(e);toast('Dosya okunamadı veya format uygun değil');}
  };
  const oldShell=window.shell;
  window.shell=function(content){let html=oldShell(content);html=html.replace('<div class="topActions">','<div class="topActions"><button class="softBtn" onclick="openPrivateImport()">Müşteri içe aktar</button>');return html;};
  if(typeof render==='function')render();
})();