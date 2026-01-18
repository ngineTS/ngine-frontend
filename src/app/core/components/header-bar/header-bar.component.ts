import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { HeaderBarService } from '../../services/header-bar.service';
import { AppService } from '../../services/app.service';
import { MediaService } from '../../services/media.service';
import { Observable } from 'rxjs';
import { Menu, StylePayload } from '../../models/menu.interface';
import { MenuService } from '../../services/menu.service';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-header-bar',
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule, 
    MatTooltipModule,
    CdkDropList, 
    CdkDrag,
    MenuButtonComponent,
    MatMenuModule
  ],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent implements OnInit {
  
  constructor(public _router: Router,
              private _route: ActivatedRoute,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog,
              private _menuService: MenuService,
              private _appService: AppService,
              private _mediaService: MediaService) { }

  navigations!: Navigation[];
  headerBarConfig! : Menu;
  isMouseOverCard: Record<string, boolean> = {};
  headerBarImgUrl$: Observable<string> | undefined;
  permissionName: string | undefined;

  /**
   * Lifecycle hook called after the component has been initialized.
   * - Retrieve route snapshot data properties.
   * - Create MouseOverNavigation object used to display background color of cards dynamically.
   * - Get logo from file repository if exists.
   */
  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
    this.headerBarConfig = this._route.snapshot.data["headerBarConfig"];
    this.permissionName = this._route.snapshot.data["permissionName"];
    this.createMouseOverObject();
    /*if (this.headerBarConfig.imageName) {
      this.headerBarImgUrl$ = this._mediaService.getS3ObjectSignedUrl(this.headerBarConfig.imageName);
    }*/
  }

  /**
   * Check wether the user is on this header or not.
   * @param navigationName The navigation name to check.
   * @returns true or false.
   */
  isRouteActive(navigationName: string) {
    const urlList = this._router.url.split('/');
    return urlList.includes(navigationName);
  }

  /**
   * Drop a navigation and update position of all navigations.
   * @param event The CdkDragDrop event containing navigation positions. 
   */
  drop(event: CdkDragDrop<Navigation[]>): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => navigationOrders.push({ id: navigation.id, order: index })); 
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(resp => {});
  }

  /**
   * Methods triggered on 'Add header' or 'Edit header' button click.
   * 
   * Open navigation management form to add or edit header.
   * 
   * If navigation is passed edit header else add header.
   * @param navigation Navigation to edit (optional).
   */
  openFormToAddOrEditNavigation(type: string, navigation?: Navigation): void {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: type,
        parentId: this._route.snapshot.data["parentId"]
      },
    });
  }

  /**
   * Methods triggered on 'Edit menu' button click.
   * 
   * Open menu form to edit navigation bar configuration.
   */
  openFormToEditHeaderBarStyle() {
    const styleInformation = {
      containerLayout: this.headerBarConfig.containerLayout,
      containerStyle: this.headerBarConfig.containerStyle,
      typographyStyle: this.headerBarConfig.typographyStyle
    }
    const headerBarForm = this._menuService.setupStyleForm(styleInformation);

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<StylePayload>,
      { 
        maxWidth: '700px',
        data: {
          hasDeleteButton: false,
          formConfig: headerBarForm,
          id: this.headerBarConfig.id,
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
   * Store navigation hover status.
   * Used to change background and color on header mouse over.
   */
  createMouseOverObject() {
    for (let navigation of this.navigations) {
      this.isMouseOverCard[navigation.id] = false;
    }
  }

  /**
   * Navigate to given route name.
   * @param navigationName The name of the route.
   */
  navigateToCardUrl(navigationName: string) {
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

}
