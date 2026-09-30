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
import { AuthPack } from '../authentication-management/auth-pack.interface';

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
  authPacks: AuthPack[] = [];
  userPacks: { roleId: string, packId: string; packName: string; isCancelled: boolean }[] = [];
  availableAuthPacks: AuthPack[] = [];
  isManagingSubscription = false;

  /**
   * Get list of packs user has and has not subscribed to.
   * 
   * userPack is used to display packs in 
   * availableAuthPacks is used to display packs in the "change subscription" list.
   * 
   */
  getUserAndAvailableAuthPacks() {
    this.authPacks.forEach(pack => {
      const associatedUserRole = this.user?.userRoles?.find(userRole => userRole.roleId === pack.roleId);
      if (associatedUserRole) {
        this.userPacks.push({
          roleId: pack.roleId,
          packId: pack.id,
          packName: pack.name,
          isCancelled: associatedUserRole.isCancelled
        })
      }
      else {
        this.availableAuthPacks.push(pack);
      }
    });
  }

  /**
   * Method called after component has initialized.
   * 
   * Retrieve user information and authentication packs.
   */
  ngOnInit() {
    this._userService.getCurrentUserInformation()
      .subscribe(userInfo => this.user = userInfo);

    this._authService.getAuthPacks()
      .subscribe({
        next: authPacks => {
          this.authPacks = authPacks;
          this.getUserAndAvailableAuthPacks();
        }
      });
  }

  isRecurringRole(roleId: string): boolean {
    return this.authPacks.some(pack => pack.roleId === roleId && pack.isRecurringPayment);
  }

  onCancelSubscription(userPack: typeof this.userPacks[0]) {
    if (!confirm(`Are you sure you want to cancel the ${userPack.packName ?? 'current'} subscription?`)) {
      return;
    }

    this._authService.cancelSubscription(userPack.roleId).subscribe({
      next: () => {
        userPack.isCancelled = true;
        this.user!.userRoles = this.user?.userRoles?.filter(userRole => userRole.roleId !== userPack.roleId);
        this._snackbarService.showSuccessSnackBar('Subscription cancelled successfully.');
      },
    });
  }

  onSubscriptionSelection(pack: AuthPack) {
    this._authService.changeSubscription(pack.id).subscribe({
      next: response => {
        if (response.url) {
          window.location.href = response.url;
        } else {
          this._snackbarService.showErrorSnackBar('Unable to start the subscription checkout.');
        }
      },
    });
  }

  async onLogOutClick() {
    localStorage.removeItem('access_token');
    const guestSignInResponse: any = await firstValueFrom(this._authService.guestSignIn());
    localStorage.setItem('access_token', guestSignInResponse['access_token']);
    this._appService.createAppRouting(this._router.url);
    this._snackbarService.showSuccessSnackBar('Logout successfuly.');
  }
}
