import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiddxService } from '../services/aiddx.service';
import { AiTxService } from '../services/aitx.service';
import { CONFIG_SERVICE, DIAGNOSIS_SERVICE, ENVIRONMENT } from './token';
import { AillmddxComponent } from '../public-api';
import { TranslateModule } from '@ngx-translate/core';
import { AillmtxMedicationComponent } from './aillmtx-medication/aillmtx-medication.component';
import { AillmtxAdviceComponent } from './aillmtx-advice/aillmtx-advice.component';
import { AillmtxTestComponent } from './aillmtx-test/aillmtx-test.component';
import { AillmtxFollowupComponent } from './aillmtx-followup/aillmtx-followup.component';
import { AillmtxReferralComponent } from './aillmtx-referral/aillmtx-referral.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    AillmddxComponent,
    AillmtxMedicationComponent,
    AillmtxAdviceComponent,
    AillmtxTestComponent,
    AillmtxFollowupComponent,
    AillmtxReferralComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatMenuModule,
    MatExpansionModule,
    NgbTooltipModule
  ],
  exports: [
    AillmddxComponent,
    AillmtxMedicationComponent,
    AillmtxAdviceComponent,
    AillmtxTestComponent,
    AillmtxFollowupComponent,
    AillmtxReferralComponent
  ],
  providers: [
    { provide: ENVIRONMENT, useValue: {} }, // Default value (overridden by the main app)
    AiddxService,
    AiTxService
  ]
})
export class AiddxLibraryModule {
  static forRoot(config: {
    environment: any;
  }): ModuleWithProviders<AiddxLibraryModule> {
    return {
      ngModule: AiddxLibraryModule,
      providers: [
        { provide: ENVIRONMENT, useValue: config.environment },
      ]
    };
  }
}
