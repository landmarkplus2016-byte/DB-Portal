# CLAUDE.md — LMP Acquisition DB
> This file is Claude Code's persistent memory for this project.
> Read this at the start of every session before writing any code.

---

## What We Are Building

A standalone browser app to replace a Microsoft Access database used for managing telecom/tower site acquisition work in Egypt.

- **Admin / Data Entry:** Enters and edits site records, manages all user accounts and permissions, exports the master JSON file to the shared drive
- **Viewers (×20):** Download the JSON from the shared drive, upload it into the app, search and view site data, open files on the company server, export to Excel/PDF
- Hosted on **GitHub Pages** (static site — no server)
- **No backend. No API. No database server. No build step. No npm — ever.** Pure HTML, CSS, and vanilla JavaScript, served as-is.
- All data lives in a single JSON file that the admin exports and saves to a company shared drive

---

## Tech Stack — Plain HTML/CSS/JS, No Build Tools

This project is intentionally framework-free and build-tool-free:

- **No npm, no package.json, no node_modules, no Vite, no webpack, no bundler of any kind**
- **No React** — UI is built with plain JS functions that return HTML strings (template literals), inserted via `innerHTML`, exactly like `design/lmp_prototype.html` already does
- **No Tailwind** — plain CSS files using CSS custom properties (variables) for the design tokens
- **No npm packages** — any third-party library (SheetJS for Excel, jsPDF for PDF) is loaded via a `<script src="https://cdn...">` tag directly in `index.html`, pinned to a specific version
- **Routing** — hash-based routing (`#/dashboard`, `#/sites`, etc.) implemented in plain JS by reading `location.hash`, exactly like the prototype
- **i18n** — a plain JS object with `en` and `ar` keys (no i18next), exactly like the prototype's `I18N` object
- **Why this matters:** the whole point is that anyone on the team can open `index.html` in a browser, or the admin can edit a `.js` file directly and refresh — there is nothing to install, nothing to compile, nothing that can break because of a Google Drive sync lock or a missing `node_modules` folder

**The codebase should be a direct, modularized evolution of `design/lmp_prototype.html`** — same approach, just split into separate files per the File Map below instead of one big file, and with real data persistence wired to JSON import/export.

### Deployment

GitHub Pages serves the repo directly — no build/deploy script, no `gh-pages` branch, no `dist/` folder. Push to `main`, point GitHub Pages at the root (or `/docs` if preferred), done. Editing a file and pushing is the entire deployment process.

---

## Non-Negotiable Rules

1. **No backend calls at runtime** — zero `fetch()` calls to any server. The app is 100% offline after load (except loading the CDN script tags for SheetJS/jsPDF, which only happens once on page load)
2. **No npm, no build step, ever** — if a feature seems to require installing a package, find a CDN `<script>` tag alternative or write it in plain JS instead
3. **No localStorage for site data** — all site data, users, and audit log live in JS variables (in-memory state) only. localStorage is only used for UI display preferences: language (`lmp_lang`) and accent theme (`lmp_theme`)
4. **HashRouter pattern only** — routes are `#/...` fragments handled by reading `location.hash`. GitHub Pages does not support server-side routing, and hash routing needs zero configuration
5. **Never delete audit log entries** — audit log is append-only, always
6. **Permissions filter always applied** — `filterSitesByPermissions(sites, user)` must run before any site list or detail renders
7. **Bootstrap admin is memory-only** — never written to JSON. Exists only as a hardcoded fallback when no JSON is loaded
8. **Cannot delete last admin** — always validate before any user deletion
9. **All UI text through `t('key')`** — never hardcode English or Arabic strings in JS template strings
10. **Network path warning always shown** — never show a file link or folder button without the server network warning notice
11. **One file, one job** — never add logic to a file that belongs in another file (see File Map)
12. **Visual design comes from `design/lmp_prototype.html`, as refined by the Design System section below** — the sidebar (navy) and accent color (switchable via the theme palette) have since diverged from the prototype's literal colors; the Design System section is the current source of truth where the two disagree

---

## How the App Works — Read This Carefully

This is a **JSON-file-driven app**. There is no backend.

