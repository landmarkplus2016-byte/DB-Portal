# BUILD.md — LMP Acquisition DB
> Your step-by-step manual for building the app from zero to live.
> Work through this top to bottom. Check off every item as you go.
> Never skip a test. Never move to the next step if a test fails.
> **No npm. No build step. Ever.** Every file you create is loaded directly by the browser.

---

## Before You Write a Single Line of Code

### One-time setup checklist
- [ ] Create a new GitHub repository — name it `lmp-acq-db` (public)
- [ ] Enable GitHub Pages: Settings → Pages → Deploy from `main` branch, root folder
- [ ] Create your project folder: `lmp-acq-db`
- [ ] Drop `CLAUDE.md` into the root of that folder
- [ ] Drop `BUILD.md` into the root of that folder
- [ ] Create a `design/` folder in the root and drop `lmp_prototype.html` into it
- [ ] Open the folder in VS Code
- [ ] Connect your local folder to the GitHub repository
- [ ] **Do not run `npm init`, `npm install`, or any npm command at any point in this project**

### How you'll preview the app while building
No dev server is required, but a tiny static file server avoids browser quirks with ES modules over `file://` URLs. The simplest options, pick whichever you already have:
- VS Code's **"Live Server"** extension (right-click `index.html` → "Open with Live Server")
- Or Python's built-in server: `python -m http.server 8000` from the project root, then open `http://localhost:8000`
Neither of these installs anything into the project — they just serve the static files as-is.

### First message to Claude Code — copy and paste this exactly:
```
Read CLAUDE.md first and confirm you understand the project before writing any code.
Confirm you understand this is a plain HTML/CSS/JS project — no npm, no build tools,
no React, no Tailwind, ever.
Open and review design/lmp_prototype.html in a browser — this is the approved visual
design AND the approved architecture (plain JS template-literal rendering, hash routing,
plain-JS i18n object). Confirm you understand it will guide all styling and structural
decisions per the "Visual Reference" section of CLAUDE.md.
Describe in your own words: what this app does, how data flows between admin and viewers,
how user credentials work, and why hash-based routing is required.
Then create the full folder and file structure as defined in the File Map section of
CLAUDE.md — empty files only, no code yet.
Do not write any logic until I confirm the structure looks correct.
```

### After structure is created — verify before moving on:
- [ ] All folders exist: `css/`, `js/`, `js/i18n/`, `js/data/`, `js/pages/`, `js/components/`, `js/utils/`, `js/constants/`, `design/`
- [ ] All files listed in the File Map exist and are empty (or near-empty)
- [ ] `CLAUDE.md` is in the root
- [ ] `BUILD.md` is in the root
- [ ] `design/lmp_prototype.html` is in place and Claude Code has confirmed it reviewed it
- [ ] No `package.json`, no `node_modules`, no config files for any bundler exist anywhere
- [ ] No code has been written yet

---

## Stage 1 — Shell, Styles, Constants, Utils

**Goal:** `index.html` opens in a browser (via Live Server or `python -m http.server`) with no console errors. Tailwind-equivalent CSS variables render correctly. Hash routing renders a placeholder page. Language toggle switches EN/AR and flips RTL.

---

### Step 1.1 — index.html + CSS tokens

**Prompt:**
```
Read CLAUDE.md. We are on Stage 1, Step 1.

Build index.html:
- Standard HTML5 boilerplate
- <link> tags for css/tokens.css, css/base.css, css/layout.css, css/components.css, css/pages.css (in that order)
- CDN <script> tags exactly as listed in CLAUDE.md's File Map section (SheetJS, jsPDF, jspdf-autotable)
- <script type="module" src="js/main.js"></script> at the end of <body>
- A single <div id="app"></div> as the mount point — everything else is rendered into it by JS

Build css/tokens.css:
- Use the exact :root block from the "css/tokens.css" section of CLAUDE.md's Design System — copy it verbatim

Build css/base.css:
- box-sizing reset, body font-family: var(--font-base), background: var(--bg), color: var(--text)
- [dir="rtl"] font-family override exactly as in design/lmp_prototype.html
- Scrollbar styling matching the prototype

Build js/main.js (minimal for now):
- import './router.js'
- A temporary render() call that just sets #app innerHTML to "LMP Acquisition DB — loading..."

Confirm this opens with zero console errors via Live Server.
```

**Tests for Step 1.1:**
- [ ] Opening `index.html` via Live Server (or `python -m http.server`) shows the placeholder text with no console errors
- [ ] No 404s for any CSS or CDN script in the Network tab
- [ ] `css/tokens.css` variables are visible in DevTools → Elements → `:root` computed styles
- [ ] Opening `index.html` directly via `file://` (double-click) is **not** required to work perfectly (ES modules can be blocked by CORS over `file://`) — Live Server is the supported workflow, note this in a code comment in `index.html`

---

### Step 1.2 — i18n layer

