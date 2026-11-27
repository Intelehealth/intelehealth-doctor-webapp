import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { AppConfigService } from "src/app/services/app-config.service";

/** Which visit summary a route is — set as `data: { visitSummaryUi }` on the route. */
export type VisitSummaryUi = 'old' | 'v2';

/**
 * Admin Actions → Visit Summary V2 decides which visit summary doctors see, both ways:
 * enabled  → /dashboard/visit-summary/:id    goes to /dashboard/visit-summary-v2/:id,
 * disabled → /dashboard/visit-summary-v2/:id goes to /dashboard/visit-summary/:id.
 * One check on the routes covers every way in (queue, dashboard tables, notifications, chat, refresh…).
 */
@Injectable({ providedIn: 'root' })
export class VisitSummaryV2RedirectGuard implements CanActivate {
    constructor(private appConfigService: AppConfigService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const routeUi: VisitSummaryUi = route.data?.visitSummaryUi === 'v2' ? 'v2' : 'old';
        const wantedUi: VisitSummaryUi = this.appConfigService?.visit_summary_v2_section ? 'v2' : 'old';
        if (routeUi === wantedUi) { return true; }
        const state = this.router.getCurrentNavigation()?.extras?.state;
        const path = wantedUi === 'v2' ? 'visit-summary-v2' : 'visit-summary';
        this.router.navigate(['/dashboard', path, route.paramMap.get('id')], {
            queryParams: route.queryParams,
            state,
            replaceUrl: true
        });
        return false;
    }
}
