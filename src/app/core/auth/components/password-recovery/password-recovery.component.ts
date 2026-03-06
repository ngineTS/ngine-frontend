import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SnackBarService } from '../../../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-password-recovery',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent {

  newPassword: string = '';
  repeatPassword: string = '';
  passwordTooShort: boolean = false;
  expiredLinkMessage: string | null = null;

  constructor(private _authService: AuthService,
              @Inject(MAT_DIALOG_DATA)
              public data: { token: string },
              private _snackbarService: SnackBarService
             ) { }


  onPasswordChange() {
    this.passwordTooShort = this.newPassword.length < 8 ? true : false;
  }

  isResetPasswordDisabled(){
    if(this.newPassword !== this.repeatPassword 
       || this.passwordTooShort
       || !this.newPassword){
        return true;
    }
    return false;
  }

  onResetPasswordClick(){
    this._authService.resetUserPassword({
      newPassword: this.newPassword,
      repeatPassword: this.repeatPassword,
      token: this.data.token
    }).subscribe({
      next: (resp: any) => {
        if (resp["affected"] > 0) {
          this._snackbarService.showSuccessSnackBar('Password reset successfull!');
          this.expiredLinkMessage = null;
          this.newPassword = '';
          this.repeatPassword = '';
        }
      },
      error: (err /* NestJS error type */) => {
        this.expiredLinkMessage = err.message;
        this.newPassword = '';
        this.repeatPassword = '';
      }
    });
  }

}
