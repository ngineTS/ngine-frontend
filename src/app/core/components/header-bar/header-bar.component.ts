import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { StylePayload } from '../../models/menu.interface';
import { MenuService } from '../../services/menu.service';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { MatMenuModule } from '@angular/material/menu';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take } from 'rxjs';


@Component({
  selector: 'app-header-bar',
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule, 
    MatTooltipModule,
    CdkDrag,
    MenuButtonComponent,
    CustomButtonComponent,
    MatMenuModule,
  ],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent implements OnInit {
  
  constructor(
    public _router: Router,
    private _route: ActivatedRoute,
    private _navigationService: NavigationService,
    private _menuService: MenuService,
    private _containerLayoutService: ContainerLayoutService,
  ) { }

  /**
   * The navigations container.
   */
  navigation!: Navigation;
  /**
   * Boolean to inform if one of the items of header bar is being dragged.
   */
  isDragging = false;

  /**
   * Lifecycle hook called after the component has been initialized.
   */
  ngOnInit() {
    this.navigation = this._route.snapshot.data["navigation"];
  }

  /**
   * Methods called on '+' or 'gear' button click.
   * Open navigation management form to add or edit navigation properties.
   * 
   * @param navigation The navigation to edit (optional).
   */
  manageNavigation(navigation?: Navigation): void {
    this._navigationService.manageNavigation(this.navigation.id, navigation);
  }

  /**
   * Methods called on 'edit menu' button click.
   * Open menu form to edit navigation bar configuration.
   */
  editMenuStyle() {
    const menuStylePayload: Partial<StylePayload> = {
      containerLayout: this.navigation.menu.containerLayout,
      containerStyle: this.navigation.menu.containerStyle,
    }

    this._menuService.manageStyle(menuStylePayload, this.navigation.menu.id);
  }

  /**
   * Edit navigation style. 
   * 
   * @param navigation The navigation to edit.
   */
  editNavigationStyle(navigation: Navigation) {
    const navigationStylePayload: Partial<StylePayload> = {
      containerLayout: navigation.containerLayout,
      typographyStyle: navigation.typographyStyle
    }

    this._menuService.manageStyle(navigationStylePayload, navigation.id);
  }

  /**
   * Methods called when an item is being dragged.
   * Set `isDragging` to true.
   */
  onDragStart() {
    this.isDragging = true;
  }

  /**
   * Method called when drag end.
   * Get element position from cdkDragEnd event, convert it to percentage of screen size and save it.
   * It also set `isDragging` to false;
   * 
   * @param event The cdkDragEnd event.
   * @param navigation The navigation dragged.
   */
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    this.isDragging = false; 
    event.event.preventDefault();
    event.event.stopImmediatePropagation();
    const positon = event.source.getFreeDragPosition();
    const navigationPosition = {
      xPos: Math.round(positon.x),
      yPos: Math.round(positon.y),
    }
    this._containerLayoutService.updateContainerLayout(navigation.containerLayout.id, navigationPosition)
      .pipe(take(1))
      .subscribe(resp => console.log(resp));
  }
}
