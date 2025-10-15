import { Component } from '@angular/core';
import { UserSignUpPayload } from '../../../models/user.interface';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { SignContainerComponent } from '../sign-container/sign-container.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../../../services/app.service';

@Component({
  selector: 'app-sign-up',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
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
              private _appService: AppService
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

  onEmailAdressChange(){
    this.emailAddressAlreadyExists = false;
  }

  onPasswordChange(){
    if(this.userForm.password!.length >= 8){
      this.passwordTooShort = false;
    }
  }

  onSignUpClick(){
    this._authService.checkIfEmailAddressAlreadyExists(this.userForm.emailAddress)
      .subscribe((resp: boolean) => {
        if(resp === true){
          this.emailAddressAlreadyExists = true;
        }
        else{
          if(this.userForm.password!.length < 8){
            this.passwordTooShort = true;
          }
          else{
            this._authService.userSignUp(this.userForm)
              .subscribe((result: { [x: string]: string; }) => {
                localStorage.setItem('access_token', result['access_token']);
                this._dialogRef.close();
                this._appService.createAppRouting();
              });
          }
        }
      });
  }

  isSignUpDisabled(){
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
