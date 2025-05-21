import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiddxService } from '../services/aiddx.service';
import { CONFIG_SERVICE, DIAGNOSIS_SERVICE, ENVIRONMENT } from './token';
import { AillmddxComponent } from '../public-api';
import { TranslateModule } from '@ngx-translate/core';
import { AillmtxMedicationComponent } from './aillmtx-medication/aillmtx-medication.component';



@NgModule({
  declarations: [
    AillmddxComponent,
    AillmtxMedicationComponent
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    AillmddxComponent
  ],
  providers: [
    { provide: ENVIRONMENT, useValue: {} }, // Default value (overridden by the main app)
    AiddxService
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
