export function modalHtml(title, bodyHtml, footHtml) {
  return `
    <div class="overlay" id="modal-overlay">
      <div class="modal">
        <h3>${title}</h3>
        <div class="modal-body">${bodyHtml}</div>
        <div class="modal-foot">${footHtml}</div>
      </div>
    </div>
  `;
}

export function bindModalDismiss(onClose) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose();
  });

  function onKeydown(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', onKeydown);
      onClose();
    }
  }
  document.addEventListener('keydown', onKeydown);
}
