import { t } from '../i18n/i18n.js';

const STATUS_CLASS = {
  Complete: 'Complete',
  'In progress': 'InProgress',
  New: 'New',
};

const STATUS_LABEL_KEY = {
  Complete: 'status_complete',
  'In progress': 'status_in_progress',
  New: 'status_new',
};

export function statusBadgeHtml(status) {
  const cls = STATUS_CLASS[status] || 'New';
  const labelKey = STATUS_LABEL_KEY[status] || 'status_new';
  return `<span class="badge ${cls}">${t(labelKey)}</span>`;
}
