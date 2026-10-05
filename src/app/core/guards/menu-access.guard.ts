import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { NgxRolesService } from 'ngx-permissions';
import { AppConfigService } from '../../services/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class MenuAccessGuard implements CanActivate {
  constructor(
    private appConfigService: AppConfigService,
    private router: Router,
    private roleService: NgxRolesService
  ) {}

  canActivate(route: any): boolean {
    const menu = route.data?.menu || route.routeConfig?.data?.menu;
    const feature = route.data?.feature || route.routeConfig?.data?.feature;
    const isAdmin = !!this.roleService.getRole('ORGANIZATIONAL:SYSTEM ADMINISTRATOR');

    // A published config flag (e.g. qms_section) that switches a whole section off
    if (feature && !isAdmin && this.appConfigService[feature] === false) {
      this.router?.navigateByUrl('/dashboard');
      return false;
    }

    if (!menu) return true;

    const sidebar_menus = this.appConfigService.sidebar_menus;

    if (!sidebar_menus || isAdmin) return true;

    if (sidebar_menus && !sidebar_menus[menu]) {
      this.router?.navigateByUrl('/dashboard');
      return false;
    }
    
    return true;
  }
}
