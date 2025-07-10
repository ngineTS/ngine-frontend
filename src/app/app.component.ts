import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Routes, Router } from '@angular/router';
import { environment } from "../environments/environment";
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

  /**
   * Recursively create routes for given navigations and their children
   * @param navigations The array of navigations
   * @returns routes with path, component and data assigned 
   */
  generateNestedRoutes(navigations: Navigation[]) {
    const routes: Routes = [];
    let i = 0;
    if (navigations && navigations.length > 0) {
      for (const navigation of navigations) {
        if (navigation.children && navigation.children.length > 0) {
          if (navigation.children[0].navigationType.name === 'header') {
            routes.push({
              path: navigation.name,
              data: { children: navigation.children },
              loadComponent: () => import('./core/components/navigation/navigation.component').then(m => m.NavigationComponent),
              loadChildren: () => this.generateNestedRoutes(navigation.children!),
            });
          }
          else {
            routes.push({
              path: navigation.name,
              data: { content: navigation.children[1].testText },
              loadComponent: () => import('./core/components/test-text-component/test-text-component.component').then(m => m.TestTextComponentComponent),
            });
          }
        }
        else{
          routes.push({
            path: navigation.name,
            data: { 
              content: {
                id: 'a',
                name: `${navigation.name}`,
                message: 'This is  a cool message!',
                navigationId: 'string' 
              }
            },
            loadComponent: () => import('./core/components/test-text-component/test-text-component.component').then(m => m.TestTextComponentComponent),
          })
        }
        /*if (navigation.navigationType.name === 'text') {
          routes.push({
            path: navigation.name,
            data: { content: navigation.testText },
            loadComponent: () => import('./core/components/test-text-component/test-text-component.component').then(m => m.TestTextComponentComponent),
          });
        }*/
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
