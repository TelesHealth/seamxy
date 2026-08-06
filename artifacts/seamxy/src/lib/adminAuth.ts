// Admin authentication utilities
const ADMIN_ID_KEY = 'admin_id';
const ADMIN_DATA_KEY = 'admin_data';

export interface AdminData {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function setAdminAuth(adminData: AdminData) {
  localStorage.setItem(ADMIN_ID_KEY, adminData.id);
  localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
}

export function getAdminId(): string | null {
  return localStorage.getItem(ADMIN_ID_KEY);
}

export function getAdminData(): AdminData | null {
  const data = localStorage.getItem(ADMIN_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_ID_KEY);
  localStorage.removeItem(ADMIN_DATA_KEY);
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminId();
}

// Custom fetch for admin API calls that includes the admin ID header
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const adminId = getAdminId();
  
  if (!adminId) {
    throw new Error('Admin not authenticated');
  }

  const headers = new Headers(options.headers);
  headers.set('x-admin-id', adminId);
  
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

// Admin API request helper
export async function adminApiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await adminFetch(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}
