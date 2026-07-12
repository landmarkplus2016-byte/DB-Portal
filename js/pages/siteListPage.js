import { DATA, CURRENT_USER, UI } from '../state.js';
import { t } from '../i18n/i18n.js';
import { go } from '../router.js';
import { filterSitesByPermissions } from '../utils/permissions.js';
import { deriveStatus } from '../utils/siteStatus.js';
import { statusBadgeHtml } from '../components/badge.js';
import { getFieldOptions } from '../constants/fields.js';
import { fmtDate, escapeHtml } from '../utils/format.js';
import { render } from '../render.js';

const PAGE_SIZE = 50;

let pendingFocus = null;

// Built-in typologies have translated labels; admin-added custom values are shown as-is.
function typologyLabel(value) {
  if (!value) return '—';
  const key = 'typology_' + value.replace(/\s+/g, '');
  const tr = t(key);
  return tr === key ? value : tr;
}

function getFilteredSites() {
  let sites = filterSitesByPermissions(DATA.sites, CURRENT_USER);

  const q = (UI.search || '').trim().toLowerCase();
  if (q) {
    sites = sites.filter((s) =>
      [s.site_id, s.acq.address, s.acq.acquisition_manager, s.acq.owner, s.acq.negotiator].some((v) =>
        (v || '').toLowerCase().includes(q)
      )
    );
  }

  if (UI.statusFilter) {
    sites = sites.filter((s) => deriveStatus(s) === UI.statusFilter);
  }
  if (UI.typologyFilter) {
    sites = sites.filter((s) => s.acq.typology === UI.typologyFilter);
  }

  return sites;
}

export function renderSiteListActions() {
  if (CURRENT_USER.role === 'viewer') return '';
  return `<button class="btn btn-primary btn-sm" id="btn-add-site-top">+ ${t('btn_add_site')}</button>`;
}

function pagerHtml(page, totalPages) {
  return `
    <div class="pager">
      <button class="btn btn-ghost btn-sm" id="pager-prev" ${page <= 1 ? 'disabled' : ''}>${t('btn_prev')}</button>
      <span class="pager-info">${t('pager_page')} ${page} / ${totalPages}</span>
      <button class="btn btn-ghost btn-sm" id="pager-next" ${page >= totalPages ? 'disabled' : ''}>${t('btn_next')}</button>
    </div>`;
}

export function renderSiteListPage() {
  const allSites = getFilteredSites();
  const canEdit = CURRENT_USER.role !== 'viewer';

  const totalPages = Math.max(1, Math.ceil(allSites.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, UI.sitePage || 1), totalPages);
  const sites = allSites.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const rowsHtml = sites
    .map((s) => {
      const status = deriveStatus(s);
      return `
        <tr data-site="${escapeHtml(s.site_id)}">
          <td><b>${escapeHtml(s.site_id)}</b></td>
          <td>${escapeHtml(s.acq.address) || '—'}</td>
          <td>${escapeHtml(s.acq.acquisition_manager) || '—'}</td>
          <td>${typologyLabel(s.acq.typology)}</td>
          <td>${statusBadgeHtml(status)}</td>
          <td>${fmtDate(s.meta.updated_at)}</td>
          <td>
            <button class="btn btn-ghost btn-sm" data-view="${escapeHtml(s.site_id)}">${t('btn_view')}</button>
            ${canEdit ? `<button class="btn btn-ghost btn-sm" data-edit="${escapeHtml(s.site_id)}">${t('btn_edit')}</button>` : ''}
          </td>
        </tr>`;
    })
    .join('');

  return `
    <div class="filters-row">
      <input type="text" id="site-search" placeholder="${t('search_placeholder')}" value="${escapeHtml(UI.search || '')}">
      <select id="filter-status">
        <option value="">${t('filter_status_all')}</option>
        <option value="Complete" ${UI.statusFilter === 'Complete' ? 'selected' : ''}>${t('status_complete')}</option>
        <option value="In progress" ${UI.statusFilter === 'In progress' ? 'selected' : ''}>${t('status_in_progress')}</option>
        <option value="New" ${UI.statusFilter === 'New' ? 'selected' : ''}>${t('status_new')}</option>
      </select>
      <select id="filter-typology">
        <option value="">${t('filter_typology_all')}</option>
        ${getFieldOptions('typology')
          .map((ty) => `<option value="${escapeHtml(ty)}" ${UI.typologyFilter === ty ? 'selected' : ''}>${typologyLabel(ty)}</option>`)
          .join('')}
      </select>
    </div>
    <div class="results-count">${allSites.length} ${t('sites_label')}</div>
    <div class="card">
      ${
        allSites.length
          ? `
      <table>
        <thead><tr>
          <th>${t('col_site_id')}</th><th>${t('col_address')}</th><th>${t('col_manager')}</th>
          <th>${t('col_typology')}</th><th>${t('col_status')}</th><th>${t('col_updated')}</th><th>${t('col_actions')}</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`
          : `<div class="empty-state"><div class="ic">🗂️</div>${t('empty_sites')}</div>`
      }
    </div>
    ${totalPages > 1 ? pagerHtml(page, totalPages) : ''}
  `;
}

export function bindSiteListPageEvents() {
  document.getElementById('btn-add-site-top')?.addEventListener('click', () => go('site-form', 'new'));

  const searchInput = document.getElementById('site-search');
  searchInput?.addEventListener('input', (e) => {
    pendingFocus = e.target.selectionStart;
    UI.search = e.target.value;
    UI.sitePage = 1;
    render();
  });

  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    UI.statusFilter = e.target.value;
    UI.sitePage = 1;
    render();
  });
  document.getElementById('filter-typology')?.addEventListener('change', (e) => {
    UI.typologyFilter = e.target.value;
    UI.sitePage = 1;
    render();
  });

  document.getElementById('pager-prev')?.addEventListener('click', () => {
    UI.sitePage = (UI.sitePage || 1) - 1;
    render();
  });
  document.getElementById('pager-next')?.addEventListener('click', () => {
    UI.sitePage = (UI.sitePage || 1) + 1;
    render();
  });

  document.querySelectorAll('tbody tr[data-site]').forEach((tr) => {
    tr.addEventListener('click', () => go('site-detail', tr.dataset.site));
  });
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      go('site-detail', btn.dataset.view);
    });
  });
  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      go('site-form', btn.dataset.edit);
    });
  });

  if (pendingFocus !== null) {
    const el = document.getElementById('site-search');
    if (el) {
      el.focus();
      el.setSelectionRange(pendingFocus, pendingFocus);
    }
    pendingFocus = null;
  }
}
