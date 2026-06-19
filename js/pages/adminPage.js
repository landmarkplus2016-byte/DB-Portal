import { DATA, CURRENT_USER, UI } from '../state.js';
import { t } from '../i18n/i18n.js';
import { saveUsers, updateMeta } from '../data/dataActions.js';
import { buildFolderPath } from '../utils/filePaths.js';
import { fmtDate, escapeHtml } from '../utils/format.js';
import { modalHtml, bindModalDismiss } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { render } from '../render.js';

const ADMIN_TABS = ['users', 'permissions', 'audit'];
const ACTION_BADGE_COLOR = {
  CREATE: ['var(--st-complete-bg)', 'var(--st-complete-tx)'],
  UPDATE: ['#e8ecfd', 'var(--primary-dark)'],
  DELETE: ['#fbeaea', 'var(--danger)'],
};

let userModal = null; // { mode: 'add' | 'edit', userId: string|null, passwordUnlocked: boolean, error: string }
let permAccessDraft = {}; // { [user_id]: 'all' | 'assigned' | 'region' } — unsaved radio selection per row
let pendingAuditFocus = null;

function manageableUsers() {
  return DATA.users.filter((u) => u.user_id !== 'bootstrap-admin');
}

/* ================= USERS TAB ================= */

function usersTabHtml() {
  const rows = manageableUsers()
    .map(
      (u) => `
      <tr>
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.display_name)}</td>
        <td><span class="rolebadge">${t('role_' + u.role)}</span></td>
        <td><span class="toggle-pill ${u.active ? 'on' : ''}" data-toggleactive="${u.user_id}"><span class="knob"></span></span></td>
        <td>
          <button class="btn btn-ghost btn-sm" data-edituser="${u.user_id}">${t('btn_edit')}</button>
          <button class="btn btn-ghost btn-sm" data-deluser="${u.user_id}">${t('btn_delete')}</button>
        </td>
      </tr>`
    )
    .join('');

  return `
    <div class="card">
      <table>
        <thead><tr>
          <th>${t('col_username')}</th><th>${t('col_display_name')}</th><th>${t('col_role')}</th>
          <th>${t('col_status_active')}</th><th>${t('col_actions')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <button class="btn btn-primary btn-sm" style="margin-top:14px;" id="btn-add-user">+ ${t('btn_add_user')}</button>
  `;
}

function userModalHtml() {
  const isEdit = userModal.mode === 'edit';
  const user = isEdit ? DATA.users.find((u) => u.user_id === userModal.userId) : null;
  const roleVal = user?.role || 'data_entry';

  const passwordField =
    isEdit && !userModal.passwordUnlocked
      ? `
      <div class="field">
        <label>${t('password')}</label>
        <div style="display:flex;gap:8px;">
          <input type="text" value="••••••••" disabled style="flex:1;">
          <button type="button" class="btn btn-ghost btn-sm" id="modal-change-password">${t('btn_change')}</button>
        </div>
      </div>`
      : `
      <div class="field">
        <label>${t('password')}</label>
        <input type="text" id="modal-password" value="">
      </div>`;

  const body = `
    <div class="field">
      <label>${t('username')}</label>
      <input type="text" id="modal-username" value="${escapeHtml(user?.username || '')}">
    </div>
    ${passwordField}
    <div class="field">
      <label>${t('col_display_name')}</label>
      <input type="text" id="modal-display" value="${escapeHtml(user?.display_name || '')}">
    </div>
    <div class="field">
      <label>${t('col_role')}</label>
      <select id="modal-role">
        <option value="admin" ${roleVal === 'admin' ? 'selected' : ''}>${t('role_admin')}</option>
        <option value="data_entry" ${roleVal === 'data_entry' ? 'selected' : ''}>${t('role_data_entry')}</option>
        <option value="viewer" ${roleVal === 'viewer' ? 'selected' : ''}>${t('role_viewer')}</option>
      </select>
    </div>
    <div class="cb-field">
      <input type="checkbox" id="modal-active" ${!user || user.active ? 'checked' : ''}>
      <label for="modal-active">${t('field_active')}</label>
    </div>
    ${userModal.error ? `<div class="field"><div class="err">${escapeHtml(userModal.error)}</div></div>` : ''}
  `;

  const foot = `
    <button class="btn btn-ghost btn-sm" id="modal-cancel">${t('btn_cancel')}</button>
    <button class="btn btn-primary btn-sm" id="modal-save">${t('btn_save')}</button>
  `;

  return modalHtml(isEdit ? t('btn_edit') : t('btn_add_user'), body, foot);
}

