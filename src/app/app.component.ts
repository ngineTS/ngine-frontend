import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './core/services/app.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private _appService: AppService,
              private _router: Router,
             ) { }

  title = 'my-app-frontend';

  ngOnInit() {
    setTimeout(() => {
      if (!this._router.url.includes('password-recovery')) {
        this._appService.createAppRouting();
      }
    }, 50);
  }


}
