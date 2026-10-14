(()=>{
const oldAForm=window.aForm;
window.deleteAppointment16=function(id){
  const a=d.appointments.find(x=>x.id===id);
  if(!a)return;
  const c=cu(a.customerId);
  if(!confirm('Bu randevu silinsin mi?'))return;
  d.appointments=d.appointments.filter(x=>x.id!==id);
  log((c?.name||'Müşteri')+' randevusu silindi');
  save();
  closeM();
  render();
  toast('Randevu silindi');
};
window.aForm=function(id='',cid=''){
  oldAForm(id,cid);
  if(!id)return;
  const footer=document.querySelector('#modalRoot .modal>footer');
  if(!footer)return;
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='appointmentDelete16';
  btn.textContent='Randevuyu Sil';
  btn.addEventListener('click',function(){window.deleteAppointment16(id)});
  footer.prepend(btn);
};
})();
