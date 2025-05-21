import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from "@angular/router";
import { VisitSummaryComponent } from "src/app/dashboard/visit-summary/visit-summary.component";

@Injectable()
export class CanDeactivateVisitSummary implements CanDeactivate<VisitSummaryComponent> {
    canDeactivate(component: VisitSummaryComponent, currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot): boolean {
        if(component.changesMade && component.isCallInProgress){
            component.onExitPageConfirmDialog(nextState.url,'You have ongoing Whatsapp Call & unsaved changes that will be lost.');
            return false;
        } else if(component.changesMade){
            component.onExitPageConfirmDialog(nextState.url,'You have unsaved changes that will be lost.');
            return false;
        } else if(component.isCallInProgress){
            component.onWhatsappOngoingDialog();
            return false;
        }else {
            return true;
        }
    }
}