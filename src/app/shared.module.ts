import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultImageDirective } from './core/directives/default-image.directive';
import { MatTableResponsiveDirective } from './core/directives/mat-table-responsive.directive';
import { PasswordStrengthMeterComponent } from './core/components/password-strength-meter/password-strength-meter.component';

@NgModule({
  declarations: [NoValuePipe, DefaultImageDirective, MatTableResponsiveDirective, PasswordStrengthMeterComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [NoValuePipe, TranslateModule, DefaultImageDirective, MatTableResponsiveDirective, PasswordStrengthMeterComponent]
})
export class SharedModule { }
