import { DATA, CURRENT_USER, ROUTE_PARAM } from '../state.js';
import { t } from '../i18n/i18n.js';
import { go } from '../router.js';
import { canEditSite } from '../utils/permissions.js';
import { deriveStatus } from '../utils/siteStatus.js';
import { statusBadgeHtml } from '../components/badge.js';
import { ACQ_FIELDS, STA_FIELDS, CONSTRUCTION_FIELDS, ACCEPTANCE_FIELDS } from '../constants/fields.js';
import { buildFolderPath, toFileUrl } from '../utils/filePaths.js';
import { fileLinkRowHtml } from '../components/fileLinkRow.js';
import { fmtDate, escapeHtml } from '../utils/format.js';
import { showToast } from '../components/toast.js';

const SECTIONS = [
  { key: 'acq', fields: ACQ_FIELDS, color: 'var(--primary)' },
  { key: 'sta', fields: STA_FIELDS, color: 'var(--purple)' },
  { key: 'construction', fields: CONSTRUCTION_FIELDS, color: 'var(--teal)' },
  { key: 'acceptance', fields: ACCEPTANCE_FIELDS, color: 'var(--warning)' },
];

function fieldValue(site, field) {
  const sec = site[field.section];
  return sec ? sec[field.key] : '';
}

function fieldDispHtml(site, field) {
  const value = fieldValue(site, field);

  if (field.type === 'checkbox') {
    const chip = value ? `<span class="chip-yes">✓ Yes</span>` : `<span class="chip-no">– No</span>`;
    return `<div class="field-disp"><div class="lbl">${t(field.label_key)}</div><div class="val">${chip}</div></div>`;
  }

  const display = field.type === 'date' ? (value ? fmtDate(value) : '') : value;
  return `
    <div class="field-disp">
      <div class="lbl">${t(field.label_key)}</div>
      <div class="val ${display ? '' : 'muted'}">${display ? escapeHtml(display) : t('no_value')}</div>
    </div>`;
}

function sectionPanelHtml(site, section) {
  return `
    <div class="card section-panel">
      <div class="section-head"><span class="section-dot" style="background:${section.color}"></span><h3>${t('section_' + section.key)}</h3></div>
      <div class="field-grid">
        ${section.fields.map((f) => fieldDispHtml(site, f)).join('')}
      </div>
    </div>`;
}

export function renderSiteDetailPage() {
  const site = DATA.sites.find((s) => s.site_id === ROUTE_PARAM);
  if (!site) {
    return `<div class="empty-state">${t('site_not_found')}</div>`;
  }

  const status = deriveStatus(site);
  const canEdit = canEditSite(CURRENT_USER, site);
  const folder = buildFolderPath(site.site_id, DATA.meta.server_base_path);

  return `
    <div class="detail-head">
      <button class="btn btn-ghost btn-sm" id="btn-back">← ${t('back')}</button>
      <h2 style="margin:0;font-size:18px;">${escapeHtml(site.site_id)}</h2>
      <span style="color:var(--muted);font-size:13px;">${escapeHtml(site.acq.address) || ''}</span>
      ${statusBadgeHtml(status)}
      ${canEdit ? `<button class="btn btn-primary btn-sm" style="margin-inline-start:auto;" id="btn-edit-site">${t('btn_edit')}</button>` : ''}
    </div>
    ${SECTIONS.map((section) => sectionPanelHtml(site, section)).join('')}
    <div class="card section-panel">
      <div class="section-head"><span class="section-dot" style="background:var(--text2)"></span><h3>${t('section_files')}</h3></div>
      <div class="path-row">
        <code>${escapeHtml(folder)}</code>
        <button class="btn btn-ghost btn-sm" data-openfolder="${escapeHtml(folder)}">📁 ${t('btn_open_folder')}</button>
        <button class="btn btn-ghost btn-sm" data-copypath="${escapeHtml(folder)}">⧉ ${t('btn_copy_path')}</button>
      </div>
      <div style="padding:0 18px;"><div class="warn-note">⚠️ ${t('network_warning')}</div></div>
      ${
        site.files.length
          ? site.files.map(fileLinkRowHtml).join('')
          : `<div class="empty-state" style="padding:24px;">${t('no_files')}</div>`
      }
    </div>
  `;
}

export function bindSiteDetailPageEvents() {
  document.getElementById('btn-back')?.addEventListener('click', () => go('sites'));
  document.getElementById('btn-edit-site')?.addEventListener('click', () => go('site-form', ROUTE_PARAM));

  document.querySelectorAll('[data-openfolder]').forEach((btn) => {
    btn.addEventListener('click', () => window.open(toFileUrl(btn.dataset.openfolder), '_blank'));
  });
  document.querySelectorAll('[data-copypath]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(btn.dataset.copypath).catch(() => {});
      showToast(t('copied_to_clipboard'));
    });
  });
}
