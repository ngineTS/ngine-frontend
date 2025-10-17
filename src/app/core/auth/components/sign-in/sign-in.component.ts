import { Component, signal } from '@angular/core';
import { SignContainerComponent } from '../sign-container/sign-container.component';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppService } from '../../../services/app.service';
import { SnackBarService } from '../../../services/snackbar.service';

@Component({
  selector: 'app-sign-in',
  imports: [
    FormsModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

  userEmail: string | null = null;
  userPassword: string | null = null;
  errorEmail: string | null = null;
  errorPassword: string | null = null;
  recoveryEmail: string | null = null;
  continueButtonIsDisabled: boolean = false;
  isLogin: boolean = false;
  hidePassword = signal(true);


  constructor(public _authService: AuthService,
              public _dialogRef: MatDialogRef<SignContainerComponent>,
              private _appService: AppService,
              private _snackbarService: SnackBarService) { }


  isSignInDisabled() {
    if(!this.userEmail || !this.userPassword || this.isLogin){
      return true;
    }
    return false;
  }

  onSignInClick() {
    this.isLogin = true;
    this._authService.userSignIn({ 
      emailAddress: this.userEmail!, 
      password: this.userPassword! 
    }).subscribe({
      next: (resp: any) => {
        localStorage.setItem('access_token', resp['access_token']);
        this._authService.hasSignedIn.next(true);
        this._appService.createAppRouting();
        this._dialogRef.close();
      },
      error: (err /*NestJS error type*/) => {
        this.isLogin = false;
        if (err.statusCode === 404) {
          this.errorEmail = err.message;
          this.errorPassword = null;
        }
        if (err.statusCode === 400) {
          this.errorPassword = err.message;
          this.errorEmail = null;
        }
      }
    });
  }

  onForgotPasswordClick() {
    this._authService.forgotPwdPage = true;
    this.errorEmail = null;
  }

  onGoBackClick() {
    this._authService.forgotPwdPage = false;
    this.errorEmail = null;
    this.recoveryEmail = null;
  }

  onContinueClick() {
    this.continueButtonIsDisabled = true;
    this._authService.askForgotPasswordLink(this.recoveryEmail!)
      .subscribe({
        next: () => {
            this._snackbarService.showSuccessSnackBar('Email successfully sent! Please check your mailbox.');
        },
        error: (err /*NestJS error type*/) => {
          this.errorEmail = err.message;
          this.continueButtonIsDisabled = false;
        }
      });
  }

  passwordEyeclickEvent(event: MouseEvent) {
      this.hidePassword.set(!this.hidePassword());
      event.stopPropagation();
  }
}
