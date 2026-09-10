import { Component } from '@angular/core';
import { UserSignUpPayload } from '../../../core/models/user.interface';
import { AuthService } from '../../../core/auth/services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppService } from '../../../core/services/app.service';
import { SnackBarService } from '../../../core/services/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthPack } from '../../authentication-management/auth-pack.interface';


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
  passwordTooShort = false;
  authPacks: Array<AuthPack> = [];
  selectedPack: AuthPack | undefined;

  constructor(
    public _authService: AuthService, 
    private _appService: AppService,
    private _snackbarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this._authService.getAuthPacks().subscribe(resp => {
      console.log(resp);
      this.authPacks = resp;
    });
    this.userForm = {
      name: '',
      lastName: '',
      emailAddress: '',
      password: '',
    }
    this.repeatPassword = null;
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
          this._appService.createAppRouting('/');
        }
      },
      error: () => { this.userForm.emailAddress = ''; }
    });
  }

  isSignUpDisabled() {
    if (
      !this.userForm.emailAddress 
      || !this.userForm.password 
      || this.userForm.password !== this.repeatPassword
      || !this.userForm.emailAddress.includes('@')
      || this.passwordTooShort
      || !this.userForm.name
      || !this.userForm.lastName
    ) {
      return true;
    }
    return false;
  }

  onPackSelection(packId: string) {
    this.selectedPack = this.authPacks.find(pack => pack.id === packId);
  }
}
