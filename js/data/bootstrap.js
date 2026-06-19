export const BOOTSTRAP_ADMIN = {
  user_id: 'bootstrap-admin',
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  display_name: 'Administrator',
  active: true,
  site_access: 'all',
  allowed_regions: [],
  allowed_sites: [],
  can_export: true,
  can_upload_files: true,
  created_at: '',
  created_by: 'system',
};

export function makeBootstrapData() {
  return {
    meta: {
      version: '1.0',
      exported_at: null,
      exported_by: null,
      server_base_path: 'Z:\\sites\\',
    },
    users: [BOOTSTRAP_ADMIN],
    sites: [],
    audit_log: [],
  };
}
