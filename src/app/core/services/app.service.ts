import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { Route, Router, Routes } from "@angular/router";
import { NavigationService } from "./navigation.service";
import { ComponentsContainerService } from "./components-container.service";

@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor(
    private _router: Router,
    private _navigationService: NavigationService,
    private _componentsContainerService: ComponentsContainerService
  ) { }

  /**
   * Create route for each navigation and return final array of routes.
   * 
   * @description
   * Each route can redirect either to a routing module or to ComponentsContainer component.
   * If the navigation has at least one redirect-button in chidlren then create routing module,
   * else load ComponentsContainer component.
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
        this._componentsContainerService.userGlobalNavigationPermission = result.navigation.permissionName;
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
   * If the navigation has a menu then the main route will load the corresponding
   * header bar component (vertical or horizontal) and children routes will be loaded inside it.
   * 
   * If the navigation has no menu then the main route will load directly the ComponentsContainer component.
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
      data: { navigation: navigation },
      children: childrenRoutes
    }

    /* if navigation has a nav bar */
    if (navigation.menu) {
      childrenRoutes.unshift({
        path: '',
        redirectTo: this.getRedirectToPathName(navigation, redirectButtonNavigations) ?? '',
        pathMatch: 'full'
      });

      if (navigation.menu.isVertical) {
        route.loadComponent = () => import('../components/vertical-header-bar/vertical-header-bar.component').then(m => m.VerticalHeaderBarComponent);
      }
      else {
        route.loadComponent = () => import('../components/header-bar/header-bar.component').then(m => m.HeaderBarComponent);
      }
    }
    /* if navigation has no nav bar */
    else {
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
   * @param navigation The navigation which we want to filter the children on redirect-button type only.
   * @param redirectButtonsArray The current array of redirect button children.
   * @returns The array of redirect button children.
   */
  retrieveRedirectButtonChildren(
    navigation: Navigation,
    redirectButtonsNavigations: Array<Navigation> = []
  ): Array<Navigation> {
    if (navigation.children) {
      redirectButtonsNavigations.push(
        ...navigation.children.filter(child => child.navigationType.name === 'redirect-button')
      );
      for (const child of navigation.children) {
        if (child.navigationType.name === 'menu-button') {
          redirectButtonsNavigations.push(...this.retrieveRedirectButtonChildren(child));
        }
      }
    }

    return redirectButtonsNavigations;
  }

  
  /**
   * Get redirectTo path name by excluding redirectButtons 
   *
   * @description
   * 1. Exclude routes which don't have navigation as parent (menu buttons items).
   * 2. Sort the rest by order if vertical bar, otherwise sort by xPos.
   * 3. Return redirectButton name.
   * @param navigation The navigation associated to routing module.
   * @param redirectButtonNavigations The redirect buttons navigations corresponding to routing module routes.
   * @returns The redirectTo path name.
   */
  getRedirectToPathName(
    navigation: Navigation,
    redirectButtonNavigations: Array<Navigation>
  ) {
    const redirectButtonNavigationsWithoutOnesInsideMenu = redirectButtonNavigations
      .filter(obj => obj.parentId === navigation.id);
    
    if (navigation.menu.isVertical) {
      redirectButtonNavigationsWithoutOnesInsideMenu
        .sort((a, b) => a.order - b.order)
    }
    else {
      redirectButtonNavigationsWithoutOnesInsideMenu
        .sort((a, b) => a.containerLayout.xPos! - b.containerLayout.xPos!);
    }

    return redirectButtonNavigationsWithoutOnesInsideMenu[0].name;
  }

}