**Prompt:**
```
Read CLAUDE.md. Stage 1, Step 2.
Build the complete i18n layer: js/i18n/en.js, js/i18n/ar.js, js/i18n/i18n.js.
Each of en.js / ar.js exports a plain object (export const en = {...}, export const ar = {...}).

Keys needed (same content as a full i18next setup would need, just plain objects now):
- App name, subtitle, all navigation labels
- All field labels for every field in the JSON structure (prefix: field_)
- All section names (section_acq, section_sta, section_construction, section_acceptance, section_files)
- All status labels (status_complete, status_in_progress, status_new)
- All button labels (btn_save, btn_cancel, btn_edit, btn_delete, btn_add_site, btn_export_json, btn_upload_json, btn_open_folder, btn_copy_path, btn_sign_out)
- All role labels (role_admin, role_data_entry, role_viewer)
- All error/warning messages including the network path warning
- Dashboard labels (kpi_total, kpi_complete, kpi_in_progress, kpi_new, chart_by_typology, chart_by_status, recent_activity)
- Export labels
- Admin panel labels (tab_users, tab_permissions, tab_audit, tab_settings)
- Unsaved changes indicator text

Every key in en.js must exist in ar.js.

js/i18n/i18n.js must:
- import { en } from './en.js' and import { ar } from './ar.js'
- Maintain a module-level `let currentLang` initialized from localStorage key 'lmp_lang', default 'en'
- export function t(key): returns the string for currentLang, falls back to the key itself if missing
- export function setLanguage(lang): updates currentLang, localStorage, document.documentElement.dir,
  document.documentElement.lang, then calls the app's render() (import it, or use a callback registered
  by main.js — your choice, document which you pick)
```

**Tests for Step 1.2:**
- [ ] `t('app_name')` returns 'LMP Acquisition DB' in English
- [ ] After `setLanguage('ar')` — `t('app_name')` returns the Arabic version
- [ ] `document.documentElement.dir` is `'rtl'` after switching to Arabic
- [ ] `document.documentElement.dir` is `'ltr'` after switching to English
- [ ] No key is missing from ar.js that exists in en.js (write a quick console check comparing `Object.keys(en)` vs `Object.keys(ar)`)

---

### Step 1.3 — Constants: field definitions

**Prompt:**
```
Read CLAUDE.md. Stage 1, Step 3.
Build js/constants/fields.js as a plain ES module.

This file exports:
- export const ACQ_FIELDS — array of all ACQ section fields
- export const STA_FIELDS — array of all STA section fields
- export const CONSTRUCTION_FIELDS — array of all Construction section fields
- export const ACCEPTANCE_FIELDS — array of all Acceptance section fields
- export const ALL_FIELDS — [...ACQ_FIELDS, ...STA_FIELDS, ...CONSTRUCTION_FIELDS, ...ACCEPTANCE_FIELDS]

Each field object must have:
{
  key: 'contract_date',        // snake_case, matches JSON structure in CLAUDE.md
  section: 'acq',              // which section object it lives in
  type: 'date',                // 'text' | 'date' | 'checkbox' | 'select' | 'textarea'
  label_key: 'field_contract_date',  // i18n key
  required: false,
  options: [],                 // only for type 'select' — array of string values
}

Include every single field listed in the JSON structure in CLAUDE.md.
For typology field: options = ['Rooftop', 'Greenfield', 'Indoor', 'Street level']
For power_source field: options = ['Grid', 'Generator', 'Solar', 'Other']
For section field in file objects: options = ['ACQ', 'STA', 'Construction', 'Acceptance']
```

**Tests for Step 1.3:**
- [ ] `ALL_FIELDS.length` matches total number of fields in CLAUDE.md JSON structure
- [ ] Every field has key, section, type, label_key, required
- [ ] Every select field has a non-empty options array
- [ ] No duplicate keys in ALL_FIELDS

---

### Step 1.4 — Utility functions

**Prompt:**
```
Read CLAUDE.md. Stage 1, Step 4.
Build all utility files as plain ES modules (each function is a named export).

js/utils/siteStatus.js:
- export function deriveStatus(site): returns 'Complete' | 'In progress' | 'New'
- Logic exactly as defined in the Site Status section of CLAUDE.md
- Never reads a stored status — always derives from fields

js/utils/permissions.js:
- export function filterSitesByPermissions(sites, user): returns filtered array
  - admin → all sites
  - site_access 'all' → all sites
  - site_access 'assigned' → only sites whose site_id is in user.allowed_sites
  - site_access 'region' → only sites where acq.address contains any string from user.allowed_regions
- export function canEditSite(user, site): returns boolean
  - admin → always true
  - data_entry with site_access 'assigned' → only if site.site_id in user.allowed_sites
  - data_entry with site_access 'all' or 'region' → true
  - viewer → always false
- export function canAccessRoute(user, route): returns boolean
  - '/admin' → admin only
  - '/export' → can_export true or admin
  - '/sites/new' or contains '/edit' → admin or data_entry
  - everything else → true

js/utils/filePaths.js:
- export function buildFolderPath(siteId, basePath): returns 'Z:\sites\EG-CAI-001\'
- export function buildFilePath(siteId, fileName, basePath): returns full file path
- export function toFileUrl(windowsPath): converts 'Z:\sites\EG-CAI-001\' to 'file:///Z:/sites/EG-CAI-001/'
- Handle both trailing-slash and non-trailing-slash basePath inputs

js/utils/format.js:
- export function fmtDate(dateStr): formats as 'DD MMM YYYY' using native Intl.DateTimeFormat — no date library
- export function escapeHtml(str): escapes &, <, >, ", ' for safe innerHTML insertion
- export function initials(name): returns up to 2 uppercase initials from a display name

js/utils/exportHelpers.js:
- export function flattenSiteForExcel(site): returns one flat object with all fields as top-level keys
- export function exportToExcel(sites, lang): uses the global `XLSX` object (loaded via CDN in index.html),
  downloads LMP-Export-YYYY-MM-DD.xlsx
- export function exportToCSV(sites): uses XLSX.utils.sheet_to_csv, downloads LMP-Export-YYYY-MM-DD.csv
- export function exportToPDF(sites, lang): uses the global `jspdf` object + its autoTable plugin
  (both loaded via CDN in index.html), one page per site, downloads LMP-SiteCards-YYYY-MM-DD.pdf
  PDF page structure: site_id + address header, status, then one autoTable per section
```

