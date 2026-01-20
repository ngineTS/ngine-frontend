import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { Route, Router, Routes } from "@angular/router";
import { NavigationService } from "./navigation.service";
import { AuthGuard } from "../auth/guards/auth-guard.service";
import { Menu } from "../models/menu.interface";

@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor(
    private _router: Router,
    private _navigationService: NavigationService,
  ) {}

  /**
   * Create route for each navigation passed and return array of routes.
   * Each route can redirect either to a routing module or to ComponentsContainer component.
   * 
   * @param navigations The array of navigations passed to create either redirect-button route or component container.
   * @returns The routes set up.
   */
  createRoutes(navigations: Navigation[]): Routes {
    const routes: Routes = [];
    if (navigations && navigations.length > 0) {
      for (const navigation of navigations) {
        const redirectButtonChildren = this.retrieveRedirectButtonChildren(navigation);
        /* Case 1: One of the children at least is a redirect-button --> Create routing module */
        if (redirectButtonChildren && redirectButtonChildren.length > 0) {
          if (navigation.menu) {
            navigation.menu.permissionName = navigation.permissionName;
          }
          routes.push(
            this.createRoutingModule(
              redirectButtonChildren,
              navigation.children!,
              navigation.menu,
              navigation.permissionName!,
              navigation.name
            )
          );
        }
        /* Case 2: No redirect-button in children or no children at all --> Load components container. */
        else {
          routes.push({
            path: navigation.name,
            data: {
              navigations: navigation.children ?? [],
              parentId: navigation.id,
              permissionName: navigation.permissionName
            },
            loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
          });
        }
      }
      /* Add '' route to redirect to first navigation */
      routes.unshift({
        path: '',
        redirectTo: navigations[0].name,
        pathMatch: 'full'
      });
    }

    return routes;
  }


  /**
   * Create App Routing:
   * - If no navigations are found (i.e nothing has been created yet) then load component container else generate routing.
   * - If user has maximun permission (i.e: global) then add Admin module.
   * - Add Unhautorised and Not found route.
   * - Redirect to route name passed if one else initiate initial navigation.
   * 
   * @param redirectRouteName 
   */
  createAppRouting(redirectRouteName?: string): void {
    this._navigationService.getNestedNavigations().subscribe({
      next: result => {
        localStorage.setItem('access_token', result.access_token);
        console.log(result.navigation);
        let route = this.createRoutingModule(
          this.retrieveRedirectButtonChildren(result.navigation) ?? [],
          result.navigation.children ?? [],
          result.navigation.menu,
          result.navigation.permissionName!
        );

        const unauthorisedRoute: Route = {
          path: 'unauthorised',
          loadComponent: () => import('../auth/components/unauthorised/unauthorised.component').then(m => m.UnauthorisedComponent)
        }

        const notFoundRoute: Route = {
          path: '**',
          redirectTo: ''
        }

        if (result.navigation.permissionName) {
          route.children?.push(
            this.createAdminRoutingModule(
              result.navigation.permissionName,
              result.navigation.menu
            )
          );
        }
        
        this._router.resetConfig([route, unauthorisedRoute, notFoundRoute]);
        
        if (redirectRouteName) {
          this._router.navigateByUrl(redirectRouteName);
        }
        else {
          this._router.initialNavigation();
        }
      },
      error: (err) => {
        console.error("Error loading data", err);
      }
    });
  }


  /**
   * Create routing module and return his main route.
   * - Lazy load header bar component on main route.
   * - Lazy load sister navigation routes as children.
   *
   * @param redirectButtonNavigations The array of redirect-button navigations used as routes of the routing module.
   * @param navigations The array of navigations used to pass as data of the routing module.
   * @param menu The header bar style configuration.
   * @param permissionName The user permission on module.
   * @param parentName The parent name of sister navigations.
   * @returns The main route of routing module.
   */
  createRoutingModule(
    redirectButtonNavigations: Array<Navigation>,
    navigations: Array<Navigation>,
    menu: Menu,
    permissionName: string,
    parentName: string = ''
  ): Route {
    let route: Route;
    const childrenRoutes = this.createRoutes(redirectButtonNavigations);

    if (menu) {
      /* Add redirect route at the beginning of the array of routes. */
      childrenRoutes.unshift({
        path: '',
        redirectTo: navigations[0]?.name ?? '',
        pathMatch: 'full'
      });
      /* Create routing module main route. */
      route = {
        path: parentName,
        canActivate: [AuthGuard],
        data: {
          headerBarConfig: menu,
          navigations: navigations,
          parentId: menu.navigationId,
          permissionName: permissionName
        },
        loadComponent: () => import('../components/header-bar/header-bar.component').then(m => m.HeaderBarComponent),
        children: childrenRoutes,
      };
    }
    else {
      /* Add landing page route at the beginning of the array of routes. */
      childrenRoutes.unshift({
        path: '',
        loadComponent: () => import('../components/components-container/components-container.component').then(m => m.ComponentsContainer),
      });
      /* Create routing module main route. */
      route = {
        path: parentName,
        canActivate: [AuthGuard],
        data: {
          navigations: navigations,
          parentId: navigations[0].parentId,
          permissionName: permissionName,
        },
        children: childrenRoutes
      };
    }

    return route;
  }

  /**
   * Create admin routing module.
   * @returns The main route of admin module.
   */
  createAdminRoutingModule(permissionName: string, menu: Menu): Route {
    return {
      path: 'admin',
      data: { headerBarConfig: menu },
      children: [
        {
          path: '',
          loadComponent: () => import('../../pages/admin/admin.component').then(m => m.AdminComponent)
        },
        {
          path: 'file-management',
          loadComponent: () => import('../../pages/admin/media-library/media-library.component').then(m => m.MediaLibraryComponent)
        },
        {
          path: 'analytic',
          loadComponent: () => import('../../pages/admin/analytic/analytic.component').then(m => m.AnalyticComponent)
        },
        this.createUserRoleManagementRoutingModule(permissionName),
      ]
    }
  }

  /**
   * Create user role management routing module.
   * @returns The main route of user role module.
   */
  createUserRoleManagementRoutingModule(permissionName: string): Route {
    return {
      path: 'user-role-management',
      loadComponent: () => import('../../pages/admin/user-role-management/user-role-management.component').then(m => m.UserRoleManagementComponent),
      children: [
        {
          path: '',
          redirectTo: 'role-management',
          pathMatch: 'full',
        },
        {
          path: 'role-management',
          data: { permissionName: permissionName },
          loadComponent: () => import('../../pages/admin/user-role-management/role-management/role-management.component').then(m => m.RoleManagementComponent),
        },
        {
          path: 'user-management',
          data: { permissionName: permissionName },
          loadComponent: () => import('../../pages/admin/user-role-management/user-management/user-management.component').then(m => m.UserManagementComponent),
        }
      ]
    }
  }


  /**
   * Recursively retrieve redirect button children inside menu button.
   * 
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