import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private authSvc: AuthService,
    private snackbar: MatSnackBar,
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(this.addAuthToken(request)).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const res: any = event?.body;
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.snackbar.open(`Session Expired, Please login again.`, null, {
            duration: 4000,
          });
          this.authSvc.logout();
        }

        return throwError(error);
      })
    );
  }

  addAuthToken(request: HttpRequest<any>) {
    const token = this.authSvc.authToken;
    if (token && request.url.includes(':3030/v2/node/')) {
      return request.clone({
        setHeaders: {
          Authorization: token,
        },
      });
    }
    return request;
  }
}
