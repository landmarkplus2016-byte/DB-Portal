import { CURRENT_USER, ROUTE, ROUTE_PARAM } from './state.js';
import { t } from './i18n/i18n.js';
import { renderSidebar, bindSidebarEvents } from './components/sidebar.js';
import { renderTopbar, bindTopbarEvents } from './components/topbar.js';
import { renderLoginPage, bindLoginPageEvents } from './pages/loginPage.js';
import { renderSiteListPage, renderSiteListActions, bindSiteListPageEvents } from './pages/siteListPage.js';
import { renderSiteDetailPage, bindSiteDetailPageEvents } from './pages/siteDetailPage.js';
import { renderSiteFormPage, renderSiteFormActions, bindSiteFormPageEvents } from './pages/siteFormPage.js';

// Placeholder page functions — real pages land in js/pages/*.js in later stages.
// Each entry may later gain a `bind`/`actions` function; render() calls them if present.
const PAGES = {
  dashboard: { title: () => t('nav_dashboard'), render: () => '<p>Dashboard page — coming soon.</p>' },
  sites: {
    title: () => t('nav_sites'),
    render: () => renderSiteListPage(),
    actions: () => renderSiteListActions(),
    bind: () => bindSiteListPageEvents(),
  },
  'site-detail': {
    title: () => '',
    render: () => renderSiteDetailPage(),
    bind: () => bindSiteDetailPageEvents(),
  },
  'site-form': {
    title: (param) => (param === 'new' ? t('btn_add_site') : param),
    render: () => renderSiteFormPage(),
    actions: () => renderSiteFormActions(),
    bind: () => bindSiteFormPageEvents(),
  },
  export: { title: () => t('nav_export'), render: () => '<p>Export page — coming soon.</p>' },
  admin: { title: () => t('nav_admin'), render: () => '<p>Admin page — coming soon.</p>' },
};

export function render() {
  const app = document.getElementById('app');

  if (!CURRENT_USER) {
    app.innerHTML = renderLoginPage();
    bindLoginPageEvents();
    return;
  }

  const page = PAGES[ROUTE] || PAGES.dashboard;
  app.innerHTML = `
    ${renderSidebar()}
    <div class="main">
      ${renderTopbar(page.title(ROUTE_PARAM), null, page.actions?.(ROUTE_PARAM) ?? '')}
      <div class="content">${page.render(ROUTE_PARAM)}</div>
    </div>
  `;

  bindSidebarEvents();
  bindTopbarEvents();
  page.bind?.(ROUTE_PARAM);
}
