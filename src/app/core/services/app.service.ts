import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { Route, Router, Routes } from "@angular/router";
import { NavigationService } from "./navigation.service";
import { forkJoin } from "rxjs";
import { HeaderBarService } from "./header-bar.service";
import { HeaderBar } from "../models/header-bar.interface";
import { AuthGuard } from "../auth/guards/auth-guard.service";

@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor(private _router: Router,
              private _navigationService: NavigationService,
              private _headerBarService: HeaderBarService) {}


  /**
   * Create route for each navigation passed and return array of routes.
   * Each route can redirect either to a routing module or to ComponentsContainer component.
   * 
   * Once all routes have been created, add route with path "" at the start of the array with this config:
   * - If navigations are part of a header bar module then then redirect to first navigation.
   * - If navigations are part of a cards container module then redirect to cards container component.
   * 
   * @param navigations The array of navigations passed to create either header route or component container.
   * @param isHeaderVisibleDuringNavigation if module is a header bar and not a cards container.
   * @returns The routes set up.
   */
  createRoutes(
    navigations: Navigation[], 
    isHeaderVisibleDuringNavigation: boolean, 
    totHeaderHeight: number
  ): Routes {
    const routes: Routes = [];
    if (navigations && navigations.length > 0) {
      for (const navigation of navigations) {
        //Case 1: Children of navigation are headers (this is assuming children[0] sisters are only of type 'header')
        //--> Create header route
        if (navigation.children 
          && navigation.children.length > 0
          && navigation.children[0].navigationType.name === 'header'
        ) {
          //if menu not visible (i.e cards) then don't add his height to total height.
          const headerHeight = navigation.headerBar.isVisibleDuringNavigation ? navigation.headerBar.height : 0;
          routes.push(
            this.createRoutingModule(navigation.children, navigation.headerBar, headerHeight + totHeaderHeight, navigation.name)
          );
        }
        //Case 2: No children or children are components (this is assuming children[0] sisters are not of type 'header')
        //--> Create Component container
        else {
          routes.push({
            path: navigation.name,
            data: { 
              totHeaderHeight: totHeaderHeight,
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
          data: { 
            isCardContainer: true,
            totHeaderHeight: totHeaderHeight,
          },
          loadComponent: () => import('../components/header-bar/header-bar.component').then(m => m.HeaderBarComponent),
        });
      }  
    }
    return routes;
  }


  /**
   * Create App Routing.
   * 
   * If no navigations are found (i.e nothing has been created yet) then load component container else generate routing.
   * 
   * Add extra components on main route children (ex: UnhautorisedComponent).
   * @param redirectRouteName 
   */
  createAppRouting(redirectRouteName?: string): void {
    const $navigations = this._navigationService.getNestedNavigations();
    const $headerBar = this._headerBarService.getMainHeaderBar();
    
    forkJoin([$navigations, $headerBar]).subscribe({
      next: ([navigations, headerBar]) => {
        let route: Route;
        if (navigations && navigations.length > 0) {
          route = this.createRoutingModule(navigations, headerBar, headerBar.height);
        }
        else {
          route = {
            path: '',
            canActivate: [AuthGuard],
            data: { 
              navigations: [],
              parentId: null,
            },
            loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
          }
        }
        const unauthorisedRoute = {
          path: 'unauthorised',
          loadComponent: () => import('../auth/components/unauthorised/unauthorised.component').then(m => m.UnauthorisedComponent)
        }
        this._router.resetConfig([route, unauthorisedRoute]);
        this._router.navigateByUrl(redirectRouteName ?? '');
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
  }


  /**
   * Create routing module and return his main route. 
   * 
   * If routing settings specifies header bar then:
   * - Lazy load header bar component on main route.
   * - Lazy load sister navigation routes as children.
   * 
   * If routing settings specifies cards container then:
   * - Lazy load nothing on main route.
   * - Lazy load sister navigation routes as children.
   * 
   * @param navigations The array of sisters navigations.
   * @param headerBar The routing module settings.
   * @param parentName The parent name of sister navigations.
   * @param totHeaderHeight The total header bar height (in px) accumulated from the chain.
   * @returns The main route of routing module.
   */
  createRoutingModule(
    navigations: Array<Navigation>,
    headerBar: HeaderBar,
    totHeaderHeight: number,
    parentName: string = ''
  ): Route {
    let route: Route;
    if (headerBar.isVisibleDuringNavigation) {
      route = { 
        path: parentName,
        canActivate: [AuthGuard],
        data: {
          headerBarConfig: headerBar,
          navigations: navigations,
          parentId: headerBar.navigationId 
        },
        loadComponent: () => import('../components/header-bar/header-bar.component').then(m => m.HeaderBarComponent),
        loadChildren: () => this.createRoutes(navigations, true, totHeaderHeight),
      };
    }
    else {
      route = { 
        path: parentName, 
        data: {
          headerBarConfig: headerBar,
          navigations: navigations,
          parentId: headerBar.navigationId 
        },
        loadChildren: () => this.createRoutes(navigations, false, totHeaderHeight),
      };
    }
    return route;
  }
}