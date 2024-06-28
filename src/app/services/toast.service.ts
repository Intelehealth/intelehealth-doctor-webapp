import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: "root",
})
export class ToastService {
    constructor(public snackbar: MatSnackBar) { }

    public toast(message,
        duration = 5000,
        horizontalPosition = "center",
        verticalPosition = "bottom",
    ) {
        const opts: any = {
            duration,
            horizontalPosition,
            verticalPosition,
        };
        this.snackbar.open(message, null, opts);
    }
}
