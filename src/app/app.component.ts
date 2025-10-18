import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './core/services/app.service';
import { jwtDecode } from "jwt-decode";
import { AuthService } from './core/auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private _appService: AppService,
              private _router: Router,
              private _authService: AuthService
             ) { }

  title = 'my-app-frontend';
  refreshInterval = 60; //seconds

  ngOnInit() {
    /* Wait for initial routing to be loaded before checking url. */
    setTimeout(() => {
      if (!this._router.url.includes('password-recovery')) {
        this.runRefreshTokenJob();
        this._appService.createAppRouting();
      }
    }, 125);
  }

  /**
   * Setup interval to refresh auth token.
   */
  runRefreshTokenJob() {
    setInterval(() => {
      let token: string | null = null; 
      if (typeof localStorage !== 'undefined') {
        token = localStorage.getItem('access_token');
      }

      if (token) {
        let jwtDecoded: any;
        jwtDecoded = jwtDecode(token);
        const jwtExpirationTime: number = jwtDecoded?.exp;
        const currentTime: number = new Date().getTime() / 1000;

        if(jwtExpirationTime > currentTime && jwtExpirationTime - currentTime < this.refreshInterval) {
          this._authService.refreshToken().subscribe({
            next: (resp: any) => {
              localStorage.setItem('access_token', resp['access_token']);
            },
            error: (err: any) => {
              console.log('interval - err', err);
            }
        }); 
        }
      }
      else {
        this._router.navigateByUrl('/unauthorised');
      }

    }, this.refreshInterval * 999);
  }


}
