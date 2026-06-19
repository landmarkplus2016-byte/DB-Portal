export function showToast(msg, type) {
  const el = document.createElement('div');
  el.className = type === 'error' ? 'toast error' : 'toast';
  el.textContent = msg;
  document.body.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 2000);
}
