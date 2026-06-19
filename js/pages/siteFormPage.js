import { DATA, CURRENT_USER, UI, ROUTE_PARAM } from '../state.js';
import { t } from '../i18n/i18n.js';
import { go } from '../router.js';
import { addSite, updateSite } from '../data/dataActions.js';
import { ACQ_FIELDS, STA_FIELDS, CONSTRUCTION_FIELDS, ACCEPTANCE_FIELDS, ALL_FIELDS, FILE_SECTION_OPTIONS } from '../constants/fields.js';
import { buildFolderPath, buildFilePath } from '../utils/filePaths.js';
import { fmtDate, escapeHtml } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { render } from '../render.js';

const SECTIONS = [
  { key: 'acq', fields: ACQ_FIELDS },
  { key: 'sta', fields: STA_FIELDS },
  { key: 'construction', fields: CONSTRUCTION_FIELDS },
  { key: 'acceptance', fields: ACCEPTANCE_FIELDS },
];

let formDraft = null;
let originalSnapshot = null;
let draftParam = null;

function blankSiteDraft() {
  const mk = (fields) => Object.fromEntries(fields.map((f) => [f.key, f.type === 'checkbox' ? false : '']));
  const now = new Date().toISOString();
  return {
    site_id: '',
    acq: mk(ACQ_FIELDS),
    sta: mk(STA_FIELDS),
    construction: mk(CONSTRUCTION_FIELDS),
    acceptance: mk(ACCEPTANCE_FIELDS),
    files: [],
    meta: { created_at: now, created_by: CURRENT_USER.username, updated_at: now, updated_by: CURRENT_USER.username },
  };
}

function sectionHasData(sectionKey) {
  if (sectionKey === 'files') return formDraft.files.length > 0;
  return Object.values(formDraft[sectionKey]).some((v) => (typeof v === 'boolean' ? v === true : !!v));
}

function diffChangedFields(original, draft) {
  return ALL_FIELDS.filter((f) => original[f.section][f.key] !== draft[f.section][f.key]).map((f) => ({
    key: f.key,
    old_value: original[f.section][f.key],
    new_value: draft[f.section][f.key],
  }));
}

function syncFormInputs() {
  document.querySelectorAll('.form-field-input').forEach((inp) => {
    if (formDraft[inp.dataset.sec]) formDraft[inp.dataset.sec][inp.dataset.key] = inp.value;
  });
  document.querySelectorAll('.form-field-cb').forEach((cb) => {
    if (formDraft[cb.dataset.sec]) formDraft[cb.dataset.sec][cb.dataset.key] = cb.checked;
  });
  const siteIdInput = document.getElementById('ff-site-id');
  if (siteIdInput) formDraft.site_id = siteIdInput.value;
}

