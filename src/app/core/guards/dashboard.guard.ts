import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppointmentService } from 'src/app/services/appointment.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements CanActivate {

  constructor(
    private router: Router,
    private apService: AppointmentService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const user = JSON.parse(localStorage.getItem('user'));
      const provider = JSON.parse(localStorage.getItem('provider'));
      return this.apService.getScheduledMonths(user.uuid, new Date().getFullYear()).pipe(map((res: any) => {
        if (res) {
          if (res.data.length && provider.attributes.length) {
            return true;
          } else {
            this.router.navigate(['/dashboard/get-started']);
            return true;
          }
        }
      }), catchError(() => {
        this.router.navigate(['/dashboard/get-started']);
        return of(false);
      }));
  }
}