**Tests for Step 1.4:**
- [ ] `deriveStatus` returns 'New' for a site with only site_id filled
- [ ] `deriveStatus` returns 'In progress' for a site with contract_date but fac=false
- [ ] `deriveStatus` returns 'Complete' for a site with contract_date AND fac=true
- [ ] `filterSitesByPermissions` with admin returns all sites unchanged
- [ ] `filterSitesByPermissions` with assigned user returns only their sites
- [ ] `buildFolderPath('EG-CAI-001', 'Z:\\sites\\')` returns `'Z:\\sites\\EG-CAI-001\\'`
- [ ] `toFileUrl('Z:\\sites\\EG-CAI-001\\')` returns `'file:///Z:/sites/EG-CAI-001/'`
- [ ] `exportToExcel` triggers a file download (test in browser) — confirms the CDN `XLSX` global loaded correctly

---

## Stage 2 — Data + Auth Layer

**Goal:** JSON can be loaded into the app. Login validates against users in the JSON. Session lives in memory. Logout clears it.

---

### Step 2.1 — App state + data actions

**Prompt:**
```
Read CLAUDE.md. Stage 2, Step 1.
Build js/state.js and js/data/dataActions.js as plain ES modules.

js/data/bootstrap.js:
- export const BOOTSTRAP_ADMIN = { user_id: 'bootstrap-admin', username: 'admin', password: 'admin123',
  role: 'admin', display_name: 'Administrator', active: true, site_access: 'all', allowed_regions: [],
  allowed_sites: [], can_export: true, can_upload_files: true, created_at: '', created_by: 'system' }
- export function makeBootstrapData(): returns
  { meta: { version: '1.0', exported_at: null, exported_by: null, server_base_path: 'Z:\\sites\\' },
    users: [BOOTSTRAP_ADMIN], sites: [], audit_log: [] }

js/state.js — the single source of truth for all in-memory app state:
- export let DATA = makeBootstrapData()
- export let CURRENT_USER = null
- export let IS_DIRTY = false
- export let ROUTE = 'login', ROUTE_PARAM = null
- export let UI = {} (a free-form object for per-page transient UI state: search text, filters, active tab, etc.)
- export function setData(newData) { DATA = newData }  — used by loadJSON
- export function markDirty() { IS_DIRTY = true }
- export function clearDirty() { IS_DIRTY = false }
- (Keep this file free of any business logic — it only holds and mutates state)

js/data/dataActions.js — all mutations to DATA go through these functions, never direct state.js edits from pages:
  loadJSON(jsonString): parse → setData → clearDirty → return { ok, error }
  exportJSON(currentUser): builds export object (spread DATA, override meta.exported_at/exported_by),
    triggers file download as lmp-data-YYYY-MM-DD.json via Blob + <a download>, clearDirty()
  addSite(site, user): push to DATA.sites, push a CREATE audit entry, markDirty()
  updateSite(siteId, updates, user, changedFields): merge updates into the matching site, push one
    UPDATE audit entry per changed field, markDirty()
  deleteSite(siteId, user): remove from DATA.sites, push a DELETE audit entry, markDirty()
  saveUsers(users): replace DATA.users, markDirty()
  updateMeta(metaUpdates): merge into DATA.meta, markDirty()

Audit log entry shape: { timestamp: ISO string, user: username, action, site_id, field, old_value, new_value }
```

**Tests for Step 2.1:**
- [ ] On app load: `DATA.users` contains the bootstrap admin
- [ ] `loadJSON` with valid JSON: DATA updates, IS_DIRTY = false
- [ ] `loadJSON` with invalid JSON: returns `{ ok: false, error: '...' }`, DATA unchanged
- [ ] `addSite` adds a site to `DATA.sites` and appends a CREATE entry to `DATA.audit_log`
- [ ] `exportJSON` triggers a file download
- [ ] Re-upload the exported JSON: all data intact, no data loss

---

### Step 2.2 — Auth

**Prompt:**
```
Read CLAUDE.md. Stage 2, Step 2.
Build js/data/auth.js as a plain ES module.

export function login(username, password):
  - find user in DATA.users (import DATA from '../state.js') where username + password match
  - if not found: return { ok: false, error: t('invalid_creds') }
  - if found but user.active === false: return { ok: false, error: t('inactive_acct') }
  - if found and active: set CURRENT_USER via a setter exported from state.js (e.g. setCurrentUser(user)),
    return { ok: true }
export function logout():
  - setCurrentUser(null)

CURRENT_USER is never written to localStorage — lives in memory only (a plain module-level variable in state.js).
If the page is refreshed, CURRENT_USER resets to null and the user must log in again.
This is intentional — the app requires re-uploading the JSON and re-authenticating on every fresh load.
```

