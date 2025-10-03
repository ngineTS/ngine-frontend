import { Component, input, Input } from '@angular/core';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NavigationService } from '../../services/navigation.service';
import { ResizeObserverDirective } from '../../directives/resize-observer.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  imports: [
    ResizeObserverDirective,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  @Input() _navigation!: Navigation;
  @Input() _canEdit!: boolean;
  @Input() _canAdd!: boolean;
  width!: number;
  height!: number;
  initialWindowWidth = window.innerWidth; //this property is used for conditional responsivity inside HTML
  initialWindowHeigth = window.innerHeight; //this property is used for conditional responsivity inside HTML

  //content: T | undefined;

  constructor(protected _matDialog: MatDialog,
              protected _navigationService: NavigationService) {}

  /**
   * Methods call on edit button click.
   * 
   * Open navigation management form to edit component.
   */
  openFormToEditComponent() {
    console.log('navigation', this._navigation);
    console.log('canAdd', this._canAdd);
    console.log('canEdit', this._canEdit);
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: this._navigation,
        type: 'component',
        parentId: this._navigation.parentId,
      }
    });
  }

  onResize(rect: DOMRectReadOnly) {
    console.log('resize');
    this.width = rect.width,
    this.height = rect.height
  }

  saveSize() {
    console.log('save');
    const navigationSize: Partial<Navigation> = {
      width: Math.round(this.width / window.innerWidth * 100),
      height: Math.round(this.height / window.innerHeight * 100)
    };
    this._navigationService.updateNavigation(this._navigation.id, navigationSize)
      .subscribe(resp => console.log(resp));
  }
  
}
