import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AppConfigService } from '../../services/app-config.service';

/**
 * Allows QMS-only routes (the doctor queue) only when qms_section is enabled in config
 */
@Injectable({
  providedIn: 'root'
})
export class QmsGuard implements CanActivate {
  constructor(private appConfigService: AppConfigService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.appConfigService.qms_section ? true : this.router.parseUrl('/dashboard');
  }
}
