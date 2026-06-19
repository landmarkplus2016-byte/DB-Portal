import { ACQ_FIELDS, STA_FIELDS, CONSTRUCTION_FIELDS, ACCEPTANCE_FIELDS, ALL_FIELDS } from '../constants/fields.js';
import { deriveStatus } from './siteStatus.js';
import { getLanguage } from '../i18n/i18n.js';
import { en } from '../i18n/en.js';
import { ar } from '../i18n/ar.js';

const STRINGS = { en, ar };
const SECTION_GROUPS = [
  { key: 'acq', fields: ACQ_FIELDS, label_key: 'section_acq' },
  { key: 'sta', fields: STA_FIELDS, label_key: 'section_sta' },
  { key: 'construction', fields: CONSTRUCTION_FIELDS, label_key: 'section_construction' },
  { key: 'acceptance', fields: ACCEPTANCE_FIELDS, label_key: 'section_acceptance' },
];

function tFor(lang, key) {
  return STRINGS[lang]?.[key] ?? key;
}

function statusLabelKey(status) {
  if (status === 'Complete') return 'status_complete';
  if (status === 'In progress') return 'status_in_progress';
  return 'status_new';
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function headerMap() {
  const map = { site_id: 'field_site_id', status: 'col_status', updated_at: 'col_updated' };
  ALL_FIELDS.forEach((f) => {
    map[f.key] = f.label_key;
  });
  return map;
}

function translateRow(row, map, lang) {
  const out = {};
  Object.keys(row).forEach((k) => {
    out[tFor(lang, map[k] || k)] = row[k];
  });
  return out;
}

export function flattenSiteForExcel(site) {
  const flat = { site_id: site.site_id, status: deriveStatus(site) };
  ALL_FIELDS.forEach((f) => {
    flat[f.key] = (site[f.section] || {})[f.key];
  });
  flat.updated_at = site.meta?.updated_at || '';
  return flat;
}

export function exportToExcel(sites, lang) {
  const map = headerMap();
  const rows = sites.map((s) => translateRow(flattenSiteForExcel(s), map, lang));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sites');
  XLSX.writeFile(wb, `LMP-Export-${dateStamp()}.xlsx`);
}

export function exportToCSV(sites) {
  const lang = getLanguage();
  const map = headerMap();
  const rows = sites.map((s) => translateRow(flattenSiteForExcel(s), map, lang));
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadBlob(csv, `LMP-Export-${dateStamp()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToPDF(sites, lang) {
  const doc = new jspdf.jsPDF();

  sites.forEach((site, idx) => {
    if (idx > 0) doc.addPage();
    const status = deriveStatus(site);

    doc.setFontSize(16);
    doc.text(String(site.site_id || ''), 14, 16);
    doc.setFontSize(11);
    doc.text(site.acq?.address || '', 14, 23);
    doc.text(`${tFor(lang, 'col_status')}: ${tFor(lang, statusLabelKey(status))}`, 14, 29);

    let y = 36;
    SECTION_GROUPS.forEach((group) => {
      doc.setFontSize(12);
      doc.text(tFor(lang, group.label_key), 14, y);
      const body = group.fields.map((f) => {
        const v = (site[group.key] || {})[f.key];
        const display = f.type === 'checkbox' ? (v ? '✓' : '–') : v || '';
        return [tFor(lang, f.label_key), String(display)];
      });
      doc.autoTable({ startY: y + 3, head: [], body, theme: 'plain', styles: { fontSize: 9 } });
      y = doc.lastAutoTable.finalY + 8;
    });
  });

  doc.save(`LMP-SiteCards-${dateStamp()}.pdf`);
}
