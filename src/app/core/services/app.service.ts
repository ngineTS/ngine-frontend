import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { Route, Router, Routes } from "@angular/router";
import { NavigationService } from "./navigation.service";
import { AuthGuard } from "../auth/guards/auth-guard.service";

@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor(
    private _router: Router,
    private _navigationService: NavigationService,
  ) {}

  /**
   * Create route for each navigation and return final array of routes.
   * Each route can redirect either to a routing module or to ComponentsContainer component.
   * 
   * @param navigations The array of navigations used to create routes.
   * @returns The routes set up.
   */
  createRoutes(navigations: Navigation[]): Routes {
    const routes: Routes = [];
    if (navigations && navigations.length > 0) {
      for (const navigation of navigations) {
        const redirectButtonChildren = this.retrieveRedirectButtonChildren(navigation);
        /* case 1: one of the children at least is a redirect-button --> create routing module */
        if (redirectButtonChildren && redirectButtonChildren.length > 0) {
          routes.push(
            this.createRoutingModule(
              redirectButtonChildren,
              navigation
            )
          );
        }
        /* case 2: no redirect-button in children or no children at all --> load components container */
        else {
          routes.push({
            path: navigation.name,
            data: { navigation: navigation },
            loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
          });
        }
      }
    }

    return routes;
  }

  /**
   * Create App Routing:
   * - load global navigation and create main routing module
   * - add Unhautorised and Not found route
   * - redirect to route name passed if one else initiate initial navigation
   * 
   * @param redirectRouteName The name of the route to redirect after app routing creation.
   */
  createAppRouting(redirectRouteName?: string): void {
    this._navigationService.getNestedNavigations().subscribe({
      next: result => {
        localStorage.setItem('access_token', result.access_token);
        console.log(result.navigation);
        let route = this.createRoutingModule(
          this.retrieveRedirectButtonChildren(result.navigation) ?? [],
          result.navigation
        );

        const unauthorisedRoute: Route = {
          path: 'unauthorised',
          loadComponent: () => import('../auth/components/unauthorised/unauthorised.component').then(m => m.UnauthorisedComponent)
        }

        const notFoundRoute: Route = {
          path: '**',
          redirectTo: ''
        }
        
        this._router.resetConfig([route, unauthorisedRoute, notFoundRoute]);
        
        if (redirectRouteName) {
          this._router.navigateByUrl(redirectRouteName);
        }
        else {
          this._router.initialNavigation();
        }
      }
    });
  }

  /**
   * Create routing module and return his main route.
   * 
   * @param redirectButtonNavigations - The array of redirect-button navigations used as children routes of the routing module.
   * @param navigation - The navigation associated to the routing module.
   * @returns The main route of routing module.
   */
  createRoutingModule(
    redirectButtonNavigations: Array<Navigation>,
    navigation: Navigation
  ): Route {
    /* create children routes */
    const childrenRoutes = this.createRoutes(redirectButtonNavigations);

    /* create main route */
    let route: Route  = {
      path: navigation.name === 'global' ? '' : navigation.name,
      canActivate: [AuthGuard],
      data: { navigation: navigation },
      children: childrenRoutes
    }

    /* if navigation has a nav bar */
    if (navigation.menu) {
      /* add redirect route at the beginning of children routes */
      childrenRoutes.unshift({
        path: '',
        redirectTo: navigation.children?.[0]?.name ?? '',
        pathMatch: 'full'
      });
      /* lazy load header bar component on main route */
      route.loadComponent = () => import('../components/header-bar/header-bar.component').then(m => m.HeaderBarComponent);
    }
    /* if navigation has no nav bar */
    else {
      /* lazy load page components container at the beginning of children routes */
      childrenRoutes.unshift({
        path: '',
        loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
      });
    }

    return route;
  }

  /**
   * Recursively retrieve redirect button children inside menu button.
   * This method is used to create the navigation routes because only redirect-button can be routes.
   * 
   * @param navigation The navigation where we want to filter the children on redirect-button type only.
   * @param redirectButtonsArray The current array of redirect button children.
   * @returns The array of redirect button children.
   */
  retrieveRedirectButtonChildren(
    navigation: Navigation,
    redirectButtonsArray: Array<Navigation> = []
  ): Array<Navigation> {
    if (navigation.children) {
      redirectButtonsArray.push(
        ...navigation.children.filter(child => child.navigationType.name === 'redirect-button')
      );
      for (const child of navigation.children) {
        if (child.navigationType.name === 'menu-button') {
          redirectButtonsArray.push(...this.retrieveRedirectButtonChildren(child));
        }
      }
    }

    return redirectButtonsArray;
  }

}