function fieldInputHtml(sectionKey, field, value) {
  if (field.type === 'checkbox') {
    const id = `ff-${sectionKey}-${field.key}`;
    return `
      <div class="cb-field">
        <input type="checkbox" id="${id}" ${value ? 'checked' : ''} data-sec="${sectionKey}" data-key="${field.key}" class="form-field-cb">
        <label for="${id}" style="font-size:13px;">${t(field.label_key)}</label>
      </div>`;
  }
  if (field.type === 'select') {
    return `
      <div class="field" style="margin:0;">
        <label>${t(field.label_key)}</label>
        <select data-sec="${sectionKey}" data-key="${field.key}" class="form-field-input">
          <option value="">—</option>
          ${field.options.map((o) => `<option value="${escapeHtml(o)}" ${value === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
        </select>
      </div>`;
  }
  if (field.type === 'textarea') {
    return `
      <div class="field" style="margin:0;grid-column:span 3;">
        <label>${t(field.label_key)}</label>
        <textarea rows="2" data-sec="${sectionKey}" data-key="${field.key}" class="form-field-input">${escapeHtml(value)}</textarea>
      </div>`;
  }
  return `
    <div class="field" style="margin:0;">
      <label>${t(field.label_key)}</label>
      <input type="${field.type === 'date' ? 'date' : 'text'}" value="${escapeHtml(value)}" data-sec="${sectionKey}" data-key="${field.key}" class="form-field-input">
    </div>`;
}

function sectionTabBodyHtml(section) {
  return `
    <div class="card pad-md">
      <div class="form-grid">
        ${section.fields.map((f) => fieldInputHtml(section.key, f, formDraft[section.key][f.key])).join('')}
      </div>
    </div>`;
}

function filesTabBodyHtml() {
  const folder = buildFolderPath(formDraft.site_id || '[SITE-ID]', DATA.meta.server_base_path);

  return `
    <div class="card pad-md" style="margin-bottom:14px;">
      <div class="path-row" style="padding:0;">
        <code>${escapeHtml(folder)}</code>
        <button class="btn btn-ghost btn-sm" data-copypath="${escapeHtml(folder)}">⧉ ${t('btn_copy_path')}</button>
      </div>
      <div class="warn-note" style="margin-top:10px;">⚠️ ${t('network_warning')}</div>
    </div>
    <div class="card pad-md">
      ${
        formDraft.files.length
          ? formDraft.files
              .map(
                (f, i) => `
        <div class="file-row" style="border-top:${i === 0 ? 'none' : '1px solid var(--border)'};padding-inline:0;">
          <span class="fname">${escapeHtml(f.name)}</span>
          <span class="ftag">${t('section_' + f.section.toLowerCase())}</span>
          <span class="fdate">${fmtDate(f.added_at)}</span>
          <button class="btn btn-ghost btn-sm" data-delfile="${escapeHtml(f.file_id)}">🗑</button>
        </div>`
              )
              .join('')
          : `<p style="color:var(--muted);font-size:12.5px;">${t('no_files')}</p>`
      }
      <div style="border-top:1px solid var(--border);margin-top:12px;padding-top:14px;">
        <p style="font-weight:700;font-size:13px;margin:0 0 10px;">${t('add_file_link')}</p>
        <div class="form-grid" style="grid-template-columns:1.2fr 1.6fr 0.8fr auto;align-items:end;">
          <div class="field" style="margin:0;"><label>${t('file_name')}</label><input id="newfile-name" type="text"></div>
          <div class="field" style="margin:0;"><label>${t('file_path')}</label><input id="newfile-path" type="text"></div>
          <div class="field" style="margin:0;">
            <label>${t('file_section')}</label>
            <select id="newfile-section">${FILE_SECTION_OPTIONS.map((o) => `<option value="${o}">${t('section_' + o.toLowerCase())}</option>`).join('')}</select>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-file" type="button">${t('btn_add')}</button>
        </div>
      </div>
    </div>`;
}

export function renderSiteFormActions() {
  return `
    <button class="btn btn-ghost btn-sm" id="btn-cancel-form">${t('btn_cancel')}</button>
    <button class="btn btn-primary btn-sm" id="btn-save-form">${t('btn_save')}</button>`;
}

export function renderSiteFormPage() {
  const isNew = ROUTE_PARAM === 'new';
  const existingSite = isNew ? null : DATA.sites.find((s) => s.site_id === ROUTE_PARAM);

  if (!isNew && !existingSite) {
    return `<div class="empty-state">${t('site_not_found')}</div>`;
  }

  if (!formDraft || draftParam !== ROUTE_PARAM) {
    formDraft = isNew ? blankSiteDraft() : JSON.parse(JSON.stringify(existingSite));
    originalSnapshot = isNew ? null : JSON.parse(JSON.stringify(existingSite));
    draftParam = ROUTE_PARAM;
    UI.formTab = 'acq';
    UI.siteIdErr = '';
  }

  const tabKeys = [...SECTIONS.map((s) => s.key), 'files'];
  const activeTab = UI.formTab || 'acq';

  const tabsHtml = tabKeys
    .map(
      (key) => `
      <button class="tab ${activeTab === key ? 'active' : ''}" data-tab="${key}">
        ${t('section_' + key)} ${sectionHasData(key) ? '<span class="tabdot"></span>' : ''}
      </button>`
    )
    .join('');

  const section = SECTIONS.find((s) => s.key === activeTab);
  const body = activeTab === 'files' ? filesTabBodyHtml() : sectionTabBodyHtml(section);

  return `
    <div class="card pad-md" style="margin-bottom:16px;max-width:340px;">
      <label style="font-size:12px;font-weight:600;color:var(--text2);">${t('field_site_id')} *</label>
      <input type="text" id="ff-site-id" value="${escapeHtml(formDraft.site_id)}" ${!isNew ? 'disabled' : ''}
        style="margin-top:6px;width:100%;border:1px solid var(--border);border-radius:6px;padding:9px 10px;font-size:13.5px;${!isNew ? 'background:#f3f4f8;color:var(--muted);' : ''}">
      ${UI.siteIdErr ? `<div class="field"><div class="err">${escapeHtml(UI.siteIdErr)}</div></div>` : ''}
    </div>
    <div class="tabs">${tabsHtml}</div>
    ${body}
  `;
}

export function bindSiteFormPageEvents() {
  document.querySelectorAll('.form-field-input').forEach((inp) => {
    inp.addEventListener('change', () => {
      formDraft[inp.dataset.sec][inp.dataset.key] = inp.value;
    });
  });
  document.querySelectorAll('.form-field-cb').forEach((cb) => {
    cb.addEventListener('change', () => {
      formDraft[cb.dataset.sec][cb.dataset.key] = cb.checked;
      render();
    });
  });

  document.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncFormInputs();
      UI.formTab = btn.dataset.tab;
      render();
    });
  });

  const siteIdInput = document.getElementById('ff-site-id');
  siteIdInput?.addEventListener('input', () => {
    formDraft.site_id = siteIdInput.value;
  });

  document.querySelectorAll('[data-copypath]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(btn.dataset.copypath).catch(() => {});
      showToast(t('copied_to_clipboard'));
    });
  });

  const nameInput = document.getElementById('newfile-name');
  const pathInput = document.getElementById('newfile-path');
  nameInput?.addEventListener('input', () => {
    if (!pathInput.dataset.manual) {
      pathInput.value = buildFilePath(formDraft.site_id || '[SITE-ID]', nameInput.value, DATA.meta.server_base_path);
    }
  });
  pathInput?.addEventListener('input', () => {
    pathInput.dataset.manual = 'true';
  });

  document.getElementById('btn-add-file')?.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;
    const path = pathInput.value.trim() || buildFilePath(formDraft.site_id || '[SITE-ID]', name, DATA.meta.server_base_path);
    const section = document.getElementById('newfile-section').value;
    formDraft.files.push({
      file_id: `f${Date.now()}`,
      name,
      path,
      section,
      added_by: CURRENT_USER.username,
      added_at: new Date().toISOString().slice(0, 10),
    });
    render();
  });

  document.querySelectorAll('[data-delfile]').forEach((btn) => {
    btn.addEventListener('click', () => {
      formDraft.files = formDraft.files.filter((f) => f.file_id !== btn.dataset.delfile);
      render();
    });
  });

  document.getElementById('btn-cancel-form')?.addEventListener('click', () => {
    const isNew = ROUTE_PARAM === 'new';
    const target = isNew ? null : ROUTE_PARAM;
    formDraft = null;
    originalSnapshot = null;
    draftParam = null;
    go(isNew ? 'sites' : 'site-detail', target);
  });

  document.getElementById('btn-save-form')?.addEventListener('click', () => {
    syncFormInputs();

    if (!formDraft.site_id.trim()) {
      UI.siteIdErr = t('field_required');
      render();
      return;
    }

    const isNew = ROUTE_PARAM === 'new';
    if (isNew && DATA.sites.some((s) => s.site_id === formDraft.site_id)) {
      UI.siteIdErr = t('field_duplicate');
      render();
      return;
    }

    UI.siteIdErr = '';
    const savedId = formDraft.site_id;

    if (isNew) {
      formDraft.meta.updated_at = new Date().toISOString();
      addSite(formDraft, CURRENT_USER);
    } else {
      const changedFields = diffChangedFields(originalSnapshot, formDraft);
      updateSite(
        ROUTE_PARAM,
        { acq: formDraft.acq, sta: formDraft.sta, construction: formDraft.construction, acceptance: formDraft.acceptance, files: formDraft.files },
        CURRENT_USER,
        changedFields
      );
    }

    formDraft = null;
    originalSnapshot = null;
    draftParam = null;
    showToast(t('site_saved'));
    go('site-detail', savedId);
  });
}
