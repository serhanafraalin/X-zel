(()=>{
  const MARK='luminae_seed_2026_10_13_v1';
  if(localStorage.getItem(MARK)) return;
  if(typeof data==='undefined'||typeof save!=='function'||typeof uid!=='function') return;

  const rows=[
    {name:'Furkan ve Okan Alanda',paid:9000,remaining:21000,note:'13.10.2026 kağıt kaydı: 9.000 TL ödeme yapıldı, 21.000 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Sait Kızılboğa',paid:7250,remaining:10750,note:'13.10.2026 kağıt kaydı: 7.250 TL ödeme yapıldı, 10.750 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Kadir Çelik',paid:5000,remaining:10000,note:'13.10.2026 kağıt kaydı: 5.000 TL ödeme alındı, 10.000 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'İsa Karadağlı',paid:10000,remaining:10000,note:'13.10.2026 kağıt kaydı: 10.000 TL ödeme alındı, 10.000 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Hasan Alanda',paid:3000,remaining:12000,note:'13.10.2026 kağıt kaydı: 3.000 TL ödeme alındı, 12.000 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Mazlum Tahir Kadir',paid:4000,remaining:9000,note:'13.10.2026 kağıt kaydı: 4.000 TL ödeme alındı, 9.000 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Berfin Kılıç',paid:4000,remaining:14500,note:'13.10.2026 kağıt kaydı: 4.000 TL ödeme alındı. Kalan: 12.000 TL lazer + 2.500 TL kozmetik = 14.500 TL.',serviceName:'Lazer Epilasyon + Kozmetik'},
    {name:'Sümeyra Kılıç',paid:1000,remaining:12000,note:'13.10.2026 kağıt kaydı: 1.000 TL ödeme alındı, 12.000 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Naim Gündü',paid:2500,remaining:2500,note:'13.10.2026 kağıt kaydı: 2.500 TL ödeme alındı, 2.500 TL kaldı.',serviceName:'Paket / işlem bilgisi belirtilmedi'},
    {name:'Gülsüm Karaboy',paid:6000,remaining:5000,note:'13.10.2026 kağıt kaydı: 6.000 TL ödeme alındı. Kalan 5.000 TL: 4.000 TL ana bakiye + 1.000 TL kozmetik.',serviceName:'Paket + Kozmetik'}
  ];

  const normalize=s=>String(s||'').trim().toLocaleLowerCase('tr-TR');
  for(const r of rows){
    let c=data.customers.find(x=>normalize(x.name)===normalize(r.name));
    if(!c){
      c={id:uid('cust'),name:r.name,phone:'',serviceId:'',serviceName:r.serviceName,packagePrice:r.paid+r.remaining,totalSessions:0,note:r.note,createdAt:'2026-10-13T12:00:00+03:00'};
      data.customers.unshift(c);
    }else{
      c.packagePrice=Math.max(Number(c.packagePrice||0),r.paid+r.remaining);
      c.serviceName=c.serviceName||r.serviceName;
      c.note=[c.note,r.note].filter(Boolean).join('\n');
    }
    const exists=data.payments.some(p=>p.customerId===c.id&&Number(p.amount)===r.paid&&String(p.date).startsWith('2026-10-13'));
    if(!exists){
      data.payments.unshift({id:uid('pay'),customerId:c.id,amount:r.paid,method:'Belirtilmedi',date:'2026-10-13T12:00:00+03:00',note:'13.10.2026 el yazısı ödeme kaydı'});
    }
  }
  if(typeof activity==='function') activity('13.10.2026 tarihli 10 müşteri ödeme/alacak kaydı içe aktarıldı');
  save();
  localStorage.setItem(MARK,'1');
  if(typeof render==='function') render();
})();