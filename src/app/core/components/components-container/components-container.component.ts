import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { MenuService } from '../../services/menu.service';
import { AppService } from '../../services/app.service';
import { SnackBarService } from '../../services/snackbar.service';


@Component({
  selector: 'app-components-container',
  imports: [
    MatTooltipModule, 
    CommonModule, 
    CdkDropList, 
    CdkDrag,
    CdkDragHandle,
    MatProgressSpinnerModule,
    MatMenuModule,
    NavigationComponent
  ],
  templateUrl: './components-container.component.html',
  styleUrl: './components-container.component.scss'
})
export class ComponentsContainer implements OnInit {

  constructor(
    private _route: ActivatedRoute,
    private _navigationService: NavigationService,
    private _matDialog: MatDialog,
    private _menuService: MenuService,
    private _appService: AppService,
    private _snackbarService: SnackBarService,
    private _router: Router
  ) {}

  /** 
   * The navigations that contain our components.
   */
  navigations!: Array<Navigation>;
  /**
   * The user permission.
   */
  containerPermissionName!: string;

  /**
   * Lifecyle hook called after the component has been initialized.
   * Retrieve route snapshot data properties.
   */
  ngOnInit(): void {
    this.navigations = this._route.snapshot.data["navigations"];
    this.containerPermissionName = this._route.snapshot.data["containerPermissionName"] ?? '';
  }

  /**
   * Drop a navigation and update position of all navigations.
   * @param event The CdkDragDrop event containing navigation positions.
   */
  drop(event: CdkDragDrop<Navigation[]>): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => { navigationOrders.push({ id: navigation.id, order: index })});
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(() => {});
  }

  /**
   * Methods triggered on '+' button click.
   * 
   * Open Navigation form to create navigation.
   * @param type The type ('header' or 'component').
   */
  openFormToAddNavigationBarOrComponent(type: 'header-bar' | 'component'): void {
    if (type === 'component') {
      this._matDialog.open(NavigationManagementComponent, {
        data: {
          navigation: undefined,
          type: type,
          parentId: this._route.snapshot.data["parentId"]
        }
      });
    }
    else {
      this._menuService.createNavigationBar(this._route.snapshot.data["parentId"])
        .subscribe(resp => {
          this._snackbarService.showSuccessSnackBar(resp);
          this._appService.createAppRouting(this._router.url);
        });
    }
  }

}
