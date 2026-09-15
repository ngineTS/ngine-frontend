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
import { StripeService } from '../../../core/services/stripe.service';
import { catchError, of, switchMap } from 'rxjs';


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
    private _snackbarService: SnackBarService,
    private _stripeService: StripeService
  ) { }

  ngOnInit(): void {
    this._authService.getAuthPacks().subscribe(resp => {
      console.log(resp);
      this.authPacks = resp;
    });
    this.userForm = {
      name: '',
      lastName: '',
      roleId: null,
      emailAddress: '',
      password: '',
    }
    this.repeatPassword = null;
  }

  onPasswordChange() {
    this.passwordTooShort = this.userForm.password!.length < 8 ? true : false;
  }

  /**
   * Methods triggered on sign up button click.
   * 
   * Process:
   * 
   * Case 1: authentication doesn't require payment: create user and redurect to home page.
   * 
   * Case 2: authentication requires payment:
   *  - proceed to normal sign up to create user and get correct userId in the request
   *  - open stripe payment page to let user proceed with payment
   *  - after success payment: redirect to success page
   */
  onSignUpClick() {
    this._authService
      .userSignUp(this.userForm)
      .pipe(
        catchError(() => {
          this.userForm.emailAddress = '';
          return of(null);
        }),
        switchMap((result: any) => {
          if (result) {
            localStorage.setItem('access_token', result['access_token']);

            /* Case 1  */
            if (!this.selectedPack || this.selectedPack.isFree || this.selectedPack.price === 0) {
              this._snackbarService.showSuccessSnackBar("Welcome!");
              this._appService.createAppRouting('/');
              return of(null);
            } 
            /* Case 2  */
            else {
              return this._stripeService.redirectToCheckout(this.selectedPack.stripePriceId);
            }
          } else {
            return of(null);
          }
        })
      )
      .subscribe((resp: { url: string } | null) => {
        if (resp?.url) {
          window.location.href = resp.url;
        }
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
      || (this.authPacks.length > 0 && !this.selectedPack)
    ) {
      return true;
    }
    return false;
  }

  onPackSelection(packId: string) {
    this.selectedPack = this.authPacks.find(pack => pack.id === packId);
    this.userForm.roleId = this.selectedPack!.roleId;
    this._stripeService.redirectToCheckout('price_1UFbETDIdQiJDqfHnr4yOs5x');
  }
}
