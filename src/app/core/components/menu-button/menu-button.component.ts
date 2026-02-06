import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Navigation } from '../../models/navigation.interface';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NgTemplateOutlet } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { Menu, StylePayload } from '../../models/menu.interface';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { AppService } from '../../services/app.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-menu-button',
  imports: [
    MatMenuModule,
    MatButtonModule,
    NgTemplateOutlet,
    MatTooltipModule,
    CustomButtonComponent
  ],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss'
})
export class MenuButtonComponent {

  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _menuService: MenuService,
    private _appService: AppService,
    private _navigationService: NavigationService
  ) {}

  /**
   * The main menu button.
   */
  @Input() navigation!: Navigation;
  /**
   * Define if icon should be on top or name or on the left.
   */
  @Input() iconOnTop? = false;
  /**
   * Object which stores navigation hovered status.
   */
  isButtonHoveredRecord: Record<string, boolean> = {};
  
  /**
   * Methods called on 'add navigation' button click.
   * Open form to add navigation.
   * 
   * @param parentId The parent id where to add a navigation.
   */
  addNavigation(parentId: string) {
    this._navigationService.manageNavigation(parentId);
  }

  /**
   * Methods called on 'edit navigation' button click.
   * Open form to edit navigation.
   * 
   * @param event The click event.
   * @param navigation The navigation to edit.
   */
  editNavigation(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();
    this._navigationService.manageNavigation(navigation.parentId, navigation);
  }

  /**
   * Edit navigation style. 
   * 
   * @param navigation The navigation to edit.
   */
  editNavigationStyle(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();
    
    const styleInformation = {
      typographyStyle: navigation.typographyStyle
    }
    const navigationStyleForm = this._menuService.setupStyleForm(styleInformation);

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<StylePayload>,
      { 
        maxWidth: '700px',
        data: {
          hasDeleteButton: false,
          formConfig: navigationStyleForm,
          id: navigation.id,
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

  /**
   * Methods called on menu 'marker' button click.
   * Open generic form to edit menu style.
   * 
   * @param menu The menu to edit.
   */
  editMenuStyle(menu: Menu) {
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