/* ================= PERMISSIONS TAB ================= */

function permissionRowHtml(u) {
  const access = permAccessDraft[u.user_id] || u.site_access || 'all';
  const sitesVal = (u.allowed_sites || []).join(', ');
  const regionsVal = (u.allowed_regions || []).join(', ');

  return `
    <div data-permrow="${u.user_id}" style="padding:16px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div><b>${escapeHtml(u.display_name)}</b> <span class="rolebadge" style="margin-inline-start:8px;">${t('role_' + u.role)}</span></div>
        <button class="btn btn-primary btn-sm" data-permsave="${u.user_id}">${t('btn_save')}</button>
      </div>
      <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:10px;font-size:12.5px;">
        <label><input type="radio" name="access-${u.user_id}" value="all" data-permaccess="${u.user_id}" ${access === 'all' ? 'checked' : ''}> ${t('site_access_all')}</label>
        <label><input type="radio" name="access-${u.user_id}" value="assigned" data-permaccess="${u.user_id}" ${access === 'assigned' ? 'checked' : ''}> ${t('site_access_assigned')}</label>
        <label><input type="radio" name="access-${u.user_id}" value="region" data-permaccess="${u.user_id}" ${access === 'region' ? 'checked' : ''}> ${t('site_access_region')}</label>
      </div>
      ${
        access === 'assigned'
          ? `<div class="field" style="margin-top:10px;max-width:420px;">
        <label>${t('field_allowed_sites')}</label>
        <input type="text" id="perm-sites-${u.user_id}" value="${escapeHtml(sitesVal)}">
      </div>`
          : ''
      }
      ${
        access === 'region'
          ? `<div class="field" style="margin-top:10px;max-width:420px;">
        <label>${t('field_allowed_regions')}</label>
        <input type="text" id="perm-regions-${u.user_id}" value="${escapeHtml(regionsVal)}">
      </div>`
          : ''
      }
      <div style="display:flex;gap:24px;align-items:center;margin-top:10px;">
        <div style="display:flex;align-items:center;gap:8px;font-size:12.5px;">
          ${t('col_can_export')}
          <span class="toggle-pill ${u.can_export ? 'on' : ''}" data-permexport="${u.user_id}"><span class="knob"></span></span>
        </div>
        ${
          u.role === 'data_entry'
            ? `<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;">
          ${t('col_can_upload_files')}
          <span class="toggle-pill ${u.can_upload_files ? 'on' : ''}" data-permupload="${u.user_id}"><span class="knob"></span></span>
        </div>`
            : ''
        }
      </div>
    </div>`;
}

function permissionsTabHtml() {
  const rows = manageableUsers().map(permissionRowHtml).join('');
  return `<div class="card pad-md">${rows}</div>`;
}

/* ================= AUDIT LOG TAB ================= */

function actionBadgeHtml(action) {
  const [bg, tx] = ACTION_BADGE_COLOR[action] || ['var(--st-new-bg)', 'var(--st-new-tx)'];
  return `<span class="badge" style="background:${bg};color:${tx};">${escapeHtml(action)}</span>`;
}

