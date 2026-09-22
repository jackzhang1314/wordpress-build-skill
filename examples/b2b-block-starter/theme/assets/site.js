(() => {
  const dialog = document.getElementById('rfq-dialog');
  if (!dialog || !dialog.showModal) return;
  let trigger, origin;
  const slot = dialog.querySelector('.rfq-modal-slot');
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.rfq-trigger a, a.rfq-trigger');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const host = document.querySelector('.rfq-form-host');
    if (!host) return;
    event.preventDefault(); trigger = link;
    if (!dialog.contains(host)) { origin = host.parentNode; slot.appendChild(host); }
    const product = host.querySelector('input[name="product_id"]');
    const id = link.dataset.inquiryProduct || '';
    if (product) product.value = id;
    host.querySelector('.rfq-context').textContent = id ? `Enquiry for ${link.dataset.inquiryModel || 'this machine'}` : 'General equipment enquiry';
    dialog.showModal(); document.documentElement.classList.add('dialog-open');
    host.querySelector('input:not([type="hidden"]), textarea')?.focus();
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close(); } });
  dialog.addEventListener('close', () => { const host=dialog.querySelector('.rfq-form-host');if(origin&&host){origin.appendChild(host);origin=null;}document.documentElement.classList.remove('dialog-open');trigger?.focus(); });
})();
