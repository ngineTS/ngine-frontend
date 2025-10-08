import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { HeaderBar } from '../../models/header-bar.interface';
import { DeepFormConfig } from '../../models/form-input.interface';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { Validators } from '@angular/forms';
import { HeaderBarService } from '../../services/header-bar.service';


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
              private _headerBarService: HeaderBarService) { }

  navigations!: Navigation[];
  headerBarConfig! : HeaderBar;

  ngOnInit() {
    this.navigations = this._route.snapshot.data["navigations"];
    this.headerBarConfig = this._route.snapshot.data["headerBarConfig"];
    console.log(this.headerBarConfig)
  }

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
   * Methods call on 'edit' or '+' button click.
   * 
   * Open navigation management form to add or edit header.
   * 
   * If navigation is passed edit header else add header.
   * @param navigation Navigation to edit (optional).
   */
  openFormToaddOrEditHeader(navigation?: Navigation): void {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: navigation,
        type: 'header',
        parentId: this._route.snapshot.data["parentId"]
      },
    });
  }

  onpenFormToEditHeaderBar() {
    const headerBarForm: DeepFormConfig<Omit<HeaderBar, "id" | "navigationId">> = {
      imageName: {
        value: this.headerBarConfig.imageName,
        type: 'file',
        validators: []
      },
      backgroundColor: {
        value: this.headerBarConfig.backgroundColor,
        type: 'color',
        validators: [Validators.required]
      },
      borderBottom: {
        value: this.headerBarConfig.borderBottom,
        type: 'text',
        validators: []
      },
      gap: {
        value: this.headerBarConfig.gap,
        type: 'text',
        validators: [Validators.required]
      },
      fontFamily: {
        value: this.headerBarConfig.fontFamily,
        type: 'dropdown',
        dropdownConfig: {
          items: this._headerBarService.headerBarFonts
        },
        validators: [Validators.required]
      },
      fontSize: {
        value: this.headerBarConfig.fontSize,
        type: 'text',
        validators: [Validators.required]
      },
      color: {
        value: this.headerBarConfig.color,
        type: 'color',
        validators: [Validators.required]
      },
      activeColor: {
        value: this.headerBarConfig.activeColor,
        type: 'color',
        validators: [Validators.required]
      },
      height: {
        value: this.headerBarConfig.height,
        type: 'text',
        validators: [Validators.required]
      },
      isVertical: {
        value: this.headerBarConfig.isVertical,
        type: 'checkbox',
        validators: [Validators.required]
      },
      isVisibleDuringNavigation: {
        value: this.headerBarConfig.isVisibleDuringNavigation,
        type: 'checkbox',
        validators: [Validators.required]
      },
    }

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<Omit<HeaderBar, "id" | "navigationId">>,
      { 
        maxWidth: '700px',
        data: {
          formConfig: headerBarForm,
          id: this.headerBarConfig.id,
          navigationId: this.navigations[0].parentId,
          controllerName: 'header-bar',
        }
      }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'edited' || resp === 'deleted') {
       console.log("WOUHOUHOU");
      }
    });
  }

}
