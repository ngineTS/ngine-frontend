import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { HeaderBar, HeaderBarPayload } from '../../models/header-bar.interface';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { HeaderBarService } from '../../services/header-bar.service';
import { AppService } from '../../services/app.service';


@Component({
  selector: 'app-header',
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule, 
    MatTooltipModule,
    CdkDropList, 
    CdkDrag,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  
  constructor(public _router: Router,
              private _route: ActivatedRoute,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog,
              public _headerBarService: HeaderBarService,
              private _appService: AppService) { }

  navigations!: Navigation[];
  headerBarConfig : HeaderBar | undefined;
  isMouseOverCard: Record<string, boolean> = {};

  /**
   * On init:
   * - Assign header bar config and headers.
   * - Create MouseOverNavigation object used to display background color of cards dynamically.
   * - Increment total header height.
   */
  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
    this.headerBarConfig = this._route.snapshot.data["headerBarConfig"];
    this.createMouseOverObject();
    //if in "card" mode then no need to take in account the height of headerBar because there is no header bar.
    if (this.headerBarConfig?.isVisibleDuringNavigation) {
      this._headerBarService.totalHeaderHeight = this._headerBarService.totalHeaderHeight 
        + this.headerBarConfig.height
        + this.headerBarConfig.borderBottom;
    }
  }

  /**
   * Check wether the user is on this header or not.
   * Used to change color of header.
   * @param navigationName The navigation name to check.
   * @returns true or false.
   */
  isRouteActive(navigationName: string) {
    return this._router.url.includes(navigationName);
  }

  /**
   * Drop a component and update position of all navigations.
   * @param event The CdkDragDrop event containing navigation positions. 
   */
  drop(event: CdkDragDrop<Navigation[]>): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => navigationOrders.push({ id: navigation.id, order: index })); 
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(resp => {});
  }

  /**
   * Methods call on 'edit header' or 'add header' button click.
   * 
   * Open navigation management form to add or edit header.
   * 
   * If navigation is passed edit header else add header.
   * @param navigation Navigation to edit (optional).
   */
  openFormToAddOrEditHeader(navigation?: Navigation): void {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: 'header',
        parentId: this._route.snapshot.data["parentId"]
      },
    });
  }

  /**
   * Methods call on 'edit header bar' button click.
   * 
   * Open header bar form to edit header bar configuration.
   */
  openFormToEditHeaderBar() {
    const headerBarForm = this._headerBarService.setUpHeaderBarForm(this.headerBarConfig);

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<HeaderBarPayload>,
      { 
        maxWidth: '700px',
        data: {
          formConfig: headerBarForm,
          id: this.headerBarConfig?.id,
          navigationId: this.navigations[0]?.parentId,
          controllerName: 'header-bar',
        }
      }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
        this._appService.createRouting();
      }
    });
  }

  createMouseOverObject() {
    for (let navigation of this.navigations) {
      this.isMouseOverCard[navigation.id] = false;
    }
  }

  navigateToCardUrl(navigationName: string) {
    console.log("yeeaaaah");
    this._router.navigate([navigationName], { relativeTo: this._route });
  }

}
