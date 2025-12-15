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
import { MediaService } from '../../services/media.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header-bar',
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule, 
    MatTooltipModule,
    CdkDropList, 
    CdkDrag,
  ],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
/**
 * HeaderBar Component is either a header bar or a cards container.
 * If isCardContainer prop is equal to true then it's a cards container
 * else it is a header bar .
 */
export class HeaderBarComponent implements OnInit {
  
  constructor(public _router: Router,
              private _route: ActivatedRoute,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog,
              private _headerBarService: HeaderBarService,
              private _appService: AppService,
              private _mediaService: MediaService) { }

  navigations!: Navigation[];
  headerBarConfig! : HeaderBar;
  isMouseOverCard: Record<string, boolean> = {};
  isCardContainer!: boolean;
  totHeaderHeight!: number;
  headerBarImgUrl$: Observable<string> | undefined;

  /**
   * On init:
   * - Assign header bar config and headers.
   * - Create MouseOverNavigation object used to display background color of cards dynamically.
   */
  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
    this.headerBarConfig = this._route.snapshot.data["headerBarConfig"];
    this.isCardContainer = this._route.snapshot.data["isCardContainer"];
    this.totHeaderHeight = this._route.snapshot.data["totHeaderHeight"] + 5;
    this.createMouseOverObject();
    if (this.headerBarConfig.imageName) {
      this.headerBarImgUrl$ = this._mediaService.getS3ObjectSignedUrl(this.headerBarConfig.imageName);
    }
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
   * Drop a header and update position of all navigations.
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
   * Methods triggered on 'Edit menu' button click.
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
          hasDeleteButton: this.headerBarConfig.permissionName?.includes('delete'),
          formConfig: headerBarForm,
          id: this.headerBarConfig.id,
          navigationId: this.navigations[0]?.parentId,
          controllerName: 'header-bar',
        }
      }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
        this._appService.createAppRouting(this._router.url.slice(0, this._router.url.lastIndexOf('/')));
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
