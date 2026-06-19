import { CURRENT_USER, ROUTE, ROUTE_PARAM } from './state.js';
import { t } from './i18n/i18n.js';
import { renderSidebar, bindSidebarEvents } from './components/sidebar.js';
import { renderTopbar, bindTopbarEvents } from './components/topbar.js';

// Placeholder page functions — real pages land in js/pages/*.js in later stages.
// Each entry may later gain a `bind` function; render() calls it if present.
const PAGES = {
  dashboard: { title: () => t('nav_dashboard'), render: () => '<p>Dashboard page — coming soon.</p>' },
  sites: { title: () => t('nav_sites'), render: () => '<p>Site list page — coming soon.</p>' },
  'site-detail': { title: (param) => param, render: (param) => `<p>Site detail page for "${param}" — coming soon.</p>` },
  'site-form': {
    title: (param) => (param === 'new' ? t('btn_add_site') : param),
    render: (param) => `<p>Site form page (${param}) — coming soon.</p>`,
  },
  export: { title: () => t('nav_export'), render: () => '<p>Export page — coming soon.</p>' },
  admin: { title: () => t('nav_admin'), render: () => '<p>Admin page — coming soon.</p>' },
};

export function render() {
  const app = document.getElementById('app');

  if (!CURRENT_USER) {
    app.innerHTML = '<p>Login page — coming soon.</p>';
    return;
  }

  const page = PAGES[ROUTE] || PAGES.dashboard;
  app.innerHTML = `
    ${renderSidebar()}
    <div class="main">
      ${renderTopbar(page.title(ROUTE_PARAM), null, '')}
      <div class="content">${page.render(ROUTE_PARAM)}</div>
    </div>
  `;

  bindSidebarEvents();
  bindTopbarEvents();
  page.bind?.(ROUTE_PARAM);
}