```
Admin enters/edits data in the app
          ↓
All changes live in JS state (memory only)
          ↓
Admin clicks "Export JSON" → file downloads
          ↓
Admin saves JSON to company shared drive (replaces old file)
          ↓
Viewers download the new JSON from shared drive
          ↓
Viewers open the app (index.html) → upload JSON → browse data
```

**The shared drive JSON is the single source of truth.**
When admin adds a user, changes a password, or deactivates someone — nothing changes for other users until admin exports and the other users download the new JSON. This is the intended sync mechanism. It must be communicated clearly in the app UI.

---

## User Roles

| Role | Can do |
|---|---|
| `admin` | Everything: manage users + permissions, add/edit/delete sites, link files, export JSON, view audit log |
| `data_entry` | Add/edit sites (per permissions), link file paths, export (if permitted by admin) |
| `viewer` | Search/view sites (per permissions), export to Excel/PDF (if permitted by admin), open file paths |

### Per-user permission fields

| Field | Type | Meaning |
|---|---|---|
| `site_access` | `"all"` \| `"assigned"` \| `"region"` | Scope of sites this user can see |
| `allowed_regions` | string[] | Governorate names (when site_access = "region") |
| `allowed_sites` | string[] | Site IDs (when site_access = "assigned") |
| `can_export` | boolean | Can this user export to Excel / PDF |
| `can_upload_files` | boolean | Can this user add file path links (data_entry only) |

### Bootstrap admin account

When no JSON is loaded, a hardcoded bootstrap account allows first access:
- Username: `admin`
- Password: `admin123`
- Role: `admin`

This account exists only in memory. It is never written to any JSON. The real admin must create their proper account in Admin → Users, then export the JSON before this bootstrap account is needed again.

---

## JSON File Structure — Complete Reference

```json
{
  "meta": {
    "version": "1.0",
    "exported_at": "2024-05-10T14:30:00",
    "exported_by": "ahmed.hassan",
    "server_base_path": "Z:\\sites\\"
  },
  "users": [
    {
      "user_id": "u001",
      "username": "ahmed.hassan",
      "password": "pass123",
      "role": "data_entry",
      "display_name": "Ahmed Hassan",
      "active": true,
      "site_access": "all",
      "allowed_regions": [],
      "allowed_sites": [],
      "can_export": true,
      "can_upload_files": true,
      "created_at": "2024-01-01",
      "created_by": "admin"
    }
  ],
  "sites": [
    {
      "site_id": "EG-CAI-001",
      "acq": {
        "address": "",
        "nominal_coords": "",
        "option_coords": "",
        "dis_from_nom": "",
        "option": "",
        "sf2_date": "",
        "typology": "",
        "sf3_comment": "",
        "sf51_doc": "",
        "sf3_date": "",
        "contract_date": "",
        "initial_pm_date": "",
        "final_pm_date": "",
        "negotiator": "",
        "surveyor": "",
        "survey_date": "",
        "initial_permit_date": "",
        "permitted_by": "",
        "power_source": "",
        "acquisition_manager": "",
        "owner": "",
        "rental_value": "",
        "owner_phone": "",
        "final_permit_date": "",
        "environment_date": "",
        "comments": "",
        "agriculture_receipt": false,
        "environment_receipt": false,
        "civil_aviation_receipt": false,
        "pm_charge_receipt": false,
        "cooperation": false,
        "agriculture_date": ""
      },
      "sta": {
        "consultant_office": "",
        "sta_date": "",
        "consultant_feedback": "",
        "safety_certificate": false,
        "supervision_certificate": false,
        "post_certificate": false,
        "verticality_certificate": false
      },
      "construction": {
        "rfc": "",
        "rfi": "",
        "sf6": "",
        "construction_manager": "",
        "site_engineer": "",
        "vf_site_establishment": ""
      },
      "acceptance": {
        "acceptance_manager": "",
        "acceptance_engineer": "",
        "vf_task_owner": "",
        "pac": false,
        "fac": false,
        "site_snags": ""
      },
      "files": [
        {
          "file_id": "f001",
          "name": "Permit.pdf",
          "path": "Z:\\sites\\EG-CAI-001\\Permit.pdf",
          "section": "ACQ",
          "added_by": "ahmed.hassan",
          "added_at": "2024-05-10"
        }
      ],
      "meta": {
        "created_at": "2024-01-15T10:00:00",
        "created_by": "ahmed.hassan",
        "updated_at": "2024-05-10T14:00:00",
        "updated_by": "ahmed.hassan"
      }
    }
  ],
  "audit_log": [
    {
      "timestamp": "2024-05-10T14:22:00",
      "user": "ahmed.hassan",
      "action": "UPDATE",
      "site_id": "EG-CAI-001",
      "field": "contract_date",
      "old_value": "",
      "new_value": "2024-01-15"
    }
  ]
}
```

