import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { QueueRoutingModule } from './queue-routing.module';
import { QueueComponent } from './queue.component';
import { EndShiftComponent } from './modals/end-shift/end-shift.component';
import { PauseQueueComponent } from './modals/pause-queue/pause-queue.component';
import { CallNotHappenedComponent } from './modals/call-not-happened/call-not-happened.component';
import { CallDoneComponent } from './modals/call-done/call-done.component';
import { SharedModule } from '../shared.module';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    QueueComponent,
    EndShiftComponent,
    PauseQueueComponent,
    CallNotHappenedComponent,
    CallDoneComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    QueueRoutingModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatButtonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule
  ]
})
export class QueueModule { }
