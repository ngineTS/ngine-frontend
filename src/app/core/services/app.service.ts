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
        /* Case 1: Children of navigation are headers (this is assuming children[0] sisters are only of type 'redirect-button')
           --> Create routing module */
        if (navigation.children
          && navigation.children.length > 0
          && navigation.children[0].navigationType.name === 'redirect-button'
        ) {
          navigation.menu.permissionName = navigation.permissionName;
          routes.push(
            this.createRoutingModule(
              navigation.children,
              navigation.menu,
              navigation.permissionName!,
              navigation.name
            )
          );
        }
        /* Case 2: No children or children are components (this is assuming children[0] sisters are not of type 'redirect-button')
           --> Load components container. */
        else {
          routes.push({
            path: navigation.name,
            data: {
              navigations: navigation.children ?? [],
              parentId: navigation.id,
              containerPermissionName: navigation.permissionName
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
   
   * @param navigations The array of sister navigations.
   * @param menu The header bar style configuration.
   * @param permissionName The user permission on module.
   * @param parentName The parent name of sister navigations.
   * @returns The main route of routing module.
   */
  createRoutingModule(
    navigations: Array<Navigation>,
    menu: Menu,
    permissionName: string,
    parentName: string = ''
  ): Route {
    const route: Route = {
        path: parentName,
        canActivate: [AuthGuard],
        data: {
          headerBarConfig: menu,
          navigations: navigations,
          parentId: menu.navigationId,
          permissionName: permissionName
        },
        loadComponent: () => import('../components/header-bar/header-bar.component').then(m => m.HeaderBarComponent),
        children: this.createRoutes(navigations),
      };
    
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

}