import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Navigation } from '../../models/navigation.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NgTemplateOutlet } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { Menu, StylePayload } from '../../models/menu.interface';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-menu-button',
  imports: [MatMenuModule, MatButtonModule, NgTemplateOutlet],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss'
})
export class MenuButtonComponent {

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _matDialog: MatDialog,
    private _menuService: MenuService,
    private _appService: AppService
  ) {}

  @Input() navigation!: Navigation;
  isButtonHoveredRecord: Record<string, boolean> = {};

  /**
   * Navigate to given route name.
   * @param navigationName The name of the route.
   */
  navigateTo(navigationName: string) {
    console.log('navName', navigationName);
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

  /**
   * Methods triggered on 'add' menu option click.
   * 
   * Open form to add navigation.
   */
  openFormToAddButton(navigationId: string, type: 'redirect-button' | 'menu-button') {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: undefined, // undefined as it is 'add' case.
        type: type,
        parentId: navigationId,
      }
    });
  }

  /**
   * Methods triggered on 'edit' menu option click.
   * 
   * Open form to edit navigation.
   */
  openFormToEditButton(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();

    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: navigation.navigationType.name,
        parentId: navigation.parentId,
      }
    });
  }

  /**
   * Methods triggered on marker button click.
   * 
   * Open generic form to edit menu style.
   */
  openFormToEditMenuStyle(menu: Menu) {
    const menuStyleForm = this._menuService.setupStyleForm({
      containerLayout: menu.containerLayout,
      containerStyle: menu.containerStyle,
      typographyStyle: menu.typographyStyle
    });

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<StylePayload>,
      { 
        maxWidth: '700px',
        data: {
          hasDeleteButton: false,
          formConfig: menuStyleForm,
          id: menu.id,
          controllerName: 'menu',
        }
      }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
        this._appService.createAppRouting(this._router.url);
      }
    });
  }

}
