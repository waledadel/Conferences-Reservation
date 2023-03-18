import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export type ISnackBarColor = 'success' | 'warning' | 'danger';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  private horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private snackBar: MatSnackBar) { }

  showNotifier(message: string, type: ISnackBarColor = 'success'): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