function auditTabHtml() {
  const filter = (UI.auditFilter || '').trim().toLowerCase();
  let entries = [...DATA.audit_log].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (filter) entries = entries.filter((a) => (a.user || '').toLowerCase().includes(filter));

  const rows = entries
    .map(
      (a) => `
      <tr>
        <td>${fmtDate(a.timestamp)}</td>
        <td>${escapeHtml(a.user)}</td>
        <td>${actionBadgeHtml(a.action)}</td>
        <td>${escapeHtml(a.site_id)}</td>
        <td>${escapeHtml(a.field) || '—'}</td>
        <td>${escapeHtml(a.old_value) || '—'}</td>
        <td>${escapeHtml(a.new_value) || '—'}</td>
      </tr>`
    )
    .join('');

  return `
    <div class="filters-row">
      <input type="text" id="audit-filter" placeholder="${t('audit_filter_placeholder')}" value="${escapeHtml(UI.auditFilter || '')}">
    </div>
    <div class="card">
      ${
        entries.length
          ? `
      <table>
        <thead><tr>
          <th>${t('col_timestamp')}</th><th>${t('col_username')}</th><th>${t('col_action')}</th><th>${t('col_site_id')}</th>
          <th>${t('col_field')}</th><th>${t('col_old_value')}</th><th>${t('col_new_value')}</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`
          : `<div class="empty-state">${t('no_audit_entries')}</div>`
      }
    </div>`;
}

/* ================= SETTINGS ================= */

function settingsSectionHtml() {
  const basePath = DATA.meta.server_base_path || '';
  const preview = buildFolderPath('[SITE-ID]', basePath || 'Z:\\sites\\');

  return `
    <div class="card pad-md" style="margin-top:24px;max-width:420px;">
      <p class="chart-title">${t('settings_title')}</p>
      <div class="field">
        <label>${t('settings_base_path')}</label>
        <input type="text" id="settings-basepath" value="${escapeHtml(basePath)}">
      </div>
      <p style="font-size:11px;color:var(--muted);">${t('settings_preview')} <code>${escapeHtml(preview)}</code></p>
      <p style="font-size:11px;color:var(--muted);">${t('settings_base_path_note')}</p>
      <button class="btn btn-ghost btn-sm" id="btn-save-settings">${t('btn_save')}</button>
    </div>`;
}

/* ================= PAGE ================= */

export function renderAdminPage() {
  const tab = UI.adminTab || 'users';
  const tabsHtml = ADMIN_TABS.map((tb) => `<button class="${tab === tb ? 'active' : ''}" data-admintab="${tb}">${t('tab_' + tb)}</button>`).join('');

  let body = '';
  if (tab === 'users') body = usersTabHtml();
  else if (tab === 'permissions') body = permissionsTabHtml();
  else body = auditTabHtml();

  return `
    <div class="admin-tabs">${tabsHtml}</div>
    ${body}
    ${settingsSectionHtml()}
    ${userModal ? userModalHtml() : ''}
  `;
}

export function bindAdminPageEvents() {
  document.querySelectorAll('[data-admintab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      userModal = null;
      UI.adminTab = btn.dataset.admintab;
      render();
    });
  });

  bindUsersTabEvents();
  bindModalEvents();
  bindPermissionsTabEvents();
  bindAuditTabEvents();
  bindSettingsEvents();
}

function bindUsersTabEvents() {
  document.querySelectorAll('[data-toggleactive]').forEach((pill) => {
    pill.addEventListener('click', () => {
      const user = DATA.users.find((u) => u.user_id === pill.dataset.toggleactive);
      user.active = !user.active;
      saveUsers(DATA.users);
      render();
    });
  });

  document.getElementById('btn-add-user')?.addEventListener('click', () => {
    userModal = { mode: 'add', userId: null, passwordUnlocked: true, error: '' };
    render();
  });

  document.querySelectorAll('[data-edituser]').forEach((btn) => {
    btn.addEventListener('click', () => {
      userModal = { mode: 'edit', userId: btn.dataset.edituser, passwordUnlocked: false, error: '' };
      render();
    });
  });

  document.querySelectorAll('[data-deluser]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = DATA.users.find((u) => u.user_id === btn.dataset.deluser);
      const admins = DATA.users.filter((u) => u.role === 'admin');
      if (target.role === 'admin' && admins.length <= 1) {
        showToast(t('err_last_admin'), 'error');
        return;
      }
      if (!window.confirm(t('confirm_delete_user'))) return;
      saveUsers(DATA.users.filter((u) => u.user_id !== btn.dataset.deluser));
      showToast(t('user_deleted'));
      render();
    });
  });
}

