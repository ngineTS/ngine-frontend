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
import { CustomButtonType } from '../../models/custom-button.interface';


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
   * The components container.
   */
  navigation!: Navigation;

  /**
   * Lifecyle hook called after the component has been initialized.
   * Retrieve route snapshot data properties.
   */
  ngOnInit(): void {
    this.navigation = this._route.snapshot.data["navigation"];
  }

  /**
   * Drop a navigation and update position of all navigations.
   * 
   * @param event The CdkDragDrop event containing navigation positions.
   */
  drop(event: CdkDragDrop<Navigation[]>): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigation.children!, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => { navigationOrders.push({ id: navigation.id, order: index })});
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(() => {});
  }

  /**
   * Methods called on '+' button click.
   * Open navigation form to create navigation or navigation bar.
   * 
   * @param type The type ('navigation-bar' or 'navigation').
   */
  openFormToAddNavigationBarOrNavigation(type: 'navigation-bar' | 'navigation'): void {
    if (type !== 'navigation-bar') {
      this._matDialog.open(NavigationManagementComponent, {
        data: {
          navigation: undefined,
          parentId: this.navigation.id
        }
      });
    }
    else {
      this._menuService.createNavigationBar(this.navigation.id)
        .subscribe(resp => {
          this._snackbarService.showSuccessSnackBar(resp);
          this._appService.createAppRouting(this._router.url);
        });
    }
  }

}
