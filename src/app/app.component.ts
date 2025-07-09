import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Routes, Router } from '@angular/router';
import { environment } from "../environments/environment";
import { NavigationComponent } from './core/components/navigation/navigation.component';
import { Navigation } from './core/components/navigation/models/navigation.interface';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(private _http: HttpClient,
              private _router: Router) {}

  title = 'my-app-frontend';
  routes!: Routes;

  ngOnInit() {
    this._http.get<Navigation[]>(`${environment.APIURL}navigation`).subscribe(navigations => {
      this.routes = [{ 
        path: '', 
        data: { children: navigations },
        loadComponent: () => import('./core/components/navigation/navigation.component').then(m => m.NavigationComponent),
        loadChildren: () => this.generateNestedRoutes(navigations),
      }];
      this._router.resetConfig([...this._router.config, ...this.routes]);
      console.log(navigations);
    });
  }

  generateNestedRoutes(navigations: Navigation[]): Routes {
    const routes: Routes = [];
    let i = 0;
    if (navigations && navigations.length > 0) {
      for (const navigation of navigations) {
        if (navigation.navigationType.name === 'header') {
          routes.push({
            path: navigation.name,
            data: { children: navigation.children },
            loadComponent: () => import('./core/components/navigation/navigation.component').then(m => m.NavigationComponent),
            loadChildren: () => this.generateNestedRoutes(navigation.children),
          });
        }
        i = i + 1;
      }
      if (i > 0) {
        routes.unshift({
          path: '',
          redirectTo: navigations[0].name,
          pathMatch: 'full'
        });
      }
    }
    return routes;
  }
}
