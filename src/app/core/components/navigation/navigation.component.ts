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
  selector: 'app-navigation',
  imports: [
            RouterOutlet, 
            RouterModule, 
            CommonModule, 
            MatTooltipModule,
            CdkDropList, 
            CdkDrag,
           ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  
  constructor(public _router: Router,
              private _route: ActivatedRoute,
              private _navigationService: NavigationService,
              private _matDialog: MatDialog) {}

  navigations!: Navigation[];

  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
  }

  isRouteActive(navigationName: string){
    return this._router.url.includes(navigationName);
  }

  ngOnDestroy(){
    console.log('DESTROY', this.navigations);
  }

  drop(event: CdkDragDrop<Navigation[]>) {
    moveItemInArray(this.navigations, event.previousIndex, event.currentIndex);
    event.container.data.forEach((navigation, index) => navigation.order = index);
    this._navigationService.saveNavigations(event.container.data).subscribe(resp => console.log(resp));
  }

  openNavigationManagementForm(navigation?: Navigation) {
    console.log('navigation component', navigation);
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: 'header',
      },
      width: 'fit-content'
    });
  }

}
