import { DATA, CURRENT_USER, UI } from '../state.js';
import { t } from '../i18n/i18n.js';
import { go } from '../router.js';
import { filterSitesByPermissions } from '../utils/permissions.js';
import { deriveStatus } from '../utils/siteStatus.js';
import { statusBadgeHtml } from '../components/badge.js';
import { ACQ_FIELDS } from '../constants/fields.js';
import { fmtDate, escapeHtml } from '../utils/format.js';
import { render } from '../render.js';

const TYPOLOGY_OPTIONS = ACQ_FIELDS.find((f) => f.key === 'typology').options;

let pendingFocus = null;

function typologyLabel(value) {
  if (!value) return '—';
  return t('typology_' + value.replace(/\s+/g, ''));
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

export function renderSiteListPage() {
  const sites = getFilteredSites();
  const canEdit = CURRENT_USER.role !== 'viewer';

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
        ${TYPOLOGY_OPTIONS.map(
          (ty) => `<option value="${escapeHtml(ty)}" ${UI.typologyFilter === ty ? 'selected' : ''}>${typologyLabel(ty)}</option>`
        ).join('')}
      </select>
    </div>
    <div class="results-count">${sites.length} ${t('sites_label')}</div>
    <div class="card">
      ${
        sites.length
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
  `;
}

export function bindSiteListPageEvents() {
  document.getElementById('btn-add-site-top')?.addEventListener('click', () => go('site-form', 'new'));

  const searchInput = document.getElementById('site-search');
  searchInput?.addEventListener('input', (e) => {
    pendingFocus = e.target.selectionStart;
    UI.search = e.target.value;
    render();
  });

  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    UI.statusFilter = e.target.value;
    render();
  });
  document.getElementById('filter-typology')?.addEventListener('change', (e) => {
    UI.typologyFilter = e.target.value;
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
