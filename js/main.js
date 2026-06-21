import { initRouter } from './router.js';
import { render } from './render.js';
import { setRenderCallback, getLanguage } from './i18n/i18n.js';
import { setThemeRenderCallback, getTheme } from './utils/theme.js';
import { tryAutoReconnect, hasFileSystemAccess } from './data/dataActions.js';
import { UI } from './state.js';

document.documentElement.dir = getLanguage() === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = getLanguage();
document.documentElement.dataset.theme = getTheme();

setRenderCallback(render);
setThemeRenderCallback(render);

if (hasFileSystemAccess()) {
  const result = await tryAutoReconnect().catch((err) => ({ ok: false, error: err?.message }));
  if (!result.ok && result.error === 'permission_needed') {
    UI.needsReconnect = true;
  }
}

initRouter();
render();
