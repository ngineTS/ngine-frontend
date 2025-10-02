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
export class NavigationComponent<T> {

  @Input() navigation!: Navigation;
  @Input() canEdit!: boolean;
  @Input() canAdd!: boolean;
  content: T | undefined;

  constructor(protected _matDialog: MatDialog,
              protected _navigationService: NavigationService) {}

  /**
   * Methods call on edit button click.
   * 
   * Open navigation management form to edit component.
   */
  openFormToEditComponent() {
    console.log('navigation', this.navigation);
    console.log('canAdd', this.canAdd);
    console.log('canEdit', this.canEdit);
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: this.navigation,
        type: 'component',
        parentId: this.navigation.parentId,
      }
    });
  }

  /*onResize(rect: DOMRectReadOnly) {
    this.navigation.width = rect.width,
    this.navigation.height = rect.height
  }

  saveSizes() {
    const navigationSize: Partial<Navigation> = {
      width: Math.round(this.navigation.width / window.innerWidth * 100),
      height: Math.round(this.navigation.height / window.innerHeight * 100)
    };
    this._navigationService.updateNavigation(this.navigation.id, navigationSize)
      .subscribe(resp => console.log(resp));
  }*/
  
}
