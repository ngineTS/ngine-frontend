import { Component, NgModule, signal } from '@angular/core';
import { SignContainerComponent } from '../sign-container/sign-container.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
  errorSendingEmail: string | null = null;
  emailSentMessage: string | null = null;
  continueButtonIsDisabled: boolean = false;
  isLogin: boolean = false;
  hidePassword = signal(true);


  constructor(public _authService: AuthService,
              public _dialogRef: MatDialogRef<SignContainerComponent>,
              private _router: Router) { }

  ngOnInit(): void {
  }

  resetErrorPassword(){
   this.errorPassword = null; 
  }

  isSignInDisabled(){
    if(!this.userEmail || !this.userPassword || this.isLogin){
      return true;
    }
    return false;
  }

  onSignInClick(){
    this.isLogin = true;
    this._authService.userSignIn({ 
      emailAddress: this.userEmail!, 
      password: this.userPassword! 
    }).subscribe((resp: { [x: string]: string; }) => {
      if(resp['emailErr']){
        this.errorEmail = resp['emailErr'];
        this.errorPassword = null;
        this.isLogin = false;
      } else if(resp['passwordErr']){
        this.errorPassword = resp['passwordErr'];
        this.errorEmail = null;
        this.isLogin = false;
      }
      else{
        this.errorEmail = null;
        this.errorPassword = null;
        localStorage.setItem('access_token', resp['access_token']);
        this.isLogin = false;
        this._dialogRef.close();
        this._router.navigate(['']);
      }
    });
  }

  onForgotPasswordClick(){
    this._authService.forgotPwdPage = true;
  }

  onGoBackClick(){
    this._authService.forgotPwdPage = false;
    this.errorSendingEmail = null;
    this.emailSentMessage = null;
    this.recoveryEmail = null;
  }

  onContinueClick(){
    this.continueButtonIsDisabled = true;
    this._authService.askForgotPasswordLink(this.recoveryEmail!).subscribe(
      (resp: { [x: string]: string | null; }) => {
        if(resp["err"]){
          this.errorSendingEmail = resp["err"];
          this.emailSentMessage = null;
        }
        else{
          this.emailSentMessage = "Email successfully sent! Please check your mailbox";
          this.errorSendingEmail = null;
        }
        this.continueButtonIsDisabled = false;
      },
      (error: { error: string | null; }) => {
        this.errorSendingEmail = error.error;
        this.continueButtonIsDisabled = false;
      }
    );
  }

  passwordEyeclickEvent(event: MouseEvent) {
      this.hidePassword.set(!this.hidePassword());
      event.stopPropagation();
  }
}
