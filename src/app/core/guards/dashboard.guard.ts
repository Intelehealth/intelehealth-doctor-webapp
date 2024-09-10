import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponseModel } from 'src/app/model/model';
import { AppointmentService } from 'src/app/services/appointment.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { doctorDetails } from 'src/config/constant';

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
      const user = getCacheData(true, doctorDetails.USER);
      const provider = getCacheData(true, doctorDetails.PROVIDER);
     
      if(user?.roles?.find((role) => role?.name?.includes('Organizational:MCC'))) {
        return of(true);
      }

      return this.apService.getScheduledMonths(user.uuid, new Date().getFullYear().toString()).pipe(map((res: ApiResponseModel) => {
        if (res) {
          if (res.data.length && provider.attributes.length) {
            return true;
          } else {
            this.router.navigate(['/dashboard/get-started'], { queryParams: { pc: (provider.attributes.length) ? true : false, sc: (res.data.length) ? true : false } });
            return true;
          }
        }
      }), catchError(() => {
        this.router.navigate(['/dashboard/get-started'], { queryParams: { pc: false, sc: false } });
        return of(false);
      }));
  }
}
