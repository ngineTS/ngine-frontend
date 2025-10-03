import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private _route: ActivatedRoute,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog) {}

  navigations!: Array<Navigation>;

  ngOnInit(): void {
    this.navigations = this._route.snapshot.data["navigations"];
  }

  /**
   * Drop a component and update position of all navigations.
   * @param event The CdkDragDrop event containing navigation positions.
   */
  drop(event: CdkDragDrop<Navigation[]>): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => { navigationOrders.push({ id: navigation.id, order: index })});
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(resp => {});
  }

  /**
   * Methods trigered on '+' button click.
   * 
   * Open navigation management form to add header or component
   * depending on the type passed.
   * @param type The type ('header' or 'component').
   */
  openFormToAddHeaderOrComponent(type: 'header' | 'component'): void {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: undefined,
        type: type,
        parentId: this._route.snapshot.data["parentId"]
      }
    });
  }

}
