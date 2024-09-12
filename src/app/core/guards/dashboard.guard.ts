import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponseModel, ProviderAttributeModel } from 'src/app/model/model';
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

  /**
  * Get speciality
  * @param {ProviderAttributeModel[]} attr - Array of provider attributes
  * @return {string} - Speciality
  */
  getSpecialization(attr: ProviderAttributeModel[] = []): string {
    let specialization = '';
    for (const a of attr) {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
        break;
      }
    }
    return specialization;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      const user = getCacheData(true, doctorDetails.USER);
      const provider = getCacheData(true, doctorDetails.PROVIDER);
    
      const speciality = this.getSpecialization(provider.attributes)

      if(!speciality) {
        this.router.navigate(['/dashboard/get-started'], { queryParams: { pc: true } });
        return of(false);
      }
      
      return this.apService.getScheduledMonths(user.uuid, new Date().getFullYear().toString(), speciality).pipe(map((res: ApiResponseModel) => {
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
