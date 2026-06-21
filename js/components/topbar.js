import { CURRENT_USER, IS_DIRTY, DATA, setCurrentUser } from '../state.js';
import { t } from '../i18n/i18n.js';
import { saveToFile, refreshFromFile, isFileConnected } from '../data/dataActions.js';
import { logout } from '../data/auth.js';
import { render } from '../render.js';
import { go } from '../router.js';
import { showToast } from './toast.js';
import { escapeHtml } from '../utils/format.js';

export function renderTopbar(title, sub, actionsHtml) {
  const canSave = (CURRENT_USER.role === 'admin' || CURRENT_USER.role === 'data_entry') && isFileConnected();
  const canRefresh = isFileConnected();

  return `
    <div class="topbar">
      <div>
        <h1>${escapeHtml(title ?? '')}</h1>
        ${sub ? `<div class="sub">${escapeHtml(sub)}</div>` : ''}
      </div>
      <div class="topbar-actions">
        ${IS_DIRTY ? `<div class="dirty-indicator"><span class="dirty-dot"></span>${t('unsaved_changes')}</div>` : ''}
        ${canRefresh ? `<button class="btn btn-ghost btn-sm" id="btn-refresh-data">⟳ ${t('btn_refresh_data')}</button>` : ''}
        ${canSave ? `<button class="btn btn-primary btn-sm" id="btn-save-data">💾 ${t('btn_save_file')}</button>` : ''}
        ${actionsHtml || ''}
      </div>
    </div>
  `;
}

export function bindTopbarEvents() {
  document.getElementById('btn-save-data')?.addEventListener('click', async () => {
    const result = await saveToFile(CURRENT_USER);
    showToast(result.ok ? t('save_done') : t('save_failed'), result.ok ? undefined : 'error');
    render();
  });

  document.getElementById('btn-refresh-data')?.addEventListener('click', async () => {
    if (IS_DIRTY && !window.confirm(t('confirm_refresh_dirty'))) return;

    const result = await refreshFromFile();
    if (!result.ok) {
      showToast(t('refresh_failed'), 'error');
      return;
    }

    const stillValid = DATA.users.find((u) => u.username === CURRENT_USER.username && u.active);
    if (!stillValid) {
      showToast(t('account_removed'), 'error');
      logout();
      go('login');
      return;
    }

    setCurrentUser(stillValid);
    showToast(t('refresh_done'));
    render();
  });
}
