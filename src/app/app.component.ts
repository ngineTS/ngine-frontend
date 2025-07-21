import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Routes, Router } from '@angular/router';
import { environment } from "../environments/environment";
import { Navigation } from './core/models/navigation.interface';

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
        data: { 
          navigations: navigations,
          parentId: null 
        },
        loadComponent: () => import('./core/components/navigation/navigation.component').then(m => m.NavigationComponent),
        loadChildren: () => this.generateNestedRoutes(navigations),
      }];
      this._router.resetConfig([...this._router.config, ...this.routes]);
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
          //Case 1: children are headers (this is assuming children[0] sisters are only of type 'header')
          if (navigation.children[0].navigationType.name === 'header') {
            routes.push({
              path: navigation.name,
              data: { 
                navigations: navigation.children,
                parentId: navigation.id
              },
              loadComponent: () => import('./core/components/navigation/navigation.component').then(m => m.NavigationComponent),
              loadChildren: () => this.generateNestedRoutes(navigation.children!),
            });
          }
          //Case 2: children are components (this is assuming children[0] sisters are not of type 'header')
          else {
            routes.push({
              path: navigation.name,
              data: { 
                navigations: navigation.children,
                parentId: navigation.id,
              },
              loadComponent: () => import('./core/components/generic/generic.component').then(m => m.GenericComponent),
            });
          }
        }
        //Case 3: No children --> blank page with possibility to add header or component
        else {
          routes.push({
            path: navigation.name,
            data: {
              navigations: null,
              parentId: navigation.id
            },
            loadComponent: () => import('./core/components/generic/generic.component').then(m => m.GenericComponent),
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
