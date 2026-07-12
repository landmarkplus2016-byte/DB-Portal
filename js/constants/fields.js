import { DATA } from '../state.js';

function buildFields(section, defs) {
  return defs.map((f) => ({
    key: f.key,
    section,
    type: f.type,
    label_key: 'field_' + f.key,
    required: false,
    list: !!f.list,
  }));
}

// The ACQ fields whose options are admin-configurable in Admin → Settings.
// Their option lists live in DATA.meta.field_options[key] and are saved to the JSON file.
export const LIST_FIELD_KEYS = [
  'typology',
  'sf3_status',
  'sf51_doc',
  'power_source',
  'acquisition_manager',
  'negotiator',
  'surveyor',
  'permitted_by',
];

// Fallback options used when the data file has no configured list for a field yet.
export const DEFAULT_FIELD_OPTIONS = {
  typology: ['Rooftop', 'Greenfield', 'Indoor', 'Street level'],
  power_source: ['Grid', 'Generator', 'Solar', 'Other'],
  sf3_status: [],
  sf51_doc: [],
  acquisition_manager: [],
  negotiator: [],
  surveyor: [],
  permitted_by: [],
};

// Current options for a list field: admin-configured value if present, else the default.
export function getFieldOptions(key) {
  const configured = DATA.meta && DATA.meta.field_options && DATA.meta.field_options[key];
  if (Array.isArray(configured)) return configured;
  return DEFAULT_FIELD_OPTIONS[key] || [];
}

// ACQ fields — order matters: it drives both the on-screen layout AND the date-order
// validation chain (each date field cannot be earlier than a filled date listed above it).
export const ACQ_FIELDS = buildFields('acq', [
  { key: 'address', type: 'text' },
  { key: 'nominal_coords', type: 'text' },
  { key: 'option_coords', type: 'text' },
  { key: 'dis_from_nom', type: 'text' },
  { key: 'option', type: 'text' },
  { key: 'acquisition_manager', type: 'select', list: true },
  { key: 'negotiator', type: 'select', list: true },
  { key: 'survey_date', type: 'date' },
  { key: 'surveyor', type: 'select', list: true },
  { key: 'sf2_date', type: 'date' },
  { key: 'typology', type: 'select', list: true },
  { key: 'sf3_date', type: 'date' },
  { key: 'sf3_status', type: 'select', list: true },
  { key: 'sf3_comment', type: 'textarea' },
  { key: 'sf4_date', type: 'date' },
  { key: 'owner', type: 'text' },
  { key: 'rental_value', type: 'currency' },
  { key: 'owner_phone', type: 'tel' },
  { key: 'sf51_doc', type: 'select', list: true },
  { key: 'contract_date', type: 'date' },
  { key: 'req_env_ntra_cover_date', type: 'date' },
  { key: 'req_army_approval_date', type: 'date' },
  { key: 'req_ntra_initial_approval_date', type: 'date' },
  { key: 'req_agr_ntra_cover_date', type: 'date' },
  { key: 'req_civil_aviation_ntra_cover_date', type: 'date' },
  { key: 'agr_cover_date', type: 'date' },
  { key: 'env_cover_date', type: 'date' },
  { key: 'civil_aviation_cover_date', type: 'date' },
  { key: 'permitted_by', type: 'select', list: true },
  { key: 'agriculture_date', type: 'date' }, // "Agriculture Approval Date"
  { key: 'environment_date', type: 'date' }, // "Environment Approval Date"
  { key: 'power_source', type: 'select', list: true },
  { key: 'pmq_date', type: 'date' },
  { key: 'pmq_amount', type: 'currency' },
  { key: 'initial_pm_installation_date', type: 'date' },
  { key: 'pm_charge_date', type: 'date' },
  { key: 'agriculture_receipt_date', type: 'date' },
  { key: 'environment_receipt_date', type: 'date' },
  { key: 'civil_aviation_receipt', type: 'text' },
  { key: 'civil_aviation_allowance_receipt_date', type: 'date' },
  { key: 'cooperation', type: 'textarea' },
  { key: 'ntra_initial_approval_date', type: 'date' },
  { key: 'civil_aviation_approval_date', type: 'date' },
  { key: 'administrative_certificate_date', type: 'date' },
  { key: 'army_permit_fees_date', type: 'date' },
  { key: 'fence_permission_fees_date', type: 'date' },
  { key: 'initial_permit_date', type: 'date' },
  { key: 'initial_power_letter_date', type: 'date' },
  { key: 'ntra_certificate_date', type: 'date' },
  { key: 'final_permit_date', type: 'date' },
  { key: 'final_pm_date', type: 'date' },
  { key: 'comments', type: 'textarea' },
]);

export const STA_FIELDS = buildFields('sta', [
  { key: 'consultant_office', type: 'text' },
  { key: 'sta_date', type: 'date' },
  { key: 'consultant_feedback', type: 'textarea' },
  { key: 'safety_certificate', type: 'checkbox' },
  { key: 'supervision_certificate', type: 'checkbox' },
  { key: 'post_certificate', type: 'checkbox' },
  { key: 'verticality_certificate', type: 'checkbox' },
]);

export const CONSTRUCTION_FIELDS = buildFields('construction', [
  { key: 'rfc', type: 'text' },
  { key: 'rfi', type: 'text' },
  { key: 'sf6', type: 'text' },
  { key: 'construction_manager', type: 'text' },
  { key: 'site_engineer', type: 'text' },
  { key: 'vf_site_establishment', type: 'text' },
]);

export const ACCEPTANCE_FIELDS = buildFields('acceptance', [
  { key: 'acceptance_manager', type: 'text' },
  { key: 'acceptance_engineer', type: 'text' },
  { key: 'vf_task_owner', type: 'text' },
  { key: 'pac', type: 'checkbox' },
  { key: 'fac', type: 'checkbox' },
  { key: 'site_snags', type: 'textarea' },
]);

export const ALL_FIELDS = [...ACQ_FIELDS, ...STA_FIELDS, ...CONSTRUCTION_FIELDS, ...ACCEPTANCE_FIELDS];

// Options for the `section` field on file objects (files[].section) — not a site field,
// used by the Files tab's "Add file link" form (Stage 5.2).
export const FILE_SECTION_OPTIONS = ['ACQ', 'STA', 'Construction', 'Acceptance'];
