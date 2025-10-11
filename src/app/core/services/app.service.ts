import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { Route, Router, Routes } from "@angular/router";
import { NavigationService } from "./navigation.service";
import { forkJoin } from "rxjs";
import { HeaderBarService } from "./header-bar.service";
import { HeaderBar } from "../models/header-bar.interface";


@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor(private _router: Router,
              private _navigationService: NavigationService,
              private _headerBarService: HeaderBarService) {}

  /**
   * Recursively create routes for given navigations and their children.
   * @param navigations The array of navigations.
   * @returns The routes with path, component and data setup.
   */
  generateNestedRoutes(navigations: Navigation[], isHeaderVisibleDuringNavigation: boolean) {
    const routes: Routes = [];
    if (navigations && navigations.length > 0) {
      for (const navigation of navigations) {
          //Case 1: children are headers (this is assuming children[0] sisters are only of type 'header')
          if (navigation.children 
            && navigation.children.length > 0
            &&navigation.children[0].navigationType.name === 'header'
          ) {
            routes.push(
              this.createHeaderRoute(navigation.children, navigation.headerBar, navigation.name)
            );
          }
          //Case 2: children are components (this is assuming children[0] sisters are not of type 'header')
          else {
            routes.push({
              path: navigation.name,
              data: { 
                navigations: navigation.children ?? [],
                parentId: navigation.id,
              },
              loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
            });
          }
      }
      if (isHeaderVisibleDuringNavigation) {
        routes.unshift({
          path: '',
          redirectTo: navigations[0].name,
          pathMatch: 'full'
        });
      }
      else {
        routes.unshift({
          path: '',
          data: { isCardContainer: true },
          loadComponent: () => import('../components/header/header.component').then(m => m.HeaderComponent),
        });
      }  
    }
    return routes;
  }

  /**
   * Create App Routing.
   * 
   * If no navigation are found (i.e first time on the app)
   * then load component container
   * else generate routing.
   * @param redirectRouteName 
   */
  createRouting(redirectRouteName?: string): void {
    //reset height before it is calculated again
    this._headerBarService.totalHeaderHeight = 0;
    const $navigations = this._navigationService.getNestedNavigations();
    const $headerBar = this._headerBarService.getMainHeaderBar();
    
    forkJoin([$navigations, $headerBar]).subscribe({
      next: ([navigations, headerBar]) => {
        let routes: Routes;
        if (navigations && navigations.length > 0) {
          routes = [this.createHeaderRoute(navigations, headerBar)];
        }
        else {
          routes = [{
            path: '',
            data: { 
              navigations: [],
              parentId: null,
            },
            loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
          }]
        }
        this._router.resetConfig(routes);
        this._router.navigateByUrl(redirectRouteName ?? '');
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
  }


  /**
   * Create Route for header component.
   * 
   * @param navigations The navigations.
   * @param headerBar The header bar configuration.
   * @param parentName The parent navigation name.
   * @returns An array of routes to display.
   */
  createHeaderRoute(
    children: Array<Navigation>,
    headerBar: HeaderBar,
    parentName: string = ''
  ): Route {
    let route: Route;
    //Case menu bar --> HeaderComponent as parent component
    if (headerBar.isVisibleDuringNavigation) {
      route = { 
        path: parentName, 
        data: {
          headerBarConfig: headerBar,
          navigations: children,
          parentId: headerBar.navigationId 
        },
        loadComponent: () => import('../components/header/header.component').then(m => m.HeaderComponent),
        loadChildren: () => this.generateNestedRoutes(children, true),
      };
    }
    //Case card container --> HeaderComponent as sister component
    else {
      route = { 
        path: parentName, 
        data: {
          headerBarConfig: headerBar,
          navigations: children,
          parentId: headerBar.navigationId 
        },
        loadChildren: () => this.generateNestedRoutes(children, false),
      };
    }
    return route;
  }
}