**Tests for Step 2.2:**
- [ ] Login with correct bootstrap credentials → `CURRENT_USER` is set
- [ ] Login with wrong password → returns error message
- [ ] Login with inactive user → returns deactivated error
- [ ] Logout → `CURRENT_USER` is null
- [ ] Page refresh → `CURRENT_USER` is null, redirected to login

---

## Stage 3 — App Shell + Routing

**Goal:** App renders. Hash routing works. Protected routes redirect correctly. Sidebar and topbar render. Language toggle works.

---

### Step 3.1 — Router + render dispatcher

**Prompt:**
```
Read CLAUDE.md. Stage 3, Step 1.
Build js/router.js and js/render.js.

js/router.js:
- export function go(route, param): sets ROUTE and ROUTE_PARAM in state.js, updates location.hash
  to match (e.g. '#/sites/EG-CAI-001'), then calls render()
- export function initRouter(): reads the current location.hash on load and sets initial ROUTE/ROUTE_PARAM;
  also listens for the browser's hashchange event so back/forward buttons work
- Route guard logic: before rendering a protected route, call canAccessRoute(CURRENT_USER, route) from
  js/utils/permissions.js — if false, call go('dashboard') instead. If CURRENT_USER is null and the
  route isn't 'login', call go('login') instead.

js/render.js:
- export function render(): the single top-level render function.
  - If no CURRENT_USER → render the login page into #app
  - Else → render the sidebar + topbar shell, then call the matching page's render function based on
    ROUTE into a #content area inside that shell
  - Route → page function mapping: dashboard, sites, site-detail, site-form, export, admin
    (use placeholder page functions that just return a one-line string for now, real pages come in
    later stages — but wire the routing fully now)
  - After setting innerHTML, call the matching bind*Events() function for that page if it exists

Wire main.js to call initRouter() then render() once on load.
```

**Tests for Step 3.1:**
- [ ] Visiting with no session → shows login page regardless of hash
- [ ] After login → `go('dashboard')` is called and the dashboard placeholder renders
- [ ] Calling `go('admin')` as a viewer → redirects to dashboard
- [ ] Calling `go('export')` as a viewer with can_export=false → redirects to dashboard
- [ ] Browser back/forward buttons work correctly (hashchange listener fires render)
- [ ] Refreshing any route shows the login page (no session in memory after refresh)

---

### Step 3.2 — Layout components

**Prompt:**
```
Read CLAUDE.md. Stage 3, Step 2.
Build the layout components as plain JS modules — each exports a function returning an HTML string.

js/components/sidebar.js:
- export function renderSidebar(): returns HTML string
  - Logo area: 'LMP' in accent color, 'Acq. DB', subtitle from t('app_sub')
  - Nav items: Dashboard, Sites, Add Site, Export — with simple icon characters or inline SVG
  - Admin nav item: included only when CURRENT_USER.role === 'admin'
  - Active state: a CSS class added when current ROUTE matches
  - Language toggle: two buttons EN / ع with data-lang attributes
  - User info: avatar circle (initials via the initials() util), display_name, role badge
  - Sign out button with id="btn-signout"
- export function bindSidebarEvents(): attaches click handlers for [data-lang] buttons (call setLanguage),
  nav links (call go()), and #btn-signout (call logout() then go('login'))

js/components/topbar.js:
- export function renderTopbar(title, sub, actionsHtml): returns HTML string
  - Left: page title + subtitle
  - Right: actionsHtml (caller-provided buttons) + an "Export JSON" button (shown when role is admin or
    data_entry) + an unsaved-changes indicator (amber dot + t('unsaved_changes')) shown when IS_DIRTY
- export function bindTopbarEvents(): wires the Export JSON button to call exportJSON(CURRENT_USER) from
  js/data/dataActions.js, then re-render

js/render.js should call renderSidebar() + renderTopbar(...) + the active page's render function to
assemble the full shell, matching the layout in design/lmp_prototype.html (sidebar fixed width on one
side, topbar + scrollable content area on the other — flips correctly in RTL via CSS logical properties).
```

**Tests for Step 3.2:**
- [ ] Sidebar renders correctly in English (LTR)
- [ ] Language toggle switches to Arabic — sidebar flips to RTL, all labels in Arabic
- [ ] Active nav item highlighted on current route
- [ ] Admin nav item hidden for viewer role
- [ ] Unsaved changes indicator appears after `addSite()` is called and render() runs
- [ ] Unsaved changes indicator disappears after `exportJSON()` is called
- [ ] Sign out navigates to login and clears session

---

### Step 3.3 — Shared UI component helpers

**Prompt:**
```
Read CLAUDE.md. Stage 3, Step 3.
Before building, open design/lmp_prototype.html and review the .btn-*, .field, .card, .badge, .modal,
and .toast CSS rules — use the Component reference cheatsheet in CLAUDE.md's Design System section as
your checklist. Build the matching CSS in css/components.css using the CSS variables from css/tokens.css.

Then build the small JS helper modules that generate the matching HTML strings:

js/components/badge.js:
- export function statusBadgeHtml(status): returns a <span class="badge ..."> for 'Complete' | 'In progress' | 'New'

js/components/modal.js:
- export function modalHtml(title, bodyHtml, footHtml): returns the overlay + modal HTML string
- export function bindModalDismiss(onClose): wires Escape key and overlay-click to call onClose

js/components/toast.js:
- export function showToast(msg, type): inserts a toast element into the DOM, auto-removes after 2000ms

js/components/fileLinkRow.js:
- export function fileLinkRowHtml(file): icon based on extension, name, section tag, date, "open file" link
  using toFileUrl(), matching design/lmp_prototype.html's .file-row markup

These are plain functions, not components with internal state — callers re-render by calling render() again,
exactly like the rest of this app's pattern.
```

**Tests for Step 3.3:**
- [ ] Buttons (`.btn-primary`, `.btn-ghost`, `.btn-danger`) render with correct colors from css/tokens.css
- [ ] `modalHtml` + `bindModalDismiss` closes on Escape key
- [ ] `modalHtml` + `bindModalDismiss` closes on overlay click
- [ ] `showToast` auto-dismisses after 2 seconds
- [ ] All components render correctly in RTL mode (toggle language and re-check)

---

## Stage 4 — Login + Site List

**Goal:** User can log in. Sites list loads from JSON. Search and filter work.

---

### Step 4.1 — Login page

**Prompt:**
```
Read CLAUDE.md. Stage 4, Step 1.
Build js/pages/loginPage.js.

export function renderLoginPage(): returns HTML string
- Centered card: LMP logo mark, app name (t('app_name')), subtitle (t('app_sub'))
- Language toggle (EN / AR) — works without being logged in
- JSON upload section at the TOP of the card, above the login form:
  - Only shown when DATA.sites.length === 0 AND DATA.users.length === 1 (just the bootstrap admin)
  - Text: t('upload_json_prompt')
  - <input type="file" accept=".json"> wired to loadJSON() from js/data/dataActions.js
  - On success: show a green confirmation, stay on login page
  - On error: show a red error message
- Username input, password input (show/hide toggle), Sign in button

export function bindLoginPageEvents():
- Wire the language toggle, file upload (via FileReader.readAsText then loadJSON), and the Sign in button
  (calls login(username, password) from js/data/auth.js → on success go('dashboard'), on error show
  inline error text below the form)
```

**Tests for Step 4.1:**
- [ ] JSON upload area appears on first load (no data loaded yet)
- [ ] JSON upload area disappears after valid JSON is uploaded
- [ ] Upload invalid JSON → error message appears
- [ ] Upload valid JSON → login form still visible, no navigation
- [ ] Login with bootstrap admin → navigates to dashboard
- [ ] Login with wrong credentials → error message under form
- [ ] Login with inactive user → appropriate error message
- [ ] Language toggle works on login page (before login)

---

### Step 4.2 — Site list page

**Prompt:**
```
Read CLAUDE.md. Stage 4, Step 2.
Build js/pages/siteListPage.js.

export function renderSiteListPage(): returns HTML string
- Apply filterSitesByPermissions(DATA.sites, CURRENT_USER) before rendering anything
- Search input: searches site_id + acq.address + acq.acquisition_manager + acq.owner + acq.negotiator,
  read from UI.search (debounce by just re-rendering on input — no need for a real debounce timer at
  this scale, but keep the input focused/cursor position stable across re-renders)
- Filter dropdowns: Status (All / Complete / In progress / New), Typology (All + all typology options),
  bound to UI.statusFilter / UI.typologyFilter
- Results count: 'X sites' below filters
- Table columns: Site ID, Address, Acq. Manager, Typology, Status (statusBadgeHtml), Last Updated, Actions
- Actions: View button (all roles), Edit button (hidden for viewer role)
- Row click navigates to site detail via go('site-detail', site.site_id)
- Empty state: helpful message when no results match filters
- Topbar: title + 'Add site' button (hidden for viewer role) via renderTopbar()

export function bindSiteListPageEvents(): wires search input, filter dropdowns, row clicks, view/edit buttons
```

**Tests for Step 4.2:**
- [ ] Viewer role: no 'Add site' button, no Edit buttons in table
- [ ] Search for a partial site ID — correct results appear
- [ ] Filter by status — only matching sites shown
- [ ] Filter by typology — only matching sites shown
- [ ] Viewer with site_access='assigned' — only their sites appear
- [ ] Empty state shown when no sites match
- [ ] Click a row → navigates to site detail

---

## Stage 5 — Site Detail + Site Form

**Goal:** Admin can view all site data. Admin can add and edit sites with the tabbed form.

---

### Step 5.1 — Site detail page

**Prompt:**
```
Read CLAUDE.md. Stage 5, Step 1.
Build js/pages/siteDetailPage.js.

export function renderSiteDetailPage(): returns HTML string
- Read site_id from ROUTE_PARAM
- Find site in DATA.sites, apply canEditSite(CURRENT_USER, site) check
- Topbar: site_id, address, status badge, Back button, Edit button (hidden for viewer)
- Four section panels — always expanded, not collapsible: ACQ, STA, Construction, Acceptance
  Each panel: section title with color accent, fields in a 3-column grid (generated from
  ACQ_FIELDS/STA_FIELDS/CONSTRUCTION_FIELDS/ACCEPTANCE_FIELDS — do not hardcode fields)
  Each field: small label, value below (or 'No value' muted text if empty)
  Checkbox fields rendered as green badge '✓ Yes' or gray badge '– No'
- Files section:
  - Folder path row: path text, Open Folder button, Copy Path button
  - Network warning notice (always shown — t('network_warning'))
  - List of files using fileLinkRowHtml()
  - Empty state if no files

export function bindSiteDetailPageEvents(): wires Back button (go('sites')), Edit button
(go('site-form', site_id)), Open Folder (window.open(toFileUrl(...))), Copy Path
(navigator.clipboard.writeText(...) + showToast)
```

**Tests for Step 5.1:**
- [ ] All four sections render with correct field labels
- [ ] Empty fields show muted 'No value' text
- [ ] Checkbox fields show colored badges
- [ ] Network warning notice always visible
- [ ] Open Folder button generates correct file:/// URL
- [ ] Copy Path copies Windows path to clipboard
- [ ] Edit button hidden for viewer role
- [ ] Back button returns to site list

---

### Step 5.2 — Site form page

**Prompt:**
```
Read CLAUDE.md. Stage 5, Step 2.
Build js/pages/siteFormPage.js — used for both new site and edit.

Keep a module-level `let formDraft = null` working copy so typed values survive re-renders when
switching tabs (re-render on every keystroke is fine at this data size, but you must sync DOM input
values back into formDraft before re-rendering on tab switch — read every `.form-field-input` /
`.form-field-cb` element's current value into formDraft right before calling render() again).

export function renderSiteFormPage(): returns HTML string
- Detect new vs edit from ROUTE_PARAM: 'new' → new mode (blank draft). Otherwise → edit mode,
  clone the existing site into formDraft on first render only (don't reset it on every re-render).
- Five tabs: ACQ, STA, Construction, Acceptance, Files
  - Generate all form inputs from constants/fields.js for each section — do NOT hardcode fields
  - Tab shows a green dot when any field in that section has a non-empty / non-false value
  - Active tab tracked in UI.formTab
- Form fields: render correct input type per field.type (text/date/checkbox/select/textarea)
- Save button in topbar: validates, then calls addSite() or updateSite() from dataActions.js →
  go('site-detail', site_id)
- Validation: site_id is the only required field
  - Inline error if site_id is empty
  - Inline error if site_id already exists (new mode only)
- Cancel button navigates back without saving

Files tab:
  - List of current files in formDraft.files with delete button
  - 'Add file link' form: Name input, Path input (auto-fills to
    buildFolderPath(formDraft.site_id, DATA.meta.server_base_path) + filename when name is typed),
    Section selector, 'Add' button appends to formDraft.files
  - Server path helper: shows the auto-generated folder path with Copy Path button
  - Network warning notice

export function bindSiteFormPageEvents(): wires all of the above
```

**Tests for Step 5.2:**
- [ ] New site: site_id field empty → save shows validation error
- [ ] New site: duplicate site_id → save shows duplicate error
- [ ] New site: saved → appears in site list → IS_DIRTY = true
- [ ] Edit site: existing values pre-filled in form
- [ ] Edit site: changes saved → site detail shows updated values
- [ ] Tab green dot appears when section has data
- [ ] Switching tabs does not lose typed values in other tabs
- [ ] File path auto-completes when filename typed
- [ ] Add file link → appears in list
- [ ] Delete file link → removed from list
- [ ] Cancel → no changes saved

---

## Stage 6 — Dashboard + Export + Admin

**Goal:** Dashboard shows live stats. Export downloads work. Admin can manage users and permissions.

---

### Step 6.1 — Dashboard page

**Prompt:**
```
Read CLAUDE.md. Stage 6, Step 1.
Build js/pages/dashboardPage.js.

export function renderDashboardPage(): returns HTML string
- Apply filterSitesByPermissions before all counts
- Four KPI cards: Total Sites, Complete, In Progress, New
  Each card: colored number, label, small sparkline (inline SVG or simple divs)
- Two charts built with inline SVG — no chart library:
  - Sites by Typology: horizontal bar chart, one bar per typology value present in data
  - Sites by Status: donut chart, three segments (Complete/In progress/New)
    - Center: total count + 'sites' label
    - Legend to the right with colored dots
- Recent Activity: last 10 entries from DATA.audit_log (newest first)
  - Each entry: colored dot, text ('Ahmed Hassan updated EG-CAI-001'), timestamp
- Topbar: title, date, 'Add site' button (hidden for viewer)

export function bindDashboardPageEvents(): wires the Add site button
```

**Tests for Step 6.1:**
- [ ] KPI counts match actual data after JSON upload
- [ ] Counts update immediately after adding a new site
- [ ] Charts reflect real data proportions
- [ ] Recent activity shows latest 10 audit entries
- [ ] Viewer with assigned access sees counts for their sites only
- [ ] 'Add site' button hidden for viewer role

---

### Step 6.2 — Export page

**Prompt:**
```
Read CLAUDE.md. Stage 6, Step 2.
Build js/pages/exportPage.js.

export function renderExportPage(): returns HTML string
- Filter panel: Status dropdown, Typology dropdown (bound to UI.exStatus / UI.exTypology)
- Apply filterSitesByPermissions first, then apply panel filters
- Show count: 'X sites match current filters'
- Three export cards (icon, name, description):
  - Excel (.xlsx): calls exportToExcel(filteredSites, currentLang)
  - CSV: calls exportToCSV(filteredSites)
  - PDF cards: calls exportToPDF(filteredSites, currentLang)
- Export cards have a hover effect (CSS)

export function bindExportPageEvents(): wires filters and the three export card clicks
```

