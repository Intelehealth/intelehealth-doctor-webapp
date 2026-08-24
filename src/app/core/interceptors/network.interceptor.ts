import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { CoreService } from 'src/app/services/core/core.service';
import { SKIP_CREDENTIALS } from './http-context.tokens';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  constructor(private coreService: CoreService) { }

  intercept(_request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const request: HttpRequest<any> = _request.clone({
      withCredentials: _request.context.get(SKIP_CREDENTIALS) ? false : true,
    })

    if (!navigator.onLine) {
      // if there is no internet, throw a HttpErrorResponse error
      // since an error is thrown, the function will terminate here
      this.coreService.openNoInternetConnectionModal().subscribe((res: boolean) => {
        if (res) {
          next.handle(request);
        }
      });
      const error = {
        status: 0,
        error: {
          description: 'Check Connectivity!'
        },
        statusText: 'Check Connectivity!'
      };
      return throwError(error);
    } else {
      return next.handle(request);
    }
  }
}
