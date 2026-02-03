import { Component } from '@angular/core';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { MatButton } from '@angular/material/button';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';
import { AuthService } from '../../auth/services/auth.service';
import { SnackBarService } from '../../services/snackbar.service';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

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
    private _matDialogRef: MatDialogRef<SignContainerComponent>
  ) { super(); }

  isSignUpTab: boolean = false;
  userEmail: string | null = null;

  ngOnInit() {
    this.userEmail = this._authService.getCurrentUser()?.['userEmail'];
  }

  goToSignIn(){
    this.isSignUpTab = false;
  }

  goToSignUp(){
    this.isSignUpTab = true;
  }

  async onLogOutClick() {
    localStorage.removeItem('access_token');
    const guestSignInResponse: any = await firstValueFrom(this._authService.guestSignIn());
    localStorage.setItem('access_token', guestSignInResponse['access_token']);
    this._appService.createAppRouting(this._router.url);
    this._snackbarService.showSuccessSnackBar('Logout successfuly.');
    this._matDialogRef.close();
  }
}
