import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppointmentService } from 'src/app/services/appointment.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { notifications } from 'src/config/constant';

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
    state: RouterStateSnapshot): Observable<boolean> {
      const user = getCacheData(true,notifications.USER);
      const provider = getCacheData(true,notifications.PROVIDER);
      return this.apService.getScheduledMonths(user.uuid, new Date().getFullYear().toString()).pipe(map((res: any) => {
        if (res) {
          if (res.data.length && provider.attributes.length) {
            return true;
          } else {
            this.router.navigate(['/dashboard/get-started'], { queryParams: { pc: (provider.attributes.length) ? true : false, sc: (res.data.length)? true : false } });
            return true;
          }
        }
      }), catchError(() => {
        this.router.navigate(['/dashboard/get-started'], { queryParams: { pc: false, sc: false } });
        return of(false);
      }));
  }
}
