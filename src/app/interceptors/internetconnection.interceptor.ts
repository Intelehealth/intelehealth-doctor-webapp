import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalinternetconnectionComponent } from "../component/modalinternetconnection/modalinternetconnection.component";

@Injectable()
export class InternetconnectionInterceptor implements HttpInterceptor {
  constructor(private modalService: NgbModal) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!navigator.onLine) {
      const modalRef = this.modalService.open(
        ModalinternetconnectionComponent,
        {
          backdrop: true,
          size: "s",
        }
      );
    }
    return next.handle(request);
  }
}