**Tests for Step 6.2:**
- [ ] Filter by status → count updates correctly
- [ ] Excel export downloads a .xlsx file
- [ ] CSV export downloads a .csv file
- [ ] PDF export downloads a .pdf file with one page per site
- [ ] Exported Excel has correct column headers
- [ ] Filtering to 0 sites → export cards still show but download is empty with message

---

### Step 6.3 — Admin page

**Prompt:**
```
Read CLAUDE.md. Stage 6, Step 3.
Build js/pages/adminPage.js with three tabs: Users, Permissions, Audit Log.
Also build Settings accessible from a section below the tabs.

Users tab:
- Table: Username, Display Name, Role badge, Status (Active/Inactive toggle), Edit, Delete
- 'Add user' button → opens a modal (use modalHtml from components/modal.js) with fields:
  username (text, required, unique), password (text, required), display_name (text, required),
  role (select: admin / data_entry / viewer), active (checkbox, default true)
- Edit user opens the same modal pre-filled — password field shows '••••' with a 'Change' toggle
- Delete: confirmation, cannot delete if it's the last admin account
- Active toggle: directly toggles user.active, saves via saveUsers()

Permissions tab:
- One row per user (excluding the bootstrap admin)
- Per user: site_access radio (All / Assigned / Region)
  - If 'assigned': text input for allowed_sites (comma-separated site IDs)
  - If 'region': text input for allowed_regions (comma-separated governorate names)
  - can_export toggle
  - can_upload_files toggle (shown only for data_entry role)
- Save button per user row

Audit Log tab:
- Full DATA.audit_log table (newest first): Timestamp, User, Action badge, Site ID, Field, Old Value, New Value
- Filter by username text input
- Read-only — no edit or delete

Settings (below tabs):
- Server base path input — shows DATA.meta.server_base_path
- Save button → calls updateMeta({ server_base_path: value })
- Preview text: 'New sites will use: Z:\sites\[SITE-ID]\'
- Note: t('settings_base_path_note')

export function renderAdminPage() and export function bindAdminPageEvents() — wire everything above
```

**Tests for Step 6.3:**
- [ ] Add user → appears in table → login with new credentials works after export + re-upload
- [ ] Cannot delete last admin account → shows error
- [ ] Deactivate a user → they cannot log in
- [ ] Permissions saved per user → viewer with assigned sites only sees those sites
- [ ] Audit log shows entries in reverse chronological order
- [ ] Audit log filter by username works
- [ ] Server base path save → new site form uses updated path
- [ ] Settings change marks IS_DIRTY = true

---

## Stage 7 — Polish + Deployment

**Goal:** App is bilingual, RTL layout correct, deployed to GitHub Pages, full QA passed.

---

### Step 7.1 — Full RTL + bilingual audit

**Prompt:**
```
Read CLAUDE.md. Stage 7, Step 1.
Audit the entire app for bilingual completeness and RTL correctness.

Check every screen:
- Every visible string uses t('key') — no hardcoded text in any .js file
- Every key used in JS exists in both js/i18n/en.js and js/i18n/ar.js

RTL layout must flip correctly:
- Sidebar moves to the right side
- All text is right-aligned
- Form labels and inputs are correct direction
- Table column text right-aligned
- Navigation active border on right side
- Use only CSS logical properties (margin-inline-start/end, padding-inline-start/end,
  inset-inline-start/end, border-inline-start/end, text-align: start/end)
- Never use margin-left/right, padding-left/right, left/right, or text-align: left/right
  anywhere in css/*.css

Test on every page in both languages.
```

**Tests for Step 7.1:**
- [ ] Every page — switch to Arabic — all text switches
- [ ] Switch back to English — all text switches back
- [ ] RTL: sidebar on right, nav border on right, text right-aligned — all pages
- [ ] No hardcoded English or Arabic strings visible in either mode
- [ ] Language preference persists after page refresh (localStorage)

---

### Step 7.2 — GitHub Pages deployment

**Prompt:**
```
Read CLAUDE.md. Stage 7, Step 2.
Set up GitHub Pages deployment — there is no build step, so this is just a push + a settings toggle.

1. Commit and push all files to the `main` branch (CLAUDE.md and BUILD.md can stay in the repo too —
   they don't affect the live app, GitHub Pages just serves index.html and whatever it references)
2. In the GitHub repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder: `/ (root)`
3. Wait a minute for GitHub Pages to publish
4. Confirm the app loads at https://[username].github.io/lmp-acq-db/

No npm install, no build command, no gh-pages branch, no dist folder — the repo IS the deployed site.
```

**Tests for Step 7.2:**
- [ ] App loads at `https://[username].github.io/lmp-acq-db/` with no console errors
- [ ] Hash routing works on the live URL — navigating to any route and refreshing stays on that route
- [ ] CDN scripts (SheetJS, jsPDF) load correctly on the live URL (check Network tab for 200s, not blocked)
- [ ] Login works on the live URL
- [ ] JSON upload works on the live URL
- [ ] Editing any `.js` or `.css` file locally and pushing again updates the live site within a minute — no extra steps

