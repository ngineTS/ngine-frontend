import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Navigation } from '../../models/navigation.interface';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { NavigationComponent } from '../navigation/navigation.component';
import { MenuService } from '../../services/menu.service';
import { AppService } from '../../services/app.service';
import { SnackBarService } from '../../services/snackbar.service';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take } from 'rxjs';


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
    private _menuService: MenuService,
    private _appService: AppService,
    private _snackbarService: SnackBarService,
    private _router: Router,
    private _containerLayoutService: ContainerLayoutService,
  ) {}

  /** 
   * The components container.
   */
  navigation!: Navigation;
  /**
   * Window width.
   */
  windowInnerWidth!: number;
  /**
   * Window height.
   */
  windowInnerHeight!: number;


  /**
   * Lifecyle hook called after the component has been initialized.
   * Retrieve route snapshot data properties.
   */
  ngOnInit(): void {
    this.windowInnerWidth = window.innerWidth;
    this.windowInnerHeight = window.innerHeight;
    this.navigation = this._route.snapshot.data["navigation"];
    this.navigation.children?.sort((a, b) => {
      const aXPosRounded = Math.ceil(a.containerLayout.xPos! / 10) * 10;
      const bXPosRounded = Math.ceil(b.containerLayout.xPos! / 10) * 10;
      const aYPosRounded = Math.ceil(a.containerLayout.yPos! / 10) * 10;
      const bYPosRounded = Math.ceil(b.containerLayout.yPos! / 10) * 10;
      if (aXPosRounded !== bXPosRounded) {
        return aXPosRounded - bXPosRounded; // priority: xPos
      }
      return aYPosRounded - bYPosRounded; // secondary: yPos
    });
  }

  /**
   * Drop a navigation and update position of all navigations.
   * 
   * @param event The CdkDragDrop event containing navigation positions.
   */
  drop(event: CdkDragDrop<Navigation[]>): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigation.children!, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => { navigationOrders.push({ id: navigation.id, order: index }) });
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
      this._navigationService.manageNavigation(this.navigation.id);
    }
    else {
      this._menuService.createNavigationBar(this.navigation.id)
        .subscribe(resp => {
          this._snackbarService.showSuccessSnackBar(resp);
          this._appService.createAppRouting(this._router.url);
        });
    }
  }

  
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    const positon = event.source.getFreeDragPosition();
    console.log('Nav', navigation);
    console.log('New position', positon);
    const navigationPosition = {
      xPos: Math.round(positon.x / window.innerWidth * 100),
      yPos: Math.round(positon.y / window.innerHeight * 100),
    }
    this._containerLayoutService.updateContainerLayout(navigation.containerLayout.id, navigationPosition)
      .pipe(take(1))
      .subscribe(resp => console.log(resp));
  }

}
