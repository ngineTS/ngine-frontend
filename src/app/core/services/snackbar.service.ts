import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {

  constructor(private _snackBar: MatSnackBar) {}

  showSuccessSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      verticalPosition: 'bottom',
      duration: 10000
    });
  }

  showErrorSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      verticalPosition: 'top',
      duration: 5000
    });
  }
  
 }