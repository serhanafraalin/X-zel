(()=>{
const CATALOG=[
{id:'skin_classic_1',category:'Cilt Bakımı',name:'Klasik Cilt Bakımı',price:1500,sessions:1,duration:60},
{id:'skin_medical_1',category:'Cilt Bakımı',name:'Medikal Cilt Bakımı',price:2000,sessions:1,duration:60},
{id:'skin_classic_4',category:'Cilt Bakımı',name:'Klasik Cilt Bakım Paketi',price:3500,sessions:4,duration:60},
{id:'skin_medical_4',category:'Cilt Bakımı',name:'Medikal Cilt Bakım Paketi',price:5500,sessions:4,duration:60},
{id:'hifu_brow',category:'HIFU',name:'Kaş Kaldırma',price:8000,sessions:1,duration:45},
{id:'hifu_chin',category:'HIFU',name:'Gıdı Germe',price:8000,sessions:1,duration:45},
{id:'hifu_chest',category:'HIFU',name:'Göğüs Sıkılaştırma',price:8000,sessions:1,duration:60},
{id:'hifu_hip',category:'HIFU',name:'Kalça Sıkılaştırma',price:8000,sessions:1,duration:60},
{id:'hifu_face',category:'HIFU',name:'Tüm Yüz Germe',price:13000,sessions:1,duration:75},
{id:'bbl_all_4',category:'BBL Lazer',name:'4 Seans Tüm Bölgeler',price:10000,sessions:4,duration:60},
{id:'bbl_2_4',category:'BBL Lazer',name:'2 Bölge · 4 Seans',price:18000,sessions:4,duration:45},
{id:'bbl_3_4',category:'BBL Lazer',name:'3 Bölge · 4 Seans',price:26000,sessions:4,duration:55},
{id:'ems_10',category:'EMS',name:'EMS',price:6000,sessions:10,duration:30},
{id:'ems_chair_8',category:'EMS',name:'EMS Koltuk',price:25000,sessions:8,duration:30},
{id:'ipl_w_full',category:'IPL Lazer · Kadın',name:'Tüm Vücut · Seans',price:1250,sessions:1,duration:60},
{id:'ipl_w_4',category:'IPL Lazer · Kadın',name:'4 Bölge · Seans',price:950,sessions:1,duration:45},
{id:'ipl_w_3',category:'IPL Lazer · Kadın',name:'3 Bölge · Seans',price:750,sessions:1,duration:40},
{id:'ipl_w_arm',category:'IPL Lazer · Kadın',name:'Tüm Kol · Seans',price:300,sessions:1,duration:30},
{id:'ipl_w_halfarm',category:'IPL Lazer · Kadın',name:'Yarım Kol · Seans',price:200,sessions:1,duration:20},
{id:'ipl_w_underarm',category:'IPL Lazer · Kadın',name:'Koltuk Altı · Seans',price:300,sessions:1,duration:20},
{id:'ipl_w_leg',category:'IPL Lazer · Kadın',name:'Tüm Bacak · Seans',price:500,sessions:1,duration:35},
{id:'ipl_w_halfleg',category:'IPL Lazer · Kadın',name:'Yarım Bacak · Seans',price:250,sessions:1,duration:25},
{id:'ipl_w_belly',category:'IPL Lazer · Kadın',name:'Göbek · Seans',price:250,sessions:1,duration:20},
{id:'ipl_w_genital',category:'IPL Lazer · Kadın',name:'Genital Bölge · Seans',price:500,sessions:1,duration:25},
{id:'ipl_w_face',category:'IPL Lazer · Kadın',name:'Tüm Yüz · Seans',price:300,sessions:1,duration:25},
{id:'ipl_w_mustache',category:'IPL Lazer · Kadın',name:'Bıyık · Seans',price:200,sessions:1,duration:15},
{id:'ipl_w_chin',category:'IPL Lazer · Kadın',name:'Çene · Seans',price:200,sessions:1,duration:15},
{id:'ipl_w_pkg',category:'IPL Lazer · Kadın',name:'Tüm Vücut Paket · Kampanya',price:10000,sessions:0,duration:60},
{id:'ipl_m_full',category:'IPL Lazer · Erkek',name:'Tüm Vücut · Seans',price:2000,sessions:1,duration:75},
{id:'ipl_m_4',category:'IPL Lazer · Erkek',name:'4 Bölge · Seans',price:1900,sessions:1,duration:60},
{id:'ipl_m_3',category:'IPL Lazer · Erkek',name:'3 Bölge · Seans',price:1750,sessions:1,duration:50},
{id:'ipl_m_underarm',category:'IPL Lazer · Erkek',name:'Koltuk Altı · Seans',price:500,sessions:1,duration:20},
{id:'ipl_m_arm',category:'IPL Lazer · Erkek',name:'Tüm Kol · Seans',price:500,sessions:1,duration:30},
{id:'ipl_m_leg',category:'IPL Lazer · Erkek',name:'Tüm Bacak · Seans',price:750,sessions:1,duration:40},
{id:'ipl_m_pkg',category:'IPL Lazer · Erkek',name:'Tüm Vücut Paket · Kampanya',price:15000,sessions:0,duration:75},
{id:'diode_w_full',category:'Diode Lazer · Kadın',name:'Tüm Vücut · Seans',price:2000,sessions:1,duration:60},
{id:'diode_w_4',category:'Diode Lazer · Kadın',name:'4 Bölge · Seans',price:1750,sessions:1,duration:45},
{id:'diode_w_3',category:'Diode Lazer · Kadın',name:'3 Bölge · Seans',price:1500,sessions:1,duration:40},
{id:'diode_w_arm',category:'Diode Lazer · Kadın',name:'Tüm Kol · Seans',price:600,sessions:1,duration:30},
{id:'diode_w_halfarm',category:'Diode Lazer · Kadın',name:'Yarım Kol · Seans',price:400,sessions:1,duration:20},
{id:'diode_w_underarm',category:'Diode Lazer · Kadın',name:'Koltuk Altı · Seans',price:500,sessions:1,duration:20},
{id:'diode_w_leg',category:'Diode Lazer · Kadın',name:'Tüm Bacak · Seans',price:700,sessions:1,duration:35},
{id:'diode_w_halfleg',category:'Diode Lazer · Kadın',name:'Yarım Bacak · Seans',price:400,sessions:1,duration:25},
{id:'diode_w_belly',category:'Diode Lazer · Kadın',name:'Göbek · Seans',price:500,sessions:1,duration:20},
{id:'diode_w_genital',category:'Diode Lazer · Kadın',name:'Genital Bölge · Seans',price:750,sessions:1,duration:25},
{id:'diode_w_face',category:'Diode Lazer · Kadın',name:'Tüm Yüz · Seans',price:500,sessions:1,duration:25},
{id:'diode_w_mustache',category:'Diode Lazer · Kadın',name:'Bıyık · Seans',price:300,sessions:1,duration:15},
{id:'diode_w_chin',category:'Diode Lazer · Kadın',name:'Çene · Seans',price:300,sessions:1,duration:15},
{id:'diode_w_pkg',category:'Diode Lazer · Kadın',name:'Tüm Vücut Paket · Kampanya',price:13000,sessions:0,duration:60},
{id:'diode_m_full',category:'Diode Lazer · Erkek',name:'Tüm Vücut · Seans',price:3000,sessions:1,duration:75},
{id:'diode_m_4',category:'Diode Lazer · Erkek',name:'4 Bölge · Seans',price:2750,sessions:1,duration:60},
{id:'diode_m_3',category:'Diode Lazer · Erkek',name:'3 Bölge · Seans',price:2500,sessions:1,duration:50},
{id:'diode_m_underarm',category:'Diode Lazer · Erkek',name:'Koltuk Altı · Seans',price:750,sessions:1,duration:20},
{id:'diode_m_arm',category:'Diode Lazer · Erkek',name:'Tüm Kol · Seans',price:750,sessions:1,duration:30},
{id:'diode_m_leg',category:'Diode Lazer · Erkek',name:'Tüm Bacak · Seans',price:900,sessions:1,duration:40},
{id:'diode_m_pkg',category:'Diode Lazer · Erkek',name:'Tüm Vücut Paket · Kampanya',price:18000,sessions:0,duration:75},
{id:'brow_golden',category:'Kaş',name:'Altın Oran Kaş Tasarımı',price:500,sessions:1,duration:35},
{id:'brow_normal',category:'Kaş',name:'Normal Kaş Alımı',price:300,sessions:1,duration:25}
];

for(const s of CATALOG){if(!data.services.some(x=>x.id===s.id))data.services.push({...s});}
for(const c of data.customers){
  if(!Array.isArray(c.items)){
    c.items=[];
    if(c.serviceId||c.serviceName){
      const old=svc(c.serviceId);
      c.items.push({id:uid('item'),serviceId:c.serviceId||'',name:old?.name||c.serviceName||'Mevcut Paket',price:Number(c.packagePrice||0),sessions:Number(c.totalSessions||0)});
    }
  }
}
save();

let customerDraft=[];
function serviceOptions(selected=''){
  const groups={};
  [...data.services].sort((a,b)=>String(a.category||'Diğer').localeCompare(String(b.category||'Diğer'),'tr')||String(a.name).localeCompare(String(b.name),'tr')).forEach(s=>(groups[s.category||'Diğer']??=[]).push(s));
  return `<option value="">Hizmet / paket seçin</option>`+Object.entries(groups).map(([g,arr])=>`<optgroup label="${esc(g)}">${arr.map(s=>`<option value="${s.id}" ${selected===s.id?'selected':''}>${esc(s.name)} · ${money(s.price)}</option>`).join('')}</optgroup>`).join('');
}
function addCustomerItem(){customerDraft.push({id:uid('item'),serviceId:'',name:'',price:0,sessions:0});renderCustomerItems();}
function removeCustomerItem(id){customerDraft=customerDraft.filter(x=>x.id!==id);renderCustomerItems();}
function changeCustomerItem(id,field,value){const it=customerDraft.find(x=>x.id===id);if(!it)return;if(field==='serviceId'){const s=svc(value);it.serviceId=value;it.name=s?.name||'';it.price=Number(s?.price||0);it.sessions=Number(s?.sessions||0);}else it[field]=field==='price'||field==='sessions'?Number(value||0):value;renderCustomerItems();}
function renderCustomerItems(){const root=document.getElementById('customerItems');if(!root)return;root.innerHTML=customerDraft.length?customerDraft.map(it=>`<div class="packageRow"><div class="field"><label>Hizmet / Paket</label><select onchange="changeCustomerItem('${it.id}','serviceId',this.value)">${serviceOptions(it.serviceId)}</select></div><div class="field"><label>Fiyat</label><input type="number" min="0" value="${Number(it.price||0)}" onchange="changeCustomerItem('${it.id}','price',this.value)"></div><div class="field"><label>Seans</label><input type="number" min="0" value="${Number(it.sessions||0)}" onchange="changeCustomerItem('${it.id}','sessions',this.value)"></div><button class="removePkg" type="button" onclick="removeCustomerItem('${it.id}')">×</button></div>`).join(''):`<div class="sessionHint">Henüz hizmet eklenmedi. “Hizmet ekle” ile müşterinin aldığı işlem veya paketi seçin.</div>`;const total=customerDraft.reduce((a,x)=>a+Number(x.price||0),0);const t=document.getElementById('customerPackageTotal');if(t)t.textContent=money(total);}

openCustomerForm=function(id=''){
 const c=id?cust(id):null;
 customerDraft=(c?.items?.length?c.items:[]).map(x=>({...x,id:x.id||uid('item')}));
 modal(c?'Müşteriyi düzenle':'Yeni müşteri',c?'Müşteri, hizmet ve paket bilgilerini yönetin.':'Müşteriye birden fazla hizmet veya paket ekleyebilirsiniz.',`<div class="formGrid"><div class="field full"><label>Ad soyad</label><input id="cName" value="${esc(c?.name||'')}" placeholder="Ad soyad"></div><div class="field full"><label>Telefon</label><input id="cPhone" value="${esc(c?.phone||'')}" placeholder="05xx xxx xx xx"></div><div class="field full"><div class="packageBuilder"><div class="packageBuilderHead"><div><b>Hizmetler & Paketler</b><span>Aynı müşteriye birden fazla işlem ekleyebilirsiniz.</span></div><button class="softBtn" type="button" onclick="addCustomerItem()">+ Hizmet ekle</button></div><div id="customerItems" class="packageRows"></div><div class="packageTotal"><span>Toplam müşteri hesabı</span><strong id="customerPackageTotal">₺0</strong></div></div></div><div class="field full"><label>Müşteri notları</label><textarea id="cNote" placeholder="Özel not, bölge, tercih, hatırlatma...">${esc(c?.note||'')}</textarea></div></div>`,`<button class="softBtn" onclick="closeModal()">Vazgeç</button>${c?`<button class="dangerBtn" onclick="deleteCustomer('${c.id}')">Sil</button>`:''}<button class="primaryBtn" onclick="saveCustomer('${c?.id||''}')">Kaydet</button>`);
 renderCustomerItems();
};

saveCustomer=function(id=''){
 const name=document.getElementById('cName').value.trim();if(!name)return toast('Ad soyad girin');
 const cleanItems=customerDraft.filter(x=>x.serviceId||x.name).map(x=>({...x,price:Number(x.price||0),sessions:Number(x.sessions||0)}));
 const totalPrice=cleanItems.reduce((a,x)=>a+x.price,0), totalSessions=cleanItems.reduce((a,x)=>a+x.sessions,0);
 const obj={...(id?cust(id):{}),id:id||uid('cust'),name,phone:document.getElementById('cPhone').value.trim(),items:cleanItems,serviceId:cleanItems[0]?.serviceId||'',serviceName:cleanItems.map(x=>x.name).join(' + '),packagePrice:totalPrice,totalSessions,note:document.getElementById('cNote').value.trim(),createdAt:id?(cust(id)?.createdAt||new Date().toISOString()):new Date().toISOString()};
 if(id)data.customers=data.customers.map(x=>x.id===id?obj:x);else data.customers.unshift(obj);
 activity(`${name} ${id?'güncellendi':'müşteri olarak eklendi'}`);save();closeModal();toast('Müşteri kaydedildi');render();
};

function customerItemOptions(customerId,selected=''){
 const c=cust(customerId),items=c?.items||[];
 if(!items.length)return `<option value="">Genel / paket seçilmedi</option>`;
 return items.map(it=>`<option value="${it.id}" ${selected===it.id?'selected':''}>${esc(it.name)} · ${Number(it.sessions||0)?Number(it.sessions)+' seans':'seans sayısı belirtilmedi'}</option>`).join('');
}
function refreshSessionItems(selected=''){const cid=document.getElementById('sCustomer')?.value,el=document.getElementById('sItem');if(el)el.innerHTML=customerItemOptions(cid,selected);updateSessionHint();}
function itemUsed(cid,itemId){return data.sessions.filter(s=>s.customerId===cid&&s.itemId===itemId).length;}
function updateSessionHint(){const cid=document.getElementById('sCustomer')?.value,itemId=document.getElementById('sItem')?.value,el=document.getElementById('sessionHint');if(!el)return;const c=cust(cid),it=c?.items?.find(x=>x.id===itemId);if(!it){el.textContent='Müşteri paketini seçin.';return;}const u=itemUsed(cid,itemId);el.textContent=`${it.name}: Bu kayıt ${u+1}. seans olacak${Number(it.sessions||0)?` · toplam ${it.sessions} seans · kayıt sonrası ${Math.max(0,it.sessions-u-1)} seans kalacak`:''}.`;}

openSessionForm=function(customerId=''){
 if(!data.customers.length)return toast('Önce müşteri ekleyin');
 const first=customerId||data.customers[0]?.id;
 modal('Seans işle','Müşterinin hangi hizmet/paket seansına geldiğini seçin.',`<div class="formGrid"><div class="field full"><label>Müşteri</label><select id="sCustomer" onchange="refreshSessionItems()">${selectCustomers(first)}</select></div><div class="field full"><label>Hizmet / Paket</label><select id="sItem" onchange="updateSessionHint()">${customerItemOptions(first)}</select><div id="sessionHint" class="sessionHint"></div></div><div class="field"><label>Tarih</label><input id="sDate" type="datetime-local" value="${localDT()}"></div><div class="field"><label>Uzman</label><input id="sStaff" placeholder="Opsiyonel"></div><div class="field full"><label>Bu seansta ne yapıldı?</label><textarea id="sNote" placeholder="İşlem bölgesi, cihaz, uygulama notu, gözlem..."></textarea></div></div>`,`<button class="softBtn" onclick="closeModal()">Vazgeç</button><button class="primaryBtn" onclick="saveSession()">Seansı kaydet</button>`);updateSessionHint();
};

saveSession=function(){const customerId=document.getElementById('sCustomer').value,c=cust(customerId),itemId=document.getElementById('sItem').value,it=c?.items?.find(x=>x.id===itemId);if(!c)return;const seq=it?itemUsed(customerId,itemId)+1:data.sessions.filter(s=>s.customerId===customerId).length+1;data.sessions.unshift({id:uid('ses'),customerId,itemId:itemId||'',serviceId:it?.serviceId||'',serviceName:it?.name||'Genel Seans',sequence:seq,date:document.getElementById('sDate').value||new Date().toISOString(),staff:document.getElementById('sStaff').value.trim(),note:document.getElementById('sNote').value.trim()});activity(`${c.name} · ${it?.name||'Seans'} · ${seq}. seans işlendi`);save();closeModal();toast('Seans kaydedildi');render();};

function refreshAppointmentItems(selected=''){const cid=document.getElementById('aCustomer')?.value,el=document.getElementById('aItem');if(el)el.innerHTML=customerItemOptions(cid,selected);}
openAppointmentForm=function(id='',customerId=''){
 if(!data.customers.length)return toast('Önce müşteri ekleyin');const a=id?data.appointments.find(x=>x.id===id):null,first=a?.customerId||customerId||data.customers[0]?.id;
 modal(a?'Rezervasyonu düzenle':'Yeni rezervasyon','Bir sonraki seansın tarihini ve hangi işlem olduğunu kaydedin.',`<div class="formGrid"><div class="field full"><label>Müşteri</label><select id="aCustomer" onchange="refreshAppointmentItems()">${selectCustomers(first)}</select></div><div class="field full"><label>Hizmet / Paket</label><select id="aItem">${customerItemOptions(first,a?.itemId||'')}</select></div><div class="field"><label>Tarih ve saat</label><input id="aStart" type="datetime-local" value="${a?.start?String(a.start).slice(0,16):localDT()}"></div><div class="field"><label>Uzman</label><input id="aStaff" value="${esc(a?.staff||'')}" placeholder="Opsiyonel"></div><div class="field"><label>Durum</label><select id="aStatus">${['Planlandı','Onaylandı','Tamamlandı','Gelmedi','İptal'].map(s=>`<option ${a?.status===s?'selected':''}>${s}</option>`).join('')}</select></div><div class="field full"><label>Not</label><textarea id="aNote">${esc(a?.note||'')}</textarea></div></div>`,`<button class="softBtn" onclick="closeModal()">Vazgeç</button>${a?`<button class="dangerBtn" onclick="deleteAppointment('${a.id}')">Sil</button>`:''}<button class="primaryBtn" onclick="saveAppointment('${a?.id||''}')">Kaydet</button>`);
};
saveAppointment=function(id=''){const customerId=document.getElementById('aCustomer').value,start=document.getElementById('aStart').value,itemId=document.getElementById('aItem').value,c=cust(customerId),it=c?.items?.find(x=>x.id===itemId);if(!customerId||!start)return toast('Müşteri ve tarih seçin');const obj={id:id||uid('appt'),customerId,itemId:itemId||'',serviceId:it?.serviceId||'',serviceName:it?.name||'Genel İşlem',start,status:document.getElementById('aStatus').value,staff:document.getElementById('aStaff').value.trim(),note:document.getElementById('aNote').value.trim()};if(id)data.appointments=data.appointments.map(x=>x.id===id?obj:x);else data.appointments.push(obj);activity(`${c?.name||'Müşteri'} · ${it?.name||'Rezervasyon'} ${id?'güncellendi':'eklendi'}`);save();closeModal();toast('Rezervasyon kaydedildi');render();};

openCustomer=function(id){const c=cust(id);if(!c)return;const its=c.items||[],ses=[...data.sessions.filter(x=>x.customerId===id)].sort((a,b)=>new Date(b.date)-new Date(a.date)),pays=[...data.payments.filter(x=>x.customerId===id)].sort((a,b)=>new Date(b.date)-new Date(a.date)),next=nextAppt(id);modal(c.name,`${c.phone||'Telefon bilgisi yok'}${next?` · Sonraki randevu ${fmtDT(next.start)}`:''}`,`<div class="profileHero"><div class="largeAvatar">${initials(c.name)}</div><div><h3>${esc(c.name)}</h3><p>${esc(c.phone||'Telefon bilgisi yok')}</p></div></div><div class="profileStats"><div class="profileStat"><span>Toplam Hesap</span><b>${money(c.packagePrice)}</b></div><div class="profileStat"><span>Ödenen</span><b style="color:var(--green)">${money(paid(c.id))}</b></div><div class="profileStat"><span>Kalan</span><b style="color:${debt(c)>0?'var(--red)':'var(--green)'}">${money(debt(c))}</b></div><div class="profileStat"><span>Sonraki Randevu</span><b>${next?fmtDate(next.start):'—'}</b></div></div><div class="actionRow"><button onclick="closeModal();openPaymentForm('${c.id}')">Ödeme ekle</button><button onclick="closeModal();openAppointmentForm('', '${c.id}')">Rezervasyon ekle</button><button onclick="closeModal();openSessionForm('${c.id}')">Seans işle</button></div><div class="profilePackages">${its.length?its.map(it=>{const u=itemUsed(c.id,it.id),r=Number(it.sessions||0)?Math.max(0,Number(it.sessions)-u):null;return `<div class="profilePackage"><div class="profilePackageTop"><div><b>${esc(it.name)}</b><small>${money(it.price)}${Number(it.sessions||0)?` · ${it.sessions} seans`:' · Seans sayısı belirtilmedi'}</small></div><span>${Number(it.sessions||0)?`${u}/${it.sessions}`:`${u} seans`}</span></div>${Number(it.sessions||0)?`<div class="progressLine"><span style="width:${Math.min(100,u/it.sessions*100)}%"></span></div><small>${r} seans kaldı</small>`:''}</div>`}).join(''):'<div class="sessionHint">Bu müşteriye henüz hizmet/paket tanımlanmamış.</div>'}</div><div class="profileHistory"><h4>Seans Geçmişi</h4>${ses.length?ses.slice(0,12).map(s=>`<div class="historyLine"><time>${fmtDate(s.date)}</time><div><b>${esc(s.serviceName||'Seans')} · ${s.sequence||''}. seans</b><small>${esc(s.note||'Not yok')}${s.staff?` · ${esc(s.staff)}`:''}</small></div><strong>✓</strong></div>`).join(''):'<div class="sessionHint">Henüz seans kaydı yok.</div>'}</div><div class="profileHistory"><h4>Ödeme Geçmişi</h4>${pays.length?pays.slice(0,12).map(p=>`<div class="historyLine"><time>${fmtDate(p.date)}</time><div><b>${esc(p.method||'Ödeme')}</b><small>${esc(p.note||'')}</small></div><strong style="color:var(--green)">${money(p.amount)}</strong></div>`).join(''):'<div class="sessionHint">Henüz ödeme kaydı yok.</div>'}</div>${c.note?`<div class="profileHistory"><h4>Müşteri Notu</h4><div class="sessionHint">${esc(c.note)}</div></div>`:''}`,`<button class="softBtn" onclick="closeModal()">Kapat</button><button class="primaryBtn" onclick="closeModal();openCustomerForm('${c.id}')">Düzenle</button>`);};

if(typeof render==='function')render();
})();