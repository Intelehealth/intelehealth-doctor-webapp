import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';


export class ProviderAttributeValidator {
  static createValidator(authService: AuthService, type: string, uuid: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      return timer(1000).pipe(
        switchMap(() => authService.validateProviderAttribute(type, control.value, uuid)),
        map((res: any) =>
          res.data ? null : { alreadyExists: true }
        )
      );
    };
  }
}
