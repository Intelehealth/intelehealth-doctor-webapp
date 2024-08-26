import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-password-strength-meter',
  templateUrl: './password-strength-meter.component.html',
  styleUrls: ['./password-strength-meter.component.scss']
})
export class PasswordStrengthMeterComponent implements OnChanges{
  @Input() password: string;
  @Input() showDetails: boolean = false;
  level: number = 0;

  ngOnChanges(): void {
    this.checkPasswordStrength();
  }

  /**
  * Check the password strength level
  * @param {string} str - Password string
  * @return {number} - Strength level between 1 to 4
  */
  checkPasswordStrength() {
    const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{12,})');
    const mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
    const fairPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');
    const lowPassword = new RegExp('(?=.*[a-z])(?=.*[0-9])(?=.{4,})');
    if (strongPassword.test(this.password)) {
      this.level = 4;
    } else if (mediumPassword.test(this.password)) {
      this.level = 3;
    } else if (fairPassword.test(this.password)) {
      this.level = 2;
    } else if(lowPassword.test(this.password)) {
      this.level = 1
    } else {
      this.level = 0;
    }
  }
}
