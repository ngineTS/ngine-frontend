import { Component } from '@angular/core';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MatButton } from '@angular/material/button';
import { NavigationBaseComponent } from '../../core/components/navigation-base/navigation-base.component';
import { AuthService } from '../../core/auth/services/auth.service';
import { SnackBarService } from '../../core/services/snackbar.service';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../../core/services/app.service';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.interface';

@Component({
  selector: 'app-sign-container',
  imports: [SignInComponent, SignUpComponent, MatButton],
  templateUrl: './sign-container.component.html',
  styleUrl: './sign-container.component.scss'
})
export class SignContainerComponent extends NavigationBaseComponent {

  constructor(
    private _authService: AuthService,
    private _snackbarService: SnackBarService,
    private _appService: AppService,
    private _router: Router,
    private _userService: UserService
  ) { super(); }

  isSignUpTab: boolean = false;
  user: Omit<User, 'password'> | null = null;

  ngOnInit() {
    this._userService.getCurrentUserInformation()
      .subscribe(userInfo => this.user = userInfo);
  }

  async onLogOutClick() {
    localStorage.removeItem('access_token');
    const guestSignInResponse: any = await firstValueFrom(this._authService.guestSignIn());
    localStorage.setItem('access_token', guestSignInResponse['access_token']);
    this._appService.createAppRouting(this._router.url);
    this._snackbarService.showSuccessSnackBar('Logout successfuly.');
  }
}
