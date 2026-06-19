import { DATA, CURRENT_USER, UI } from '../state.js';
import { t, getLanguage } from '../i18n/i18n.js';
import { filterSitesByPermissions } from '../utils/permissions.js';
import { deriveStatus } from '../utils/siteStatus.js';
import { ACQ_FIELDS } from '../constants/fields.js';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportHelpers.js';
import { showToast } from '../components/toast.js';
import { render } from '../render.js';

const TYPOLOGY_OPTIONS = ACQ_FIELDS.find((f) => f.key === 'typology').options;

function typologyLabel(value) {
  return t('typology_' + value.replace(/\s+/g, ''));
}

function getFilteredSites() {
  let sites = filterSitesByPermissions(DATA.sites, CURRENT_USER);
  if (UI.exStatus) sites = sites.filter((s) => deriveStatus(s) === UI.exStatus);
  if (UI.exTypology) sites = sites.filter((s) => s.acq.typology === UI.exTypology);
  return sites;
}

export function renderExportPage() {
  const sites = getFilteredSites();

  return `
    <div class="card pad-md">
      <p class="chart-title">${t('export_filters')}</p>
      <div class="filters-row" style="margin-bottom:0;">
        <select id="ex-status">
          <option value="">${t('filter_status_all')}</option>
          <option value="Complete" ${UI.exStatus === 'Complete' ? 'selected' : ''}>${t('status_complete')}</option>
          <option value="In progress" ${UI.exStatus === 'In progress' ? 'selected' : ''}>${t('status_in_progress')}</option>
          <option value="New" ${UI.exStatus === 'New' ? 'selected' : ''}>${t('status_new')}</option>
        </select>
        <select id="ex-typology">
          <option value="">${t('filter_typology_all')}</option>
          ${TYPOLOGY_OPTIONS.map(
            (ty) => `<option value="${ty}" ${UI.exTypology === ty ? 'selected' : ''}>${typologyLabel(ty)}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    <p class="results-count" style="margin-top:14px;">${sites.length} ${t('export_match')}</p>
    <div class="export-grid">
      <div class="card export-card" id="export-excel">
        <div class="eicon">📊</div>
        <h4>${t('export_excel')}</h4>
        <p>${t('export_excel_d')}</p>
        <button class="btn btn-primary btn-sm">${t('btn_download')}</button>
      </div>
      <div class="card export-card" id="export-csv">
        <div class="eicon">🧾</div>
        <h4>${t('export_csv')}</h4>
        <p>${t('export_csv_d')}</p>
        <button class="btn btn-primary btn-sm">${t('btn_download')}</button>
      </div>
      <div class="card export-card" id="export-pdf">
        <div class="eicon">🗎</div>
        <h4>${t('export_pdf')}</h4>
        <p>${t('export_pdf_d')}</p>
        <button class="btn btn-primary btn-sm">${t('btn_download')}</button>
      </div>
    </div>
  `;
}

export function bindExportPageEvents() {
  document.getElementById('ex-status')?.addEventListener('change', (e) => {
    UI.exStatus = e.target.value;
    render();
  });
  document.getElementById('ex-typology')?.addEventListener('change', (e) => {
    UI.exTypology = e.target.value;
    render();
  });

  document.getElementById('export-excel')?.addEventListener('click', () => {
    exportToExcel(getFilteredSites(), getLanguage());
    showToast(t('export_done'));
  });
  document.getElementById('export-csv')?.addEventListener('click', () => {
    exportToCSV(getFilteredSites());
    showToast(t('export_done'));
  });
  document.getElementById('export-pdf')?.addEventListener('click', () => {
    exportToPDF(getFilteredSites(), getLanguage());
    showToast(t('export_done'));
  });
}
