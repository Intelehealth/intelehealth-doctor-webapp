import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpAndSupportRoutingModule } from './help-and-support-routing.module';
import { HelpAndSupportComponent } from './help-and-support.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    HelpAndSupportComponent
  ],
  imports: [
    CommonModule,
    HelpAndSupportRoutingModule,
     MatTabsModule,
     MatExpansionModule,
     TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ]
})
export class HelpAndSupportModule { }
