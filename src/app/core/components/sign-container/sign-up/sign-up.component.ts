import { Component } from '@angular/core';
import { UserSignUpPayload } from '../../../models/user.interface';
import { AuthService } from '../../../auth/services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SignContainerComponent } from '../sign-container.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../../../services/app.service';
import { SnackBarService } from '../../../services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sign-up',
  imports: [
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

  userForm!: UserSignUpPayload;
  repeatPassword: string | null = null;
  emailAddressAlreadyExists: boolean = false;
  passwordTooShort: boolean = false;

  constructor(public _authService: AuthService, 
              public _dialogRef: MatDialogRef<SignContainerComponent>,
              private _appService: AppService,
              private _snackbarService: SnackBarService
              ) { }

  ngOnInit(): void {
    this.userForm = {
      name: '',
      lastName: '',
      emailAddress: '',
      password: '',
    }
    this.repeatPassword = null;
  }

  onEmailAdressChange() {
    this.emailAddressAlreadyExists = false;
  }

  onPasswordChange() {
    this.passwordTooShort = this.userForm.password!.length < 8 ? true : false;
  }

  onSignUpClick() {
    this._authService.userSignUp(this.userForm).subscribe({
      next: (result: any) => {
        if (result) {
          localStorage.setItem('access_token', result['access_token']);
          this._snackbarService.showSuccessSnackBar("Welcome!");
          this._dialogRef.close();
          this._appService.createAppRouting('/');
        }
      }
    });
  }

  isSignUpDisabled() {
    if(!this.userForm.emailAddress 
       || !this.userForm.password 
       || this.userForm.password !== this.repeatPassword
       || !this.userForm.emailAddress.includes('@')
       || this.emailAddressAlreadyExists
       || this.passwordTooShort){
      return true;
    }
    return false;
  }
}
