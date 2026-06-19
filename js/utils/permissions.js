export function filterSitesByPermissions(sites, user) {
  if (!user) return [];
  if (user.role === 'admin' || user.site_access === 'all') return sites;
  if (user.site_access === 'assigned') {
    return sites.filter((s) => (user.allowed_sites || []).includes(s.site_id));
  }
  if (user.site_access === 'region') {
    return sites.filter((s) => (user.allowed_regions || []).some((r) => (s.acq.address || '').includes(r)));
  }
  return sites;
}

export function canEditSite(user, site) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'data_entry') {
    if (user.site_access === 'assigned') return (user.allowed_sites || []).includes(site.site_id);
    return true;
  }
  return false;
}

export function canAccessRoute(user, route) {
  if (!user) return false;
  if (route === '/admin') return user.role === 'admin';
  if (route === '/export') return user.can_export === true || user.role === 'admin';
  if (route === '/sites/new' || route.includes('/edit')) return user.role === 'admin' || user.role === 'data_entry';
  return true;
}
