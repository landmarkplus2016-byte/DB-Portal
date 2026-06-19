import { t } from '../i18n/i18n.js';
import { fmtDate, escapeHtml } from '../utils/format.js';
import { toFileUrl } from '../utils/filePaths.js';

function fileIcon(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['jpg', 'jpeg', 'png'].includes(ext)) return '🖼️';
  return '📎';
}

export function fileLinkRowHtml(file) {
  return `
    <div class="file-row">
      <span>${fileIcon(file.name)}</span>
      <span class="fname">${escapeHtml(file.name)}</span>
      <span class="ftag">${escapeHtml(file.section)}</span>
      <a href="${toFileUrl(file.path)}" target="_blank" rel="noopener">${t('btn_open_file')}</a>
      <span class="fdate">${fmtDate(file.added_at)}</span>
    </div>
  `;
}
