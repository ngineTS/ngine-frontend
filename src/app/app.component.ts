import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './core/services/app.service';
import { jwtDecode } from "jwt-decode";
import { AuthService } from './core/auth/services/auth.service';
import { UserEventService } from './core/services/user-event.service';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private _appService: AppService,
              private _router: Router,
              private _authService: AuthService,
              private _userEventService: UserEventService,
              private _location: Location
             ) { }

  title = 'my-app-frontend';
  refreshInterval = 60; //seconds

  /**
   * Lifecycle hook called after component has been initialized.
   * Create app routing and run refreshToken and trackUserEvent job.
   * 
   * @description
   * If url includes 'password-recovery' load initial routing,
   * else load dynamic routing grom nested navigations.
   */
  ngOnInit() {
    const path = this._location.path();
    setTimeout(async () => {
      if (!path.includes('password-recovery')) {
        if (!this._authService.isTokenValid()) {
          const guestSignInResponse: any = await firstValueFrom(this._authService.guestSignIn());
          localStorage.setItem('access_token', guestSignInResponse['access_token']);
        }
        this.runRefreshTokenJob();
        this._appService.createAppRouting();
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
    setInterval(() => {
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

        if (jwtExpirationTime > currentTime && jwtExpirationTime - currentTime < this.refreshInterval) {
          this._authService.refreshToken().subscribe({
            next: (resp: any) => localStorage.setItem('access_token', resp['access_token']),
            error: () => this._router.navigateByUrl('/unauthorised')
          }); 
        }
      }
      else {
        this._router.navigateByUrl('/unauthorised');
        
      }
    }, this.refreshInterval * 990);
  }


}
