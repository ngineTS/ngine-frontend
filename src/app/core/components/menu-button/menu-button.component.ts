import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Navigation } from '../../models/navigation.interface';
import { NgTemplateOutlet } from '@angular/common';
import { MenuService } from '../../services/menu.service';
import { Menu, StylePayload } from '../../models/menu.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { NavigationService } from '../../services/navigation.service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-menu-button',
  imports: [
    MatMenuModule,
    MatButtonModule,
    NgTemplateOutlet,
    MatTooltipModule,
    CustomButtonComponent,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss'
})
export class MenuButtonComponent {

  constructor(
    private _menuService: MenuService,
    private _navigationService: NavigationService
  ) {}

  /** The main menu button. */
  @Input() navigation!: Navigation;
  /** Define if icon should be on top or name or on the left. */
  @Input() iconOnTop? = false;
  /** Object which stores navigation hovered status. */
  isButtonHoveredRecord: Record<string, boolean> = {};


  /**
   * Lifecycle hook called after component ahs been initialized.
   */
  ngOnInit() {
    this.sortNavigationsByOrder();
  }
  
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
   * Methods called on navigation 'marker' button click.
   * Open form to edit navigation style. 
   * 
   * @param navigation The navigation to edit.
   */
  editNavigationStyle(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();  
    const stylePayload: Partial<StylePayload> = {
      typographyStyle: navigation.typographyStyle
    }

    this._menuService.manageStyle(stylePayload, navigation.id);
  }

  /**
   * Methods called on menu 'marker' button click.
   * Open generic form to edit menu style.
   * 
   * @param menu The menu to edit.
   */
  editMenuStyle(menu: Menu) {
    const menuStylePayload: StylePayload = {
      containerLayout: menu.containerLayout,
      containerStyle: menu.containerStyle,
      typographyStyle: menu.typographyStyle
    };

    this._menuService.manageStyle(menuStylePayload, menu.id);
  }

  /**
   * Drop a navigation and update position of all navigations.
   * 
   * @param event The CdkDragDrop event containing navigation positions.
   */
  drop(event: CdkDragDrop<Navigation[]>, navigation: Navigation): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(navigation.children!, event.previousIndex, event.currentIndex)
    navigation.children!.forEach((nav, index) => { 
      navigationOrders.push({ id: nav.id, order: index });
      nav.order = index;
    });
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(() => {});
  }


  /**
   * Recursively sort navigations by order.
   */
  sortNavigationsByOrder() {
    this.navigation.children?.sort((a, b) => a.order - b.order);
    this.navigation.children?.forEach(child => 
      child.children?.sort((a, b) => a.order - b.order)
    );
  }

}