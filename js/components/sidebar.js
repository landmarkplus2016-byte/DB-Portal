import { CURRENT_USER, ROUTE, ROUTE_PARAM } from '../state.js';
import { t, getLanguage, setLanguage } from '../i18n/i18n.js';
import { go } from '../router.js';
import { logout } from '../data/auth.js';
import { initials, escapeHtml } from '../utils/format.js';
import { THEMES, getTheme, setTheme } from '../utils/theme.js';

function navItemHtml({ route, param, label, icon, isActive }) {
  return `<a href="#" class="${isActive ? 'active' : ''}" data-route="${route}" data-param="${param ?? ''}"><span class="ic">${icon}</span>${label}</a>`;
}

export function renderSidebar() {
  const role = CURRENT_USER.role;
  const lang = getLanguage();

  const navItems = [
    { route: 'dashboard', param: null, label: t('nav_dashboard'), icon: '▦', isActive: ROUTE === 'dashboard' },
    { route: 'sites', param: null, label: t('nav_sites'), icon: '☰', isActive: ROUTE === 'sites' },
    {
      route: 'site-form',
      param: 'new',
      label: t('nav_add'),
      icon: '+',
      isActive: ROUTE === 'site-form' && ROUTE_PARAM === 'new',
      hide: role === 'viewer',
    },
    {
      route: 'export',
      param: null,
      label: t('nav_export'),
      icon: '⇩',
      isActive: ROUTE === 'export',
      hide: !(CURRENT_USER.can_export || role === 'admin'),
    },
  ];
  if (role === 'admin') {
    navItems.push({ route: 'admin', param: null, label: t('nav_admin'), icon: '⚙', isActive: ROUTE === 'admin' });
  }

  const navHtml = navItems.filter((item) => !item.hide).map(navItemHtml).join('');

  return `
    <div class="sidebar">
      <div class="logo">
        <img class="logo-mark" src="LMP Logo White.png" alt="LMP">
        <div class="logo-text"><b>Acq. DB</b><span>${escapeHtml(t('app_sub'))}</span></div>
      </div>
      <div class="nav">${navHtml}</div>
      <div class="sidebar-bottom">
        <div class="theme-swatches">
          ${THEMES.map((th) => `<button class="swatch ${th} ${getTheme() === th ? 'active' : ''}" data-theme-swatch="${th}" aria-label="${t('theme_' + th)}" type="button"></button>`).join('')}
        </div>
        <div class="langtoggle">
          <button data-lang="en" class="${lang === 'en' ? 'active' : ''}">EN</button>
          <button data-lang="ar" class="${lang === 'ar' ? 'active' : ''}">ع</button>
        </div>
        <div class="userbox">
          <div class="avatar">${initials(CURRENT_USER.display_name)}</div>
          <div>
            <div class="name">${escapeHtml(CURRENT_USER.display_name)}</div>
            <span class="rolebadge">${t('role_' + role)}</span>
          </div>
        </div>
        <button class="signout" id="btn-signout">${t('sign_out')}</button>
      </div>
    </div>
  `;
}

export function bindSidebarEvents() {
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  document.querySelectorAll('[data-theme-swatch]').forEach((btn) => {
    btn.addEventListener('click', () => setTheme(btn.dataset.themeSwatch));
  });

  document.querySelectorAll('.nav a[data-route]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const { route, param } = link.dataset;
      go(route, param || null);
    });
  });

  document.getElementById('btn-signout')?.addEventListener('click', () => {
    logout();
    go('login');
  });
}
