export const REPORT_API_ENDPOINTS = {
  report: '/api/report',
  filterOptions: '/api/report/filter-options',
  export: '/api/report/export',
} as const;

export const DASHBOARD_API_ENDPOINTS = {
  statistics: '/api/dashboard/statistics',
} as const;

export const CLIENT_DASHBOARD_API_ENDPOINTS = {
  dashboard: '/api/campaigns/client-dashboard',
} as const;

export const AUTH_API_ENDPOINTS = {
  login: '/api/auth/login',
  users: '/api/auth/users',
  register: '/api/auth/register',
} as const;
