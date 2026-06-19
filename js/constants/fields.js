function buildFields(section, defs) {
  return defs.map((f) => ({
    key: f.key,
    section,
    type: f.type,
    label_key: 'field_' + f.key,
    required: false,
    options: f.options || [],
  }));
}

export const ACQ_FIELDS = buildFields('acq', [
  { key: 'address', type: 'text' },
  { key: 'nominal_coords', type: 'text' },
  { key: 'option_coords', type: 'text' },
  { key: 'dis_from_nom', type: 'text' },
  { key: 'option', type: 'text' },
  { key: 'sf2_date', type: 'date' },
  { key: 'typology', type: 'select', options: ['Rooftop', 'Greenfield', 'Indoor', 'Street level'] },
  { key: 'sf3_comment', type: 'text' },
  { key: 'sf51_doc', type: 'text' },
  { key: 'sf3_date', type: 'date' },
  { key: 'contract_date', type: 'date' },
  { key: 'initial_pm_date', type: 'date' },
  { key: 'final_pm_date', type: 'date' },
  { key: 'negotiator', type: 'text' },
  { key: 'surveyor', type: 'text' },
  { key: 'survey_date', type: 'date' },
  { key: 'initial_permit_date', type: 'date' },
  { key: 'permitted_by', type: 'text' },
  { key: 'power_source', type: 'select', options: ['Grid', 'Generator', 'Solar', 'Other'] },
  { key: 'acquisition_manager', type: 'text' },
  { key: 'owner', type: 'text' },
  { key: 'rental_value', type: 'text' },
  { key: 'owner_phone', type: 'text' },
  { key: 'final_permit_date', type: 'date' },
  { key: 'environment_date', type: 'date' },
  { key: 'comments', type: 'textarea' },
  { key: 'agriculture_receipt', type: 'checkbox' },
  { key: 'environment_receipt', type: 'checkbox' },
  { key: 'civil_aviation_receipt', type: 'checkbox' },
  { key: 'pm_charge_receipt', type: 'checkbox' },
  { key: 'cooperation', type: 'checkbox' },
  { key: 'agriculture_date', type: 'date' },
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
