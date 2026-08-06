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
import { MatMenuModule } from '@angular/material/menu';
import { ComponentsContainerService } from './core/services/components-container.service';
import { NavigationService } from './core/services/navigation.service';
import { MenuService } from './core/services/menu.service';
import { SnackBarService } from './core/services/snackbar.service';
import { NavigationTypeService } from './core/services/navigation-type.service';
import { MatDialog } from '@angular/material/dialog';
import { FormContainerComponent } from './core/components/form-container/form-container.component';
import { DefaultStyleFormComponent } from './core/components/default-style-form/default-style-form.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { NavigationPublishDialogComponent } from './core/components/navigation-publish-dialog/navigation-publish-dialog.component';



@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatMenuModule,
    GenericFormComponent,
    AsyncPipe,
    CdkDrag
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
    private _navigationService: NavigationService,
    private _menuService: MenuService,
    private _snackbarService: SnackBarService,
    private _navigationTypeService: NavigationTypeService,
    private _matDialog: MatDialog,
    public _sideNavService: SideNavService,
    public _componentsContainerService: ComponentsContainerService,
  ) { }

  title = 'my-app-frontend';
  refreshTokenIntervalOffset = 60; //seconds
  refreshTokenIntervalId: NodeJS.Timeout | undefined;
  showFiller = false;
  @ViewChild('drawer') drawer!: MatDrawer
  sideNavFormConfiguration: GenericFormDialogData<Record<string, any>> | null = null;
  appBackgroundColor$: Observable<string> | undefined;

  get navigationChangesCount(): number {
    return this._navigationService.navigationsWithChangesList.size;
  }

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
    const path = this._location.path();
    setTimeout(async () => {
      if (!path.includes('password-recovery')) {
        if (!this._authService.isTokenValid()) {
          const guestSignInResponse: any = await firstValueFrom(this._authService.guestSignIn());
          localStorage.setItem('access_token', guestSignInResponse['access_token']);
        }
        this.setAppBackgroundColor();
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
    if (this._sideNavService.navigationRef) {
      this._sideNavService.navigationRef.unpublishedChanges.push(
        ...['containerLayout', 'containerStyle', 'typographyStyle']
      );
      this._navigationService.navigationsWithChangesList.set(
        this._sideNavService.navigationRef.id,
        this._sideNavService.navigationRef
      );
    }
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

  /**
   * Methods called on '+' button click.
   * Open navigation form to create navigation or navigation bar.
   * 
   * @param type The type ('horizontal bar', 'vertical bar' or 'navigation').
   */
  openFormToAddNavigationBarOrNavigation(type: 'horizontal' | 'vertical' | 'navigation'): void {
    if (type === 'navigation') {
      this._navigationService.manageNavigation(this._componentsContainerService.activeNavigation.groupId);
    }
    else {
      this._menuService.createNavigationBar(this._componentsContainerService.activeNavigation.id, type)
        .subscribe(resp => {
          this._snackbarService.showSuccessSnackBar(resp);
          this._appService.createAppRouting(this._router.url);
        });
    }
  }

  /**
   * Methods called on 'New component type' button click.
   * 
   * Open form to add a new navigation type.
   */
  addNavigationType() {
    const formConfiguration = this._navigationTypeService.setupNavigationTypeForm();
    this._matDialog.open(FormContainerComponent, { data: formConfiguration });
  }

    /**
   * Method called on 'Manage application style' button click.
   * 
   * Open form to manage app default style.
   */
  manageAppDefaultStyle() {
    this._matDialog.open(DefaultStyleFormComponent, {
      width: '60%',
      height: '500px',
      disableClose: true,
      backdropClass: 'no-backdrop'
    });
  }

  openPublishDialog(): void {
    const navigations = Array.from(this._navigationService.navigationsWithChangesList.values());

    this._matDialog.open(NavigationPublishDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      autoFocus: false,
      data: { navigations }
    });
  }

}