function bindModalEvents() {
  if (!userModal) return;

  bindModalDismiss(() => {
    userModal = null;
    render();
  });

  document.getElementById('modal-cancel')?.addEventListener('click', () => {
    userModal = null;
    render();
  });

  document.getElementById('modal-change-password')?.addEventListener('click', () => {
    userModal.passwordUnlocked = true;
    render();
  });

  document.getElementById('modal-save')?.addEventListener('click', () => {
    const username = document.getElementById('modal-username').value.trim();
    const displayName = document.getElementById('modal-display').value.trim();
    const role = document.getElementById('modal-role').value;
    const active = document.getElementById('modal-active').checked;
    const passwordInput = document.getElementById('modal-password');
    const password = passwordInput ? passwordInput.value.trim() : null;

    if (!username || !displayName || (userModal.mode === 'add' && !password)) {
      userModal.error = t('err_fill_required');
      render();
      return;
    }

    const duplicate = DATA.users.some((u) => u.username === username && u.user_id !== userModal.userId);
    if (duplicate) {
      userModal.error = t('field_duplicate_username');
      render();
      return;
    }

    if (userModal.mode === 'add') {
      DATA.users.push({
        user_id: `u${Date.now()}`,
        username,
        password,
        role,
        display_name: displayName,
        active,
        site_access: 'all',
        allowed_regions: [],
        allowed_sites: [],
        can_export: false,
        can_upload_files: false,
        created_at: new Date().toISOString().slice(0, 10),
        created_by: CURRENT_USER.username,
      });
    } else {
      const user = DATA.users.find((u) => u.user_id === userModal.userId);
      user.username = username;
      user.display_name = displayName;
      user.role = role;
      user.active = active;
      if (password) user.password = password;
    }

    saveUsers(DATA.users);
    userModal = null;
    showToast(t('user_saved'));
    render();
  });
}

function bindPermissionsTabEvents() {
  document.querySelectorAll('[data-permaccess]').forEach((radio) => {
    radio.addEventListener('change', () => {
      permAccessDraft[radio.dataset.permaccess] = radio.value;
      render();
    });
  });

  document.querySelectorAll('[data-permexport]').forEach((pill) => {
    pill.addEventListener('click', () => pill.classList.toggle('on'));
  });
  document.querySelectorAll('[data-permupload]').forEach((pill) => {
    pill.addEventListener('click', () => pill.classList.toggle('on'));
  });

  document.querySelectorAll('[data-permsave]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const userId = btn.dataset.permsave;
      const user = DATA.users.find((u) => u.user_id === userId);
      const access = permAccessDraft[userId] || user.site_access || 'all';
      user.site_access = access;

      if (access === 'assigned') {
        const input = document.getElementById(`perm-sites-${userId}`);
        user.allowed_sites = input.value.split(',').map((s) => s.trim()).filter(Boolean);
      } else if (access === 'region') {
        const input = document.getElementById(`perm-regions-${userId}`);
        user.allowed_regions = input.value.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const exportPill = document.querySelector(`[data-permexport="${userId}"]`);
      if (exportPill) user.can_export = exportPill.classList.contains('on');

      const uploadPill = document.querySelector(`[data-permupload="${userId}"]`);
      if (uploadPill) user.can_upload_files = uploadPill.classList.contains('on');

      delete permAccessDraft[userId];
      saveUsers(DATA.users);
      showToast(t('user_saved'));
      render();
    });
  });
}

function bindAuditTabEvents() {
  const input = document.getElementById('audit-filter');
  input?.addEventListener('input', (e) => {
    pendingAuditFocus = e.target.selectionStart;
    UI.auditFilter = e.target.value;
    render();
  });

  if (pendingAuditFocus !== null) {
    const el = document.getElementById('audit-filter');
    if (el) {
      el.focus();
      el.setSelectionRange(pendingAuditFocus, pendingAuditFocus);
    }
    pendingAuditFocus = null;
  }
}

function bindSettingsEvents() {
  document.getElementById('btn-save-settings')?.addEventListener('click', () => {
    const value = document.getElementById('settings-basepath').value.trim();
    updateMeta({ server_base_path: value });
    showToast(t('settings_saved'));
    render();
  });
}
