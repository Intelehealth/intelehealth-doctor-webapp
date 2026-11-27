import { HttpContextToken } from '@angular/common/http';

/** Set on a request whose errors the caller handles itself: no toast, no logout, raw HttpErrorResponse passed on */
export const SKIP_ERROR_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
