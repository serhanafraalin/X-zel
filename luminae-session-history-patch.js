(()=>{
  const ensureService=(s)=>{if(!data.services.some(x=>x.id===s.id||String(x.name).toLocaleLowerCase('tr-TR')===s.name.toLocaleLowerCase('tr-TR')))data.services.push(s)};
  ensureService({id:'brow_normal_v2',category:'Kaş',name:'Normal Kaş Alımı',price:300,sessions:1,duration:25});
  ensureService({id:'lash_lifting',category:'Kirpik',name:'Kirpik Lifting',price:0,sessions:1,duration:60});
  save();

  const style=document.createElement('style');
  style.textContent=`
    .packageRowV2{display:grid;grid-template-columns:minmax(220px,2fr) minmax(95px,.7fr) minmax(85px,.6fr) minmax(120px,.8fr) 34px;gap:8px;align-items:end;padding:10px 0;border-top:1px solid var(--line)}
    .packageRowV2:first-child{border-top:0}.packageRowV2 .field{margin:0}.removePkgV2{height:38px;border:0;border-radius:10px;background:#fff1f2;color:var(--red);font-size:18px}.usedBadge{font-size:7px;color:var(--muted);margin-top:4px;line-height:1.4}.packageBuilderV2{border:1px solid var(--line);background:#fbf8fb;border-radius:14px;padding:12px}.packageBuilderHeadV2{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:5px}.packageBuilderHeadV2 b{display:block;font-size:9px}.packageBuilderHeadV2 span{display:block;margin-top:3px;color:var(--muted);font-size:7px}.packageTotalV2{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:10px;margin-top:6px}.packageTotalV2 span{font-size:8px;color:var(--muted)}.packageTotalV2 strong{font-size:13px}.sessionHintV2{padding:10px;border:1px dashed var(--line);border-radius:10px;color:var(--muted);font-size:8px;line-height:1.5}
    @media(max-width:760px){.packageRowV2{grid-template-columns:1fr 1fr}.packageRowV2 .field:first-child{grid-column:1/-1}.packageRowV2 .field:nth-child(4){grid-column:1/-1}.removePkgV2{grid-column:2;justify-self:end;width:38px}.packageBuilderHeadV2{align-items:flex-start;flex-direction:column}.packageBuilderHeadV2 .softBtn{width:100%}}
  `;
  document.head.appendChild(style);

  let draft=[];
  const totalForItem=(customerId,itemId)=>data.sessions.filter(s=>s.customerId===customerId&&s.itemId===itemId).length;
  const realForItem=(customerId,itemId)=>data.sessions.filter(s=>s.customerId===customerId&&s.itemId===itemId&&!s.historical).length;
  function options(selected=''){
    const groups={};
    [...data.services].sort((a,b)=>String(a.category||'Diğer').localeCompare(String(b.category||'Diğer'),'tr')||String(a.name).localeCompare(String(b.name),'tr')).forEach(s=>(groups[s.category||'Diğer']??=[]).push(s));
    return `<option value="">Hizmet / paket seçin</option>`+Object.entries(groups).map(([g,arr])=>`<optgroup label="${esc(g)}">${arr.map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${esc(s.name)} · ${money(s.price)}</option>`).join('')}</optgroup>`).join('');
  }
  window.pkgAdd=()=>{draft.push({id:uid('item'),serviceId:'',name:'',price:0,sessions:0,usedTarget:0});draw()};
  window.pkgRemove=(id)=>{draft=draft.filter(x=>x.id!==id);draw()};
  window.pkgChange=(id,field,value)=>{const it=draft.find(x=>x.id===id);if(!it)return;if(field==='serviceId'){const s=svc(value);it.serviceId=value;it.name=s?.name||'';it.price=Number(s?.price||0);it.sessions=Number(s?.sessions||0)}else if(['price','sessions','usedTarget'].includes(field))it[field]=Math.max(0,Number(value||0));else it[field]=value;draw()};
  function draw(){const root=document.getElementById('customerItemsV2');if(!root)return;root.innerHTML=draft.length?draft.map(it=>`<div class="packageRowV2"><div class="field"><label>Hizmet / Paket</label><select onchange="pkgChange('${it.id}','serviceId',this.value)">${options(it.serviceId)}</select></div><div class="field"><label>Fiyat</label><input type="number" min="0" value="${Number(it.price||0)}" onchange="pkgChange('${it.id}','price',this.value)"></div><div class="field"><label>Toplam Seans</label><input type="number" min="0" value="${Number(it.sessions||0)}" onchange="pkgChange('${it.id}','sessions',this.value)"></div><div class="field"><label>Daha Önce Kullanılan</label><input type="number" min="0" max="${Number(it.sessions||999)}" value="${Number(it.usedTarget||0)}" onchange="pkgChange('${it.id}','usedTarget',this.value)"><div class="usedBadge">Eski müşterinin bugüne kadar girdiği toplam seans.</div></div><button class="removePkgV2" type="button" onclick="pkgRemove('${it.id}')">×</button></div>`).join(''):`<div class="sessionHintV2">Henüz hizmet eklenmedi. “Hizmet ekle” ile müşterinin aldığı işlem veya paketi seçin.</div>`;const total=draft.reduce((a,x)=>a+Number(x.price||0),0);const t=document.getElementById('customerPackageTotalV2');if(t)t.textContent=money(total)}

  window.openCustomerForm=function(id=''){
    const c=id?cust(id):null;
    draft=(c?.items?.length?c.items:[]).map(x=>({...x,id:x.id||uid('item'),usedTarget:id?totalForItem(id,x.id):0}));
    modal(c?'Müşteriyi düzenle':'Yeni müşteri',c?'Hizmetleri, paketleri ve geçmiş seans sayısını düzenleyin.':'Müşteriye birden fazla hizmet veya paket ekleyebilirsiniz.',`<div class="formGrid"><div class="field full"><label>Ad soyad</label><input id="cName" value="${esc(c?.name||'')}" placeholder="Ad soyad"></div><div class="field full"><label>Telefon</label><input id="cPhone" value="${esc(c?.phone||'')}" placeholder="05xx xxx xx xx"></div><div class="field full"><div class="packageBuilderV2"><div class="packageBuilderHeadV2"><div><b>Hizmetler & Paketler</b><span>Eski müşterilerde “Daha Önce Kullanılan” alanına geçmiş seans sayısını girin.</span></div><button class="softBtn" type="button" onclick="pkgAdd()">+ Hizmet ekle</button></div><div id="customerItemsV2"></div><div class="packageTotalV2"><span>Toplam müşteri hesabı</span><strong id="customerPackageTotalV2">₺0</strong></div></div></div><div class="field full"><label>Müşteri notları</label><textarea id="cNote" placeholder="Özel not, bölge, tercih, hatırlatma...">${esc(c?.note||'')}</textarea></div></div>`,`<button class="softBtn" onclick="closeModal()">Vazgeç</button>${c?`<button class="dangerBtn" onclick="deleteCustomer('${c.id}')">Sil</button>`:''}<button class="primaryBtn" onclick="saveCustomerV2('${c?.id||''}')">Kaydet</button>`);
    draw();
  };

  window.saveCustomerV2=function(id=''){
    const name=document.getElementById('cName').value.trim();if(!name)return toast('Ad soyad girin');
    const clean=draft.filter(x=>x.serviceId||x.name).map(x=>({id:x.id||uid('item'),serviceId:x.serviceId||'',name:x.name||svc(x.serviceId)?.name||'Hizmet',price:Number(x.price||0),sessions:Number(x.sessions||0),usedTarget:Number(x.usedTarget||0)}));
    const existing=id?cust(id):null;
    const obj={...(existing||{}),id:id||uid('cust'),name,phone:document.getElementById('cPhone').value.trim(),items:clean.map(({usedTarget,...x})=>x),serviceId:clean[0]?.serviceId||'',serviceName:clean.map(x=>x.name).join(' + '),packagePrice:clean.reduce((a,x)=>a+x.price,0),totalSessions:clean.reduce((a,x)=>a+x.sessions,0),note:document.getElementById('cNote').value.trim(),createdAt:existing?.createdAt||new Date().toISOString()};
    if(id)data.customers=data.customers.map(x=>x.id===id?obj:x);else data.customers.unshift(obj);
    for(const it of clean){
      const real=id?realForItem(id,it.id):0;
      const desired=Math.max(real,Math.min(Number(it.usedTarget||0),Number(it.sessions||it.usedTarget||0)||Number(it.usedTarget||0)));
      data.sessions=data.sessions.filter(s=>!(s.customerId===obj.id&&s.itemId===it.id&&s.historical));
      const historicalNeeded=Math.max(0,desired-real);
      for(let i=0;i<historicalNeeded;i++)data.sessions.push({id:uid('ses'),customerId:obj.id,itemId:it.id,serviceId:it.serviceId,serviceName:it.name,sequence:real+i+1,date:'',staff:'',note:'Önceki seans · tarih bilgisi girilmedi',historical:true});
    }
    const itemIds=new Set(clean.map(x=>x.id));
    data.sessions=data.sessions.filter(s=>!(s.customerId===obj.id&&s.historical&&!itemIds.has(s.itemId)));
    activity(`${name} ${id?'güncellendi':'müşteri olarak eklendi'} · geçmiş seanslar işlendi`);save();closeModal();toast('Müşteri ve seans bilgileri kaydedildi');render();
  };

  if(typeof render==='function')render();
})();