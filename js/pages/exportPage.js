import { DATA, CURRENT_USER, UI } from '../state.js';
import { t, getLanguage } from '../i18n/i18n.js';
import { filterSitesByPermissions } from '../utils/permissions.js';
import { deriveStatus } from '../utils/siteStatus.js';
import { getFieldOptions } from '../constants/fields.js';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportHelpers.js';
import { escapeHtml } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { render } from '../render.js';

const PDF_EXPORT_LIMIT = 100;
const SPREADSHEET_EXPORT_LIMIT = 5000;

function typologyLabel(value) {
  const key = 'typology_' + value.replace(/\s+/g, '');
  const tr = t(key);
  return tr === key ? value : tr;
}

function getFilteredSites() {
  let sites = filterSitesByPermissions(DATA.sites, CURRENT_USER);
  if (UI.exStatus) sites = sites.filter((s) => deriveStatus(s) === UI.exStatus);
  if (UI.exTypology) sites = sites.filter((s) => s.acq.typology === UI.exTypology);
  return sites;
}

export function renderExportPage() {
  const sites = getFilteredSites();
  const overSpreadsheetLimit = sites.length > SPREADSHEET_EXPORT_LIMIT;
  const overPdfLimit = sites.length > PDF_EXPORT_LIMIT;

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
          ${getFieldOptions('typology')
            .map((ty) => `<option value="${escapeHtml(ty)}" ${UI.exTypology === ty ? 'selected' : ''}>${typologyLabel(ty)}</option>`)
            .join('')}
        </select>
      </div>
    </div>
    <p class="results-count" style="margin-top:14px;">${sites.length} ${t('export_match')}</p>
    <div class="export-grid">
      <div class="card export-card" id="export-excel">
        <div class="eicon">📊</div>
        <h4>${t('export_excel')}</h4>
        <p>${t('export_excel_d')}</p>
        <button class="btn btn-primary btn-sm" ${overSpreadsheetLimit ? 'disabled' : ''}>${t('btn_download')}</button>
        ${overSpreadsheetLimit ? `<p class="export-limit-note">${t('export_limit_spreadsheet').replace('{max}', SPREADSHEET_EXPORT_LIMIT)}</p>` : ''}
      </div>
      <div class="card export-card" id="export-csv">
        <div class="eicon">🧾</div>
        <h4>${t('export_csv')}</h4>
        <p>${t('export_csv_d')}</p>
        <button class="btn btn-primary btn-sm" ${overSpreadsheetLimit ? 'disabled' : ''}>${t('btn_download')}</button>
        ${overSpreadsheetLimit ? `<p class="export-limit-note">${t('export_limit_spreadsheet').replace('{max}', SPREADSHEET_EXPORT_LIMIT)}</p>` : ''}
      </div>
      <div class="card export-card" id="export-pdf">
        <div class="eicon">🗎</div>
        <h4>${t('export_pdf')}</h4>
        <p>${t('export_pdf_d')}</p>
        <button class="btn btn-primary btn-sm" ${overPdfLimit ? 'disabled' : ''}>${t('btn_download')}</button>
        ${overPdfLimit ? `<p class="export-limit-note">${t('export_limit_pdf').replace('{max}', PDF_EXPORT_LIMIT)}</p>` : ''}
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
    const sites = getFilteredSites();
    if (sites.length > SPREADSHEET_EXPORT_LIMIT) {
      showToast(t('export_limit_spreadsheet').replace('{max}', SPREADSHEET_EXPORT_LIMIT), 'error');
      return;
    }
    exportToExcel(sites, getLanguage());
    showToast(t('export_done'));
  });
  document.getElementById('export-csv')?.addEventListener('click', () => {
    const sites = getFilteredSites();
    if (sites.length > SPREADSHEET_EXPORT_LIMIT) {
      showToast(t('export_limit_spreadsheet').replace('{max}', SPREADSHEET_EXPORT_LIMIT), 'error');
      return;
    }
    exportToCSV(sites);
    showToast(t('export_done'));
  });
  document.getElementById('export-pdf')?.addEventListener('click', () => {
    const sites = getFilteredSites();
    if (sites.length > PDF_EXPORT_LIMIT) {
      showToast(t('export_limit_pdf').replace('{max}', PDF_EXPORT_LIMIT), 'error');
      return;
    }
    exportToPDF(sites, getLanguage());
    showToast(t('export_done'));
  });
}
