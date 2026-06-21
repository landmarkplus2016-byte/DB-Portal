import { DATA, CURRENT_USER } from '../state.js';
import { t, getLanguage } from '../i18n/i18n.js';
import { go } from '../router.js';
import { filterSitesByPermissions } from '../utils/permissions.js';
import { deriveStatus } from '../utils/siteStatus.js';
import { fmtDate, escapeHtml } from '../utils/format.js';

const DONUT_SEGMENTS = [
  { status: 'Complete', color: 'var(--success)' },
  { status: 'In progress', color: 'var(--warning)' },
  { status: 'New', color: 'var(--purple)' },
];

const STATUS_LABEL_KEY = { Complete: 'status_complete', 'In progress': 'status_in_progress', New: 'status_new' };

function kpiCardHtml(label, num, color) {
  const spark = Array.from({ length: 7 })
    .map(() => `<div style="height:${10 + Math.random() * 14}px;background:${color}33;"></div>`)
    .join('');
  return `
    <div class="card kpi">
      <div class="num" style="color:${color}">${num}</div>
      <div class="lbl">${escapeHtml(label)}</div>
      <div class="spark">${spark}</div>
    </div>`;
}

function typologyChartHtml(typologyCounts, maxTy) {
  const rows = Object.entries(typologyCounts)
    .map(
      ([ty, c]) => `
      <div class="bar-row">
        <div class="lbl">${escapeHtml(ty)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(c / maxTy) * 100}%;background:var(--primary);"></div></div>
        <div class="val">${c}</div>
      </div>`
    )
    .join('');
  return `
    <div class="card pad-md">
      <p class="chart-title">${t('chart_by_typology')}</p>
      ${rows || `<p style="color:var(--muted);font-size:12.5px;">—</p>`}
    </div>`;
}

function statusDonutHtml(counts, total, totalSites) {
  const circumf = 2 * Math.PI * 54;
  let acc = 0;
  const donutPaths = DONUT_SEGMENTS.map((seg) => {
    const dash = (counts[seg.status] / total) * circumf;
    const el = `<circle cx="70" cy="70" r="54" fill="none" stroke="${seg.color}" stroke-width="16"
      stroke-dasharray="${dash} ${circumf - dash}" stroke-dashoffset="${-acc}" transform="rotate(-90 70 70)"/>`;
    acc += dash;
    return el;
  }).join('');

  const legend = DONUT_SEGMENTS.map(
    (seg) => `
      <div style="display:flex;align-items:center;gap:7px;font-size:12px;margin-bottom:7px;">
        <span style="width:9px;height:9px;border-radius:50%;background:${seg.color};display:inline-block;"></span>
        ${t(STATUS_LABEL_KEY[seg.status])} <b style="margin-inline-start:auto;">${counts[seg.status]}</b>
      </div>`
  ).join('');

  return `
    <div class="card pad-md" style="display:flex;gap:18px;align-items:center;">
      <div>
        <p class="chart-title">${t('chart_by_status')}</p>
        <svg width="140" height="140" viewBox="0 0 140 140">
          ${donutPaths}
          <text x="70" y="66" text-anchor="middle" font-size="20" font-weight="800" fill="var(--text)">${totalSites}</text>
          <text x="70" y="84" text-anchor="middle" font-size="10" fill="var(--muted)">${t('sites_label')}</text>
        </svg>
      </div>
      <div>${legend}</div>
    </div>`;
}

function recentActivityHtml(sites) {
  const userByName = {};
  DATA.users.forEach((u) => (userByName[u.username] = u.display_name));

  const entries = [...sites]
    .filter((s) => s.meta?.updated_at)
    .sort((a, b) => new Date(b.meta.updated_at) - new Date(a.meta.updated_at))
    .slice(0, 10)
    .map((s) => {
      const isNew = s.meta.created_at === s.meta.updated_at;
      const who = userByName[s.meta.updated_by] || s.meta.updated_by;
      const verb = t(isNew ? 'activity_created' : 'activity_updated');
      return `
        <div class="activity-item">
          <span class="adot" style="background:${isNew ? 'var(--success)' : 'var(--primary)'}"></span>
          <div>
            <div class="txt"><b>${escapeHtml(who)}</b> ${verb} <b>${escapeHtml(s.site_id)}</b></div>
            <div class="time">${fmtDate(s.meta.updated_at)}</div>
          </div>
        </div>`;
    })
    .join('');

  return `
    <div class="card pad-md">
      <p class="chart-title">${t('recent_activity')}</p>
      <div class="activity-list">
        ${entries || `<p style="color:var(--muted);font-size:12.5px;">—</p>`}
      </div>
    </div>`;
}

export function renderDashboardSub() {
  const lang = getLanguage();
  return new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function renderDashboardActions() {
  if (CURRENT_USER.role === 'viewer') return '';
  return `<button class="btn btn-primary btn-sm" id="btn-add-site-top">+ ${t('btn_add_site')}</button>`;
}

export function renderDashboardPage() {
  const sites = filterSitesByPermissions(DATA.sites, CURRENT_USER);

  const counts = { Complete: 0, 'In progress': 0, New: 0 };
  sites.forEach((s) => counts[deriveStatus(s)]++);
  const total = sites.length || 1;

  const typologyCounts = {};
  sites.forEach((s) => {
    const ty = s.acq.typology || '—';
    typologyCounts[ty] = (typologyCounts[ty] || 0) + 1;
  });
  const maxTy = Math.max(1, ...Object.values(typologyCounts));

  return `
    <div class="kpis">
      ${kpiCardHtml(t('kpi_total'), sites.length, 'var(--primary)')}
      ${kpiCardHtml(t('kpi_complete'), counts.Complete, 'var(--success)')}
      ${kpiCardHtml(t('kpi_in_progress'), counts['In progress'], 'var(--warning)')}
      ${kpiCardHtml(t('kpi_new'), counts.New, 'var(--purple)')}
    </div>
    <div class="charts-row">
      ${typologyChartHtml(typologyCounts, maxTy)}
      ${statusDonutHtml(counts, total, sites.length)}
    </div>
    ${recentActivityHtml(sites)}
  `;
}

export function bindDashboardPageEvents() {
  document.getElementById('btn-add-site-top')?.addEventListener('click', () => go('site-form', 'new'));
}
