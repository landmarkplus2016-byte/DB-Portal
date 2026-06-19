import { DATA, setCurrentUser } from '../state.js';
import { t } from '../i18n/i18n.js';

export function login(username, password) {
  const user = DATA.users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return { ok: false, error: t('invalid_creds') };
  }
  if (user.active === false) {
    return { ok: false, error: t('inactive_acct') };
  }

  setCurrentUser(user);
  return { ok: true };
}

export function logout() {
  setCurrentUser(null);
}
