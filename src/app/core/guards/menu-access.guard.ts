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
    if (!menu) return true;

    const sidebar_menus = this.appConfigService.sidebar_menus;
    const isAdmin = !!this.roleService.getRole('ORGANIZATIONAL:SYSTEM ADMINISTRATOR');
    
    if (!sidebar_menus || isAdmin) return true;

    if (sidebar_menus && !sidebar_menus[menu]) {
      this.router?.navigateByUrl('/dashboard');
      return false;
    }
    
    return true;
  }
}
