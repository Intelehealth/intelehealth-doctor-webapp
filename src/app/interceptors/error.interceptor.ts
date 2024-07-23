import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private toastr: ToastrService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if ([401, 403].indexOf(err.status) != -1) {
        this.toastr.error(err);
        this.authService.logout();
      }

      const error = err.error.message || err.statusText;
      if (request.method == 'DELETE' && request.url.includes('session')) {
        return throwError(error);
      }
      if (error == 'OK') {
        return throwError(error);
      }
      return throwError(error);
    }))
  }
}