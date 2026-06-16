import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NgxUiLoaderService } from "ngx-ui-loader";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loader: NgxUiLoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const excludedPatterns = [
        '/api/messages/',
        '/api/support/',
        '/api/auth/validateProviderAttribute',
        '/api/getToken',
        '/api/appointment/',
        '/api/openmrs/getVisitCounts',
        '/api/openmrs/getVisitCountsForDashboard',
        '/api/user/createUpdateStatus',
        '/openmrs/ws/rest/v1/obs',
        '/gen',
        '/vl2',
        '/bs',
        '/vlrv',
        '/lcrep',
        '/attribute',
        '/translate',
        '/saveTranslation',
        '/ncd',
        '/ncdsummary',
        '/concept'
    ];

    const shouldSkip = excludedPatterns.some(pattern =>
      req.url.includes(pattern)
    );

    if (!shouldSkip) {
      this.loader.start();
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (!shouldSkip) {
          this.loader.stop();
        }
      })
    );
  }
}
