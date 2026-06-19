import { CURRENT_USER, IS_DIRTY } from '../state.js';
import { t } from '../i18n/i18n.js';
import { exportJSON } from '../data/dataActions.js';
import { render } from '../render.js';
import { escapeHtml } from '../utils/format.js';

export function renderTopbar(title, sub, actionsHtml) {
  const canExportJson = CURRENT_USER.role === 'admin' || CURRENT_USER.role === 'data_entry';

  return `
    <div class="topbar">
      <div>
        <h1>${escapeHtml(title ?? '')}</h1>
        ${sub ? `<div class="sub">${escapeHtml(sub)}</div>` : ''}
      </div>
      <div class="topbar-actions">
        ${IS_DIRTY ? `<div class="dirty-indicator"><span class="dirty-dot"></span>${t('unsaved_changes')}</div>` : ''}
        ${canExportJson ? `<button class="btn btn-ghost btn-sm" id="btn-export-json">⇩ ${t('btn_export_json')}</button>` : ''}
        ${actionsHtml || ''}
      </div>
    </div>
  `;
}

export function bindTopbarEvents() {
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    exportJSON(CURRENT_USER);
    render();
  });
}