---

## Stage 8 — Full QA Checklist

Complete every item before going live. Do not skip.

**Auth & session:**
- [ ] Bootstrap login works (admin / admin123) with no JSON loaded
- [ ] Login with credentials from uploaded JSON works
- [ ] Wrong password → clear error message shown
- [ ] Inactive user → clear error message shown
- [ ] Viewer cannot navigate to /admin → redirected
- [ ] Viewer with can_export=false cannot navigate to /export → redirected
- [ ] Page refresh → session cleared, redirected to login
- [ ] Logout → session cleared, redirected to login

**JSON data flow:**
- [ ] Upload JSON → all sites and users load correctly
- [ ] Add site → appears in list → isDirty indicator appears
- [ ] Edit site → changes reflected in detail view
- [ ] Delete site → removed from list
- [ ] Export JSON → file downloads
- [ ] Re-upload exported JSON → all data intact, no data loss
- [ ] Audit log entries created for add/edit/delete

**Permissions:**
- [ ] Viewer with site_access='assigned' sees only their assigned sites
- [ ] Viewer with site_access='region' sees only sites matching their regions
- [ ] Data entry user cannot see Admin page
- [ ] Data entry user with can_export=false cannot see Export page

**Site form:**
- [ ] All 4 section tabs work, all fields render
- [ ] Green dot on tab when section has data
- [ ] Duplicate site_id shows validation error
- [ ] Files tab: add file link works, path auto-suggest works
- [ ] Files tab: delete file link works
- [ ] Save triggers audit log entries for each changed field

**File paths:**
- [ ] Open Folder button generates correct file:/// URL
- [ ] Copy Path copies correct Windows path to clipboard
- [ ] Network warning always visible next to all file links and folder buttons

**Export:**
- [ ] Excel download — correct data, correct headers
- [ ] CSV download — correct data
- [ ] PDF download — one page per site, site ID in header

**Dashboard:**
- [ ] KPI counts correct after data loads
- [ ] KPI counts update after adding a site
- [ ] Charts reflect real data
- [ ] Recent activity shows last 10 audit entries

**Admin panel:**
- [ ] Add user → after export + re-upload → new user can log in
- [ ] Cannot delete last admin → error shown
- [ ] Deactivate user → they cannot log in
- [ ] Server base path update → new file path suggestions updated

**Bilingual / RTL:**
- [ ] Every string translates in both directions on every page
- [ ] RTL layout correct on all pages in Arabic
- [ ] Language preference persists after refresh
- [ ] No hardcoded strings in either language

**No-build sanity check:**
- [ ] No `package.json` or `node_modules` anywhere in the repo
- [ ] No bundler config files (`vite.config.js`, `webpack.config.js`, etc.) exist
- [ ] The entire app runs by opening `index.html` through a static file server with zero install steps

---

## Go Live

### Switch from test data to real data:
1. [ ] Open app with bootstrap login (admin / admin123)
2. [ ] Go to Admin → Users → create the real admin account with a strong password
3. [ ] Export JSON → this is now the master file
4. [ ] Save master JSON to the company shared drive folder — agree on a location and name with the team
5. [ ] Create all user accounts in Admin → Users with correct roles and permissions
6. [ ] Export JSON again → replace the file on shared drive
7. [ ] Begin entering real site data
8. [ ] Export JSON regularly and replace the shared drive file
9. [ ] Notify all viewers: the shared drive location, how to download the JSON, how to upload it to the app
10. [ ] Verify one viewer end-to-end: download JSON → upload → search site → view data → open file path
11. [ ] You are live ✅

### Ongoing — admin responsibilities:
- Export JSON after every data entry session and replace the file on shared drive
- Communicate to the team when a new JSON is available (a shared chat message is enough)
- When adding or modifying users: export immediately so changes are available to the team

---

## Future Additions (Phase 2 — Firebase upgrade)

When the team grows and needs real-time sync without manual JSON export, this is the point where introducing
a build step (or staying build-free with the Firebase JS SDK loaded via CDN, which is also possible) gets
decided. Either path is viable — discuss with Khaled before choosing.

```
Read CLAUDE.md. I want to upgrade to Firebase backend.
Confirm you understand the existing architecture before writing any code.
Tell me which files will change and which new files are needed.
Also tell me whether this requires introducing npm/a build step, or whether the Firebase JS SDK can be
loaded via CDN <script> tag to keep the project build-free.
```

The swap is intentionally isolated:
- **js/data/dataActions.js** — replace loadJSON/exportJSON with Firestore reads/writes. Function signatures stay the same.
- **js/data/auth.js** — replace username/password check with Firebase Authentication. User profiles move to Firestore.
- **File storage** — unchanged, still on company server.
- **Audit log** — becomes a Firestore subcollection for real-time updates.
- **GitHub Pages hosting** — unchanged.
- **All pages and components** — unchanged. They only call functions from `js/data/*`, never touch storage directly.

---

*Keep this file open while building. Check off every item as you go.*
*If something fails a test, fix it before moving to the next step.*
*Never skip the Stage 8 QA checklist — it catches cross-feature issues.*
*If Claude Code goes off-plan, paste the relevant CLAUDE.md section and say: follow this exactly.*
*If Claude Code ever suggests installing an npm package, stop it and ask for a CDN or plain-JS alternative instead.*