---

## Site Status — Always Derived, Never Stored

Status is computed at render time by `deriveStatus(site)` in `js/utils/siteStatus.js`. Never store it in the JSON.

| Status | Condition |
|---|---|
| `Complete` | `acq.contract_date` is filled **AND** `acceptance.fac === true` |
| `In progress` | `acq.contract_date` is filled **OR** any section has at least one non-empty/non-false field |
| `New` | Nothing filled except `site_id` |

---

## File Path Handling — Windows Network Paths

The app stores Windows network paths pointing to files on the company's local server. The app never uploads, downloads, or touches files — it only stores and displays paths.

**Key behaviors:**
- "Open folder" button → opens `file:///Z:/sites/EG-CAI-001/` in a new tab (works on Windows when on company network)
- "Copy path" button → copies raw Windows path `Z:\sites\EG-CAI-001\` to clipboard
- Network warning notice → **always shown** next to any file link or folder button:
  > ⚠️ Files are stored on the company server. You must be on the company network or VPN to open them.
- Path builder → `buildFolderPath(siteId, basePath)` returns `Z:\sites\EG-CAI-001\`
- Windows path to file URL → replace `\` with `/` and prepend `file:///`
- Base path is set by admin in Admin → Settings → stored in `data.meta.server_base_path`

**When user is outside the company network:**
File links and folder buttons will silently fail to open. The network warning notice already explains this. No special detection or error handling needed — the notice is already present.

---

## App Routes — Hash-Based Routing

