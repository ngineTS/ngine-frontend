import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './core/services/app.service';
import { jwtDecode } from "jwt-decode";
import { AuthService } from './core/auth/services/auth.service';
import { UserEventService } from './core/services/user-event.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { AsyncPipe, Location } from '@angular/common';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { SideNavService } from './core/services/side-nav.service';
import { FormValueEvent, GenericFormDialogData } from './core/models/form-input.interface';
import { GenericFormComponent } from './core/components/generic-form/generic-form.component';
import { AppSettingsService } from './core/services/app-settings.service';
import { MatDialog } from '@angular/material/dialog';
import { DefaultStyleFormComponent } from './core/components/default-style-form/default-style-form.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    GenericFormComponent,
    AsyncPipe
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private _appService: AppService,
    private _appSettingsService: AppSettingsService,
    private _router: Router,
    private _authService: AuthService,
    private _userEventService: UserEventService,
    private _location: Location,
    public _sideNavService: SideNavService,
    private _matDialog: MatDialog
    ) { }

  title = 'my-app-frontend';
  refreshTokenIntervalOffset = 60; //seconds
  refreshTokenIntervalId: NodeJS.Timeout | undefined;
  showFiller = false;
  @ViewChild('drawer') drawer!: MatDrawer
  sideNavFormConfiguration: GenericFormDialogData<Record<string, any>> | null = null;
  appBackgroundColor$: Observable<string> | undefined;


  /**
   * Lifecycle hook called after component has been initialized.
   * 
   * Process:
   * - Set app background color.
   * - Verify auth token validity.
   * - Run auth token refresh job.
   * - Create app routing.
   * - Set sidenav listener.
   * - Run user event tracking job.
   */
  ngOnInit() {
    this.setAppBackgroundColor();
    setTimeout(() => this._matDialog.open(DefaultStyleFormComponent, {
      width: '60%',
      height: '500px',
      hasBackdrop: false,
      disableClose: true
    }), 500);
    const path = this._location.path();
    setTimeout(async () => {
      if (!path.includes('password-recovery')) {
        if (!this._authService.isTokenValid()) {
          const guestSignInResponse: any = await firstValueFrom(this._authService.guestSignIn());
          localStorage.setItem('access_token', guestSignInResponse['access_token']);
        }
        this.runRefreshTokenJob();
        this._appService.createAppRouting();
        this.setSideNavListener();
        this._userEventService.traceUserUrlChanges();
      }
      else {
        this._router.initialNavigation();
      }
    }, 125);
  }

  /**
   * Setup interval to refresh auth token.
   */
  runRefreshTokenJob() {
    this.refreshTokenIntervalId = setInterval(() => {
      console.log('INTERVAL');
      let token: string | null = null; 
      if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('access_token');
      }

      if (token) {
        let jwtDecoded: any;
        jwtDecoded = jwtDecode(token);
        const jwtExpirationTime: number = jwtDecoded?.exp;
        const currentTime: number = new Date().getTime() / 1000;

        if (jwtExpirationTime > currentTime && jwtExpirationTime - currentTime < this.refreshTokenIntervalOffset) {
          this._authService.refreshToken().subscribe({
            next: (resp: any) => localStorage.setItem('access_token', resp['access_token']),
            error: () => this._router.navigateByUrl('/unauthorised')
          }); 
        }
      }
      else {
        this._router.navigateByUrl('/unauthorised');
        
      }
    }, this.refreshTokenIntervalOffset * 990);
  }

  /**
   * Setup listener to open sidenav when user edit a navigations style.
   */
  setSideNavListener() {
    this._sideNavService.formConfiguration.subscribe(resp => {
      if (resp) {
        this.sideNavFormConfiguration = resp;
        this.drawer.open();
      }
    });
  }

  /**
   * Generic form event triggered when one of the form control values has changed.
   * 
   * @param event The event.
   */
  onSideNavFormValueChange(event: FormValueEvent) {
    this._sideNavService.formValueEvent.next(event);
  }

  /**
   * Method called on generic form submit button click.
   * Stop listeners.
   * 
   * @param event The submit action.
   */
  onSideNavAction(event: 'added' | 'edited' | 'deleted') {
    this._sideNavService.initalFormContent = null;
    this._sideNavService.formConfiguration.next(null);
    this._sideNavService.stopSubscriptions.next();
    this.sideNavFormConfiguration = null;
    this.drawer.close();
  }

  /**
   * Method called on chevron icon click.
   * Reset navigation style and stop listeners.
   */
  onCloseSideNav() {
    this._sideNavService.resetSideNavContent();
    this.sideNavFormConfiguration = null;
    this.drawer.close();
  }

  /**
   * Set app background color.
   */
  setAppBackgroundColor() {
    this.appBackgroundColor$ = this._appSettingsService.backgroundColor$;
    
    this._appSettingsService.getAppSettings()
      .pipe(map(appSettings => 
        appSettings.find(setting => setting.settingName === 'backgroundColor')?.settingValue
      ))
      .subscribe(backgroundColor => {
        if (backgroundColor) {
          this._appSettingsService.setAppBackgroundColor(backgroundColor);
        }
        else {
          this._appSettingsService.setAppBackgroundColor('#FFFFFF');
        }
      });
  }

}
