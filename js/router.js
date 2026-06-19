import { CURRENT_USER, setRoute } from './state.js';
import { canAccessRoute } from './utils/permissions.js';
import { render } from './render.js';

function buildHash(route, param) {
  switch (route) {
    case 'login':
      return '#/login';
    case 'dashboard':
      return '#/dashboard';
    case 'sites':
      return '#/sites';
    case 'site-detail':
      return `#/sites/${param}`;
    case 'site-form':
      return param === 'new' ? '#/sites/new' : `#/sites/${param}/edit`;
    case 'export':
      return '#/export';
    case 'admin':
      return '#/admin';
    default:
      return '#/dashboard';
  }
}

function parseHash(hash) {
  const path = (hash || '').replace(/^#/, '');

  if (path === '' || path === '/') return { route: 'root', param: null, guardPath: '/' };
  if (path === '/login') return { route: 'login', param: null, guardPath: '/login' };
  if (path === '/dashboard') return { route: 'dashboard', param: null, guardPath: '/dashboard' };
  if (path === '/sites') return { route: 'sites', param: null, guardPath: '/sites' };
  if (path === '/sites/new') return { route: 'site-form', param: 'new', guardPath: '/sites/new' };
  if (path === '/export') return { route: 'export', param: null, guardPath: '/export' };
  if (path === '/admin') return { route: 'admin', param: null, guardPath: '/admin' };

  const editMatch = path.match(/^\/sites\/([^/]+)\/edit$/);
  if (editMatch) return { route: 'site-form', param: editMatch[1], guardPath: path };

  const detailMatch = path.match(/^\/sites\/([^/]+)$/);
  if (detailMatch) return { route: 'site-detail', param: detailMatch[1], guardPath: path };

  return { route: 'dashboard', param: null, guardPath: '/dashboard' };
}

function resolveGuard(route, param, guardPath) {
  if (route === 'root') {
    return CURRENT_USER ? { route: 'dashboard', param: null } : { route: 'login', param: null };
  }
  if (!CURRENT_USER) {
    return route === 'login' ? { route, param } : { route: 'login', param: null };
  }
  if (route === 'login') {
    return { route: 'dashboard', param: null };
  }
  if (!canAccessRoute(CURRENT_USER, guardPath)) {
    return { route: 'dashboard', param: null };
  }
  return { route, param };
}

function applyAndSync(route, param, guardPath, rerender) {
  const resolved = resolveGuard(route, param, guardPath);
  setRoute(resolved.route, resolved.param);

  const hash = buildHash(resolved.route, resolved.param);
  if (location.hash !== hash) {
    location.hash = hash;
    return;
  }
  if (rerender) render();
}

function handleHashChange() {
  const { route, param, guardPath } = parseHash(location.hash);
  applyAndSync(route, param, guardPath, true);
}

export function go(route, param = null) {
  const hash = buildHash(route, param);
  applyAndSync(route, param, hash.slice(1), true);
}

export function initRouter() {
  window.addEventListener('hashchange', handleHashChange);
  const { route, param, guardPath } = parseHash(location.hash);
  applyAndSync(route, param, guardPath, false);
}
