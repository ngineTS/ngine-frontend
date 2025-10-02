import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';


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
              private _matDialog: MatDialog) {}

  navigations!: Navigation[];

  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
  }

  isRouteActive(navigationName: string) {
    return this._router.url.includes(navigationName);
  }

  drop(event: CdkDragDrop<Navigation[]>) {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => navigationOrders.push({ id: navigation.id, order: index })); 
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(resp => {});
  }

  /**
   * Methods call on 'edit' or '+' button click.
   * 
   * Open navigation management form to add or edit header.
   * 
   * If navigation is passed edit header else add header.
   * @param navigation Navigation to edit (optional).
   */
  openFormToaddOrEditHeader(navigation?: Navigation) {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: 'header',
        parentId: this._route.snapshot.data["parentId"]
      },
    });
  }

}
