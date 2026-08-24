import { HttpContextToken } from '@angular/common/http';

/** Skip sending browser cookies on this request (used during login to avoid stale session cookies). */
export const SKIP_CREDENTIALS = new HttpContextToken<boolean>(() => false);

/** Suppress automatic logout on 401/403 (used during the login flow). */
export const SUPPRESS_AUTH_LOGOUT = new HttpContextToken<boolean>(() => false);
