import { DATA, setData, markDirty, clearDirty } from '../state.js';

function isoDateStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function appendAudit({ user, action, site_id, field = null, old_value = null, new_value = null }) {
  DATA.audit_log.push({
    timestamp: new Date().toISOString(),
    user: user.username,
    action,
    site_id,
    field,
    old_value,
    new_value,
  });
}

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function loadJSON(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    return { ok: false, error: err.message };
  }
  setData(parsed);
  clearDirty();
  return { ok: true };
}

export function exportJSON(currentUser) {
  const exportData = {
    ...DATA,
    meta: {
      ...DATA.meta,
      exported_at: new Date().toISOString(),
      exported_by: currentUser.username,
    },
  };
  triggerDownload(`lmp-data-${isoDateStamp()}.json`, JSON.stringify(exportData, null, 2), 'application/json');
  clearDirty();
}

export function addSite(site, user) {
  DATA.sites.push(site);
  appendAudit({ user, action: 'CREATE', site_id: site.site_id, new_value: site.site_id });
  markDirty();
}

export function updateSite(siteId, updates, user, changedFields) {
  const site = DATA.sites.find((s) => s.site_id === siteId);
  if (!site) return;

  for (const sectionKey of Object.keys(updates)) {
    const sectionValue = updates[sectionKey];
    if (Array.isArray(sectionValue)) {
      site[sectionKey] = sectionValue;
    } else if (sectionValue && typeof sectionValue === 'object') {
      Object.assign(site[sectionKey], sectionValue);
    } else {
      site[sectionKey] = sectionValue;
    }
  }

  site.meta.updated_at = new Date().toISOString();
  site.meta.updated_by = user.username;

  for (const field of changedFields) {
    appendAudit({
      user,
      action: 'UPDATE',
      site_id: siteId,
      field: field.key,
      old_value: field.old_value,
      new_value: field.new_value,
    });
  }

  markDirty();
}

export function deleteSite(siteId, user) {
  const index = DATA.sites.findIndex((s) => s.site_id === siteId);
  if (index === -1) return;
  DATA.sites.splice(index, 1);
  appendAudit({ user, action: 'DELETE', site_id: siteId, old_value: siteId });
  markDirty();
}

export function saveUsers(users) {
  DATA.users = users;
  markDirty();
}

export function updateMeta(metaUpdates) {
  Object.assign(DATA.meta, metaUpdates);
  markDirty();
}
