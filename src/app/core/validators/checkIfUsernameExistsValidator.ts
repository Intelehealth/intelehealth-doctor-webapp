import { AbstractControl } from "@angular/forms";
import { timer } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { AuthService } from "src/app/services/auth.service";

export const checkIfUsernameExistsValidator =
  (authService: AuthService, time: number = 500) => {
    return (input: AbstractControl) => {
      return timer(time).pipe(
        switchMap(() => authService.checkIfUsernameExists(input.value)),
        map((res: any) => {
          if (res) {
            if (res.results.length) {
              return null;
            }
          }
          return { usernameExists: true }
        })
      );
    };
};
