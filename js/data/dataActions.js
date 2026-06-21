import { DATA, setData, markDirty, clearDirty } from '../state.js';

const HANDLE_DB_NAME = 'lmp-acq-db';
const HANDLE_STORE_NAME = 'handles';
const HANDLE_KEY = 'data-file';

let fileHandle = null;

export function hasFileSystemAccess() {
  return typeof window.showOpenFilePicker === 'function';
}

export function isFileConnected() {
  return !!fileHandle;
}

function openHandleDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HANDLE_DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(HANDLE_STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function storeHandle(handle) {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, 'readwrite');
    tx.objectStore(HANDLE_STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadStoredHandle() {
  const db = await openHandleDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(HANDLE_STORE_NAME, 'readonly');
    const req = tx.objectStore(HANDLE_STORE_NAME).get(HANDLE_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
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

async function readHandle(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  return loadJSON(text);
}

/** First-time setup: user picks the shared JSON file via the OS file picker. */
export async function connectDataFile() {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'LMP data file', accept: { 'application/json': ['.json'] } }],
    });
    fileHandle = handle;
    await storeHandle(handle);
    return readHandle(handle);
  } catch (err) {
    if (err.name === 'AbortError') return { ok: false, cancelled: true };
    return { ok: false, error: err.message };
  }
}

/** Called on app boot — tries to silently resume the previously connected file without a picker dialog. */
export async function tryAutoReconnect() {
  const handle = await loadStoredHandle().catch(() => null);
  if (!handle) return { ok: false, error: 'no_handle' };
  let permission;
  try {
    permission = await handle.queryPermission({ mode: 'read' });
  } catch {
    return { ok: false, error: 'no_handle' };
  }
  if (permission !== 'granted') return { ok: false, error: 'permission_needed' };
  fileHandle = handle;
  return readHandle(handle);
}

/** Called from a click handler (user gesture) to re-grant permission on the previously connected file. */
export async function reconnectDataFile() {
  const handle = await loadStoredHandle().catch(() => null);
  if (!handle) return { ok: false, error: 'no_handle' };
  const granted = await handle.requestPermission({ mode: 'read' });
  if (granted !== 'granted') return { ok: false, error: 'permission_denied' };
  fileHandle = handle;
  return readHandle(handle);
}

export async function saveToFile(currentUser) {
  if (!fileHandle) return { ok: false, error: 'no_handle' };
  const granted = await fileHandle.requestPermission({ mode: 'readwrite' });
  if (granted !== 'granted') return { ok: false, error: 'permission_denied' };

  const exportData = {
    ...DATA,
    meta: {
      ...DATA.meta,
      exported_at: new Date().toISOString(),
      exported_by: currentUser.username,
    },
  };

  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(exportData, null, 2));
  await writable.close();
  clearDirty();
  return { ok: true };
}

export async function refreshFromFile() {
  if (!fileHandle) return { ok: false, error: 'no_handle' };
  const granted = await fileHandle.requestPermission({ mode: 'read' });
  if (granted !== 'granted') return { ok: false, error: 'permission_denied' };
  return readHandle(fileHandle);
}

export function addSite(site) {
  DATA.sites.push(site);
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

  markDirty();
}

export function deleteSite(siteId) {
  const index = DATA.sites.findIndex((s) => s.site_id === siteId);
  if (index === -1) return;
  DATA.sites.splice(index, 1);
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