Implemented entirely in plain JS — no router library. A `go(route, param)` function sets `location.hash` (or calls render directly, matching `design/lmp_prototype.html`'s approach) and re-renders the matching page function.

| Route | Renders | Who |
|---|---|---|
| `#/login` | Login page | All (entry point when no session) |
| `#/dashboard` | Dashboard page | All roles |
| `#/sites` | Site list page | All roles |
| `#/sites/new` | Site form page (new) | `admin`, `data_entry` |
| `#/sites/:id` | Site detail page | All roles |
| `#/sites/:id/edit` | Site form page (edit) | `admin`, `data_entry` |
| `#/export` | Export page | Users where `can_export: true` or role `admin` |
| `#/admin` | Admin page | `admin` only |
| `#/` | — | Redirect to `#/dashboard` if logged in, else `#/login` |

A `canAccessRoute(user, route)` guard in `js/utils/permissions.js` runs before every render and redirects if the current user isn't allowed on that route.

---

## File Map — One Job Per File

No `node_modules`, no `package.json`, no config files for bundlers. Every file is loaded directly by the browser.

```
lmp-acq-db/
├── CLAUDE.md                        ← you are here
├── BUILD.md                         ← step-by-step build guide
├── design/
│   └── lmp_prototype.html           # Approved visual reference — see "Visual Reference" section below
├── index.html                       # The entire app's single HTML entry point.
│                                     # Loads css/*.css, then js/main.js as a module,
│                                     # plus CDN <script> tags for SheetJS + jsPDF.
│
├── css/
│   ├── tokens.css                   # CSS custom properties: colors, radius, spacing — values from design/lmp_prototype.html
│   ├── base.css                     # Resets, typography, RTL base rules
│   ├── layout.css                   # Sidebar, topbar, content area
│   ├── components.css               # Buttons, inputs, cards, badges, modal, toast, tabs
│   └── pages.css                    # Page-specific layout (dashboard charts, tables, forms)
│
├── js/
│   ├── main.js                      # Entry point: imports everything, calls render() once on load
│   ├── state.js                     # In-memory app state: DATA, CURRENT_USER, ROUTE, IS_DIRTY, UI
│   ├── router.js                    # go(route, param), reads/writes location.hash, calls render()
│   ├── render.js                    # Top-level render() — picks the right page function based on ROUTE
│   │
│   ├── i18n/
│   │   ├── en.js                    # English UI strings (plain JS object, exported)
│   │   ├── ar.js                    # Arabic UI strings — every key in en.js must exist here
│   │   └── i18n.js                  # t(key), setLanguage(lang) — reads/writes localStorage 'lmp_lang'
│   │
│   ├── data/
│   │   ├── bootstrap.js             # BOOTSTRAP_ADMIN, makeMockData() for first-run/demo data
│   │   ├── dataActions.js           # loadJSON(), exportJSON(), addSite(), updateSite(), deleteSite(), saveUsers(), updateMeta()
│   │   └── auth.js                  # login(), logout()
│   │
│   ├── pages/
│   │   ├── loginPage.js             # renderLoginPage() → HTML string + bindLoginEvents()
│   │   ├── dashboardPage.js         # renderDashboardPage() + bindDashboardEvents()
│   │   ├── siteListPage.js          # renderSiteListPage() + bindSiteListEvents()
│   │   ├── siteDetailPage.js        # renderSiteDetailPage() + bindSiteDetailEvents()
│   │   ├── siteFormPage.js          # renderSiteFormPage() + bindSiteFormEvents()
│   │   ├── exportPage.js            # renderExportPage() + bindExportEvents()
│   │   └── adminPage.js             # renderAdminPage() + bindAdminEvents()
│   │
│   ├── components/
│   │   ├── sidebar.js               # renderSidebar()
│   │   ├── topbar.js                # renderTopbar(title, sub, actionsHtml)
│   │   ├── badge.js                 # statusBadgeHtml(status)
│   │   ├── modal.js                 # modalHtml(title, bodyHtml, footHtml), openModal(), closeModal()
│   │   ├── toast.js                 # showToast(msg, type)
│   │   └── fileLinkRow.js           # fileLinkRowHtml(file)
│   │
│   ├── utils/
│   │   ├── siteStatus.js            # deriveStatus(site)
│   │   ├── permissions.js           # filterSitesByPermissions(), canEditSite(), canAccessRoute()
│   │   ├── filePaths.js             # buildFolderPath(), buildFilePath(), toFileUrl()
│   │   ├── exportHelpers.js         # flattenSiteForExcel(), exportToExcel(), exportToCSV(), exportToPDF()
│   │                                 #   — uses the global `XLSX` and `jspdf` objects loaded via CDN <script> tags
│   │   ├── format.js                # fmtDate(), escapeHtml(), initials()
│   │   └── theme.js                 # THEMES, getTheme(), setTheme(theme) — reads/writes localStorage 'lmp_theme'
│   │
│   └── constants/
│       └── fields.js                # ACQ_FIELDS, STA_FIELDS, CONSTRUCTION_FIELDS, ACCEPTANCE_FIELDS, ALL_FIELDS
│
└── favicon.ico
```

### CDN scripts loaded in `index.html` (pin exact versions, no npm)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
<script type="module" src="js/main.js"></script>
```

`js/` files use native ES modules (`import`/`export`) — modern browsers support this natively with `<script type="module">`, so no bundler is needed for that either.

---

## Visual Reference — Use This, Don't Reinvent

`design/lmp_prototype.html` is the **approved visual design AND the approved architecture** for this app — it is already plain HTML/CSS/JS with hash routing and a plain-JS i18n object. Open it in a browser before starting any work.

The build is essentially: **take the prototype's single file and split it into the modular files in the File Map above**, then replace the mock data plumbing with the real `loadJSON`/`exportJSON`/`addSite` etc. functions.

Match the prototype **exactly** for:
- Colors, spacing, border-radius, shadows (see Design System section below — these values are lifted directly from the prototype's CSS)
- Component look and feel: buttons, badges, cards, inputs, tabs, modals, toasts
- Page layouts: sidebar + topbar shell, dashboard KPI cards and charts, site list table, site detail panels, tabbed form, export cards, admin tabs
- The general render pattern: a JS function returns an HTML string for a page/component, it's inserted via `innerHTML`, then a `bind*Events()` function attaches event listeners afterward — this is the pattern used throughout the prototype and should be used throughout the real app too

When building each page or component, open the matching section of `design/lmp_prototype.html` (view source or inspect in browser) and lift its CSS into the matching file in `css/`, and its render logic into the matching file in `js/pages/` or `js/components/`.

---

## Design System

**Theme:** Light content area (white cards on soft gray background) + a **fixed navy sidebar**, with a **switchable accent color** that the user picks from a 4-swatch palette changer in the sidebar (bottom, above the language toggle). This supersedes the original all-light prototype look — see "Theme Switcher" below before assuming the prototype's literal colors are still current.

| Token | Value |
|---|---|
| Background | `#f5f6fa` |
| Card / surface | `#ffffff` |
| Border | `#e2e4ed` |
| Text primary | `#1a1d2e` |
| Text secondary | `#4a4f6a` |
| Text muted | `#9095b0` |
| Success | `#16a34a` |
| Warning | `#d97706` |
| Danger | `#e05252` |
| Purple | `#7c3aed` |
| Teal | `#0d9488` |

**Status badge colors:**

| Status | Background | Text |
|---|---|---|
| Complete | `#dcfce7` | `#15803d` |
| In progress | `#fef3c7` | `#b45309` |
| New | `#ede9fe` | `#6d28d9` |

**Typography:** `'Segoe UI', system-ui, -apple-system, sans-serif`
**Border radius:** `14px` cards, `8px` inputs and buttons
**Shadows:** `--shadow-sm` on `.card`, `--shadow-md` for hover-elevated elements (e.g. `.export-card:hover`)
**Bilingual:** English (LTR) + Arabic (RTL). `document.documentElement.dir` toggled on language change. Flex containers use plain `flex-direction: row` — **never** `row-reverse` for RTL, since `row` is already direction-aware and flips automatically once `dir="rtl"` is set; adding `row-reverse` double-flips and breaks the layout.

### Theme switcher — accent color, independent of the sidebar

- `js/utils/theme.js` exports `THEMES = ['blue','teal','purple','crimson']`, `getTheme()`, `setTheme(theme)` — same pattern as `i18n.js` (module-level state + registered render callback to avoid circular imports)
- `setTheme(theme)` sets `document.documentElement.dataset.theme`, persists to `localStorage('lmp_theme')`, re-renders
- `css/tokens.css` defines `[data-theme="blue|teal|purple|crimson"]` blocks that override `--primary`, `--primary-dark`, `--primary-soft` — this is the **only** thing that changes between themes
- **The navy sidebar never changes with the theme** — only buttons, links, the active nav-item border, badges, and chart accents follow the selected theme color
- Swatch reference colors (`--theme-color-*`) are separate, fixed tokens in `tokens.css` so the swatch row can render all 4 options regardless of which one is currently active

### `css/tokens.css` — current values

```css
:root {
  --bg: #f5f6fa;
  --card: #ffffff;
  --border: #e2e4ed;
  --text: #1a1d2e;
  --text2: #4a4f6a;
  --muted: #9095b0;
  --primary: #3d5af1;
  --primary-dark: #2d47d4;
  --primary-soft: #3d5af11f;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #e05252;
  --purple: #7c3aed;
  --teal: #0d9488;
  --st-complete-bg: #dcfce7;
  --st-complete-tx: #15803d;
  --st-prog-bg: #fef3c7;
  --st-prog-tx: #b45309;
  --st-new-bg: #ede9fe;
  --st-new-tx: #6d28d9;
  --radius-card: 14px;
  --radius-control: 8px;
  --shadow-sm: 0 1px 2px rgba(16, 24, 64, 0.05);
  --shadow-md: 0 4px 14px rgba(16, 24, 64, 0.08);
  --font-base: 'Segoe UI', system-ui, -apple-system, sans-serif;

  --navy: #0f1942;
  --navy-soft: #16215a;
  --navy-border: #232c63;
  --navy-text: #aab2d8;
  --navy-text-strong: #ffffff;
  --navy-muted: #6b74a8;

  --theme-color-blue: #3d5af1;
  --theme-color-teal: #0d9488;
  --theme-color-purple: #7c3aed;
  --theme-color-crimson: #be123c;
}

[data-theme="blue"]    { --primary: #3d5af1; --primary-dark: #2d47d4; --primary-soft: #3d5af11f; }
[data-theme="teal"]    { --primary: #0d9488; --primary-dark: #0b7a70; --primary-soft: #0d94881f; }
[data-theme="purple"]  { --primary: #7c3aed; --primary-dark: #6425c9; --primary-soft: #7c3aed1f; }
[data-theme="crimson"] { --primary: #be123c; --primary-dark: #9f0f32; --primary-soft: #be123c1f; }
```

Use these variables everywhere in `css/*.css` — never hardcode a hex color in a component file. If you need a tinted version of `var(--primary)` for a shadow/glow (not a flat fill), use `color-mix(in srgb, var(--primary) X%, transparent)` rather than a literal `rgba(...)`, so it stays theme-aware.

### Component reference cheatsheet (current)

| Component | Key styling |
|---|---|
| `.btn-primary` | bg `var(--primary)`, white text, `var(--radius-control)` radius, `9px 15px` padding, hover → `var(--primary-dark)` |
| `.btn-ghost` | transparent bg, `1px solid var(--border)`, `var(--text2)` color |
| `.btn-danger` | bg `#fbeaea`, text `var(--danger)` |
| `.card` | white bg, `1px solid var(--border)`, `var(--radius-card)` radius, `var(--shadow-sm)` |
| `.badge` | pill shape, `3px 10px` padding, `11.5px` bold text, status colors from table above |
| Sidebar | `230px` fixed width, **navy** bg (`var(--navy)`), border-inline-end `var(--navy-border)`, active nav item gets `3px` inline-start border in `var(--primary)` + `rgba(255,255,255,.08)` bg, text `var(--navy-text)` / active `var(--navy-text-strong)` |
| Theme swatches | row of 4 `20px` circles (`.swatch.blue/.teal/.purple/.crimson`), active one gets a white ring + navy halo |
| Topbar | white bg, bottom border, `16px 26px` padding, flex space-between |
| Inputs | `1px solid var(--border)`, `8px` radius, `9px 10px` padding, focus ring `0 0 0 3px var(--primary-soft)` with `var(--primary)` border |
| Modal | centered, `max-width: 560px`, `12px` radius, dark overlay `rgba(20,22,40,.45)` |
| Toast | fixed bottom-end, dark bg, `9px` radius, auto-dismiss 2s |

Use CSS logical properties everywhere for RTL support (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-end`, `text-align: start`) — never `margin-left`, `padding-right`, etc.

---

## i18n Rules

- All UI text uses `t('key')` from `js/i18n/i18n.js` — never hardcode strings in JS template literals
- Every key in `js/i18n/en.js` must have a matching key in `js/i18n/ar.js`
- Language preference saved to `localStorage` as `lmp_lang`
- On language change: call `setLanguage(lang)` which updates the active language object, localStorage, `document.documentElement.dir`, and re-renders
- Date format: `DD MMM YYYY` in both languages, Gregorian calendar only
- Use the native `Intl`/`Date` APIs for formatting — no date library needed

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Render functions | camelCase + `render` prefix | `renderSiteFormPage`, `renderTopbar` |
| Event-binding functions | camelCase + `bind` prefix | `bindSiteFormEvents` |
| Utils | camelCase | `buildFolderPath`, `deriveStatus` |
| JSON field keys | snake_case | `site_id`, `contract_date` |
| i18n keys | snake_case | `field_address`, `status_complete` |
| CSS | plain classes, BEM-ish where helpful, custom properties for all tokens | `.btn-primary`, `.field-disp` |
| Files | camelCase, matches the main exported function | `siteFormPage.js` exports `renderSiteFormPage` |

---

## What NOT to Do

- Never add `package.json`, `node_modules`, or any npm dependency
- Never introduce a bundler, transpiler, or build step of any kind
- Never use React, Vue, or any UI framework — plain JS template-literal rendering only
- Never persist site data, users, or audit log to localStorage
- Never make any `fetch()` call to an external API at runtime
- Never hardcode any visible string in JS — always use `t('key')`
- Never show a file link or folder button without the network warning notice
- Never allow deletion of the last admin user
- Never modify audit log entries — append only, always
- Never store status in the JSON — always derive it with `deriveStatus()`
- Never hardcode a hex color outside `css/tokens.css` — always reference the CSS variable
- Never add a feature not in this file without confirming with the project owner (Khaled)
