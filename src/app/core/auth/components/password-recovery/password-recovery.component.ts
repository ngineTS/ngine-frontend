import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-password-recovery',
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule
  ],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
})
export class PasswordRecoveryComponent implements OnInit {

  newPassword: string = '';
  repeatPassword: string = '';
  passwordTooShort: boolean = false;
  isResetPasswordButtonDisabled: boolean = false;
  successMessage: string | null = null;
  expiredLinkMessage: string | null = null;

  constructor(private _authService: AuthService,
              @Inject(MAT_DIALOG_DATA)
              public data: { token: string }
             ) { }

  ngOnInit(): void {
  }

  onPasswordChange(){
    if(this.newPassword.length >= 8){
      this.passwordTooShort = false;
    }
  }

  isResetPasswordDisabled(){
    if(this.newPassword !== this.repeatPassword 
       || this.isResetPasswordButtonDisabled
       || this.passwordTooShort
       || !this.newPassword){
        return true;
    }
    return false;
  }

  onResetPasswordClick(){
    if(this.newPassword.length < 8){
      this.passwordTooShort = true;
    }
    else{
      this.isResetPasswordButtonDisabled = true;
      this._authService.resetUserPassword({
        newPassword: this.newPassword,
        repeatPassword: this.repeatPassword,
        token: this.data.token
      }).subscribe((resp: any) => {
        if(resp["affected"] > 0){
          this.successMessage = "Password reset successfull!"
          this.expiredLinkMessage = null;
        }
        else{
          this.successMessage = null;
          this.expiredLinkMessage = resp.toString();
        }
      });
    }
  }


}
