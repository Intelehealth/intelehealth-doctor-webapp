import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { CoreService } from 'src/app/services/core/core.service';

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
    constructor(private coreService: CoreService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (!navigator.onLine) {
        // if there is no internet, throw a HttpErrorResponse error
        // since an error is thrown, the function will terminate here
        this.coreService.openNoInternetConnectionModal().subscribe((res: any) => {
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
