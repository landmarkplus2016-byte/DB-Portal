import { DATA, UI } from '../state.js';
import { t, getLanguage, setLanguage } from '../i18n/i18n.js';
import { go } from '../router.js';
import { login } from '../data/auth.js';
import { connectDataFile, reconnectDataFile } from '../data/dataActions.js';
import { render } from '../render.js';

export function renderLoginPage() {
  const lang = getLanguage();
  const needsConnect = DATA.sites.length === 0 && DATA.users.length === 1;

  return `
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-langtoggle">
        <div class="langtoggle" style="width:120px;">
          <button data-lang="en" class="${lang === 'en' ? 'active' : ''}">EN</button>
          <button data-lang="ar" class="${lang === 'ar' ? 'active' : ''}">ع</button>
        </div>
      </div>
      <div class="login-logo">
        <div class="logo-mark">LMP</div>
        <h2>${t('app_name')}</h2>
        <p>${t('app_sub')}</p>
      </div>
      ${needsConnect ? `
      <div class="upload-box">
        <p>${t('connect_file_prompt')}</p>
        <button class="btn btn-ghost btn-sm" id="btn-connect-file" type="button">📁 ${UI.needsReconnect ? t('btn_reconnect_file') : t('btn_connect_file')}</button>
        ${UI.needsReconnect ? `<div><button class="btn btn-ghost btn-sm" id="btn-different-file" type="button" style="margin-top:6px;">${t('btn_use_different_file')}</button></div>` : ''}
        ${UI.loginUploadMsg ? `<div class="${UI.loginUploadMsg.ok ? 'note-ok' : 'note-bad'}">${UI.loginUploadMsg.text}</div>` : ''}
      </div>` : ''}
      <div class="field">
        <label>${t('username')}</label>
        <input type="text" id="login-username" placeholder="admin">
      </div>
      <div class="field">
        <label>${t('password')}</label>
        <div class="pw-wrap">
          <input type="password" id="login-password" placeholder="••••••••">
          <button type="button" class="pw-toggle" id="btn-toggle-pw">👁</button>
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center;" id="btn-login">${t('btn_sign_in')}</button>
      ${UI.loginErr ? `<div class="login-err">${UI.loginErr}</div>` : ''}
      <div class="hint">${t('bootstrap_hint')}</div>
    </div>
  </div>`;
}

async function handleConnect(action) {
  const result = await action();
  if (result.cancelled) return;
  UI.needsReconnect = false;
  UI.loginUploadMsg = result.ok ? { ok: true, text: t('upload_ok') } : { ok: false, text: t('upload_bad') };
  render();
}

export function bindLoginPageEvents() {
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  document.getElementById('btn-connect-file')?.addEventListener('click', () => {
    handleConnect(UI.needsReconnect ? reconnectDataFile : connectDataFile);
  });
  document.getElementById('btn-different-file')?.addEventListener('click', () => {
    handleConnect(connectDataFile);
  });

  document.getElementById('btn-toggle-pw')?.addEventListener('click', () => {
    const pw = document.getElementById('login-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('btn-login')?.addEventListener('click', () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const result = login(username, password);
    if (result.ok) {
      UI.loginErr = '';
      go('dashboard');
    } else {
      UI.loginErr = result.error;
      render();
    }
  });
}
