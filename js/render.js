import { CURRENT_USER, ROUTE, ROUTE_PARAM } from './state.js';
import { t } from './i18n/i18n.js';
import { renderSidebar, bindSidebarEvents } from './components/sidebar.js';
import { renderTopbar, bindTopbarEvents } from './components/topbar.js';
import { renderLoginPage, bindLoginPageEvents } from './pages/loginPage.js';
import { renderDashboardPage, renderDashboardSub, renderDashboardActions, bindDashboardPageEvents } from './pages/dashboardPage.js';
import { renderSiteListPage, renderSiteListActions, bindSiteListPageEvents } from './pages/siteListPage.js';
import { renderSiteDetailPage, bindSiteDetailPageEvents } from './pages/siteDetailPage.js';
import { renderSiteFormPage, renderSiteFormActions, bindSiteFormPageEvents } from './pages/siteFormPage.js';
import { renderExportPage, bindExportPageEvents } from './pages/exportPage.js';
import { renderAdminPage, bindAdminPageEvents } from './pages/adminPage.js';

// Each entry may have an optional `sub`/`actions`/`bind` function; render() calls them if present.
const PAGES = {
  dashboard: {
    title: () => t('nav_dashboard'),
    sub: () => renderDashboardSub(),
    render: () => renderDashboardPage(),
    actions: () => renderDashboardActions(),
    bind: () => bindDashboardPageEvents(),
  },
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
  export: {
    title: () => t('nav_export'),
    render: () => renderExportPage(),
    bind: () => bindExportPageEvents(),
  },
  admin: {
    title: () => t('nav_admin'),
    render: () => renderAdminPage(),
    bind: () => bindAdminPageEvents(),
  },
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
      ${renderTopbar(page.title(ROUTE_PARAM), page.sub?.(ROUTE_PARAM) ?? null, page.actions?.(ROUTE_PARAM) ?? '')}
      <div class="content">${page.render(ROUTE_PARAM)}</div>
    </div>
  `;

  bindSidebarEvents();
  bindTopbarEvents();
  page.bind?.(ROUTE_PARAM);
}
