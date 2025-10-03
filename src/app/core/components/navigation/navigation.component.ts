import { AfterViewInit, Component, ElementRef, input, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { retry, take } from 'rxjs';

@Component({
  selector: 'app-navigation',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() _navigation!: Navigation;
  @Input() _canEdit!: boolean;
  @Input() _canAdd!: boolean;
  protected readonly _retryCount = 2;
  protected readonly _takeCount = 1;
  //_content: T | undefined;

  @ViewChild('navigationDiv') navigationDiv!: ElementRef<HTMLDivElement>;
  width!: number;
  heigth!: number;
  previousWidth!: number;
  previousHeigth!: number;
  initialWindowWidth!: number;
  initialWindowHeigth!: number;
  observer: MutationObserver | undefined;

  constructor(protected _matDialog: MatDialog,
              protected _navigationService: NavigationService) { }

  /**
   * Initialize width, previousWidth and initialWindowSize properties.
   */
  ngOnInit() {
    this.initialWindowWidth = window.innerWidth;
    this.initialWindowHeigth = window.innerHeight;
    this.previousWidth = this._navigation.width.valueOf() * this.initialWindowWidth / 100;
    this.previousHeigth = this._navigation.height.valueOf() * this.initialWindowHeigth / 100;
    this.width = this._navigation.width.valueOf() * this.initialWindowWidth / 100;
    this.heigth = this._navigation.height.valueOf() * this.initialWindowHeigth / 100;
  }

  /**
   * After view init, create a size observer on navigation div HTML element.
   * 
   * This observer retrieve width and height of HTML element 
   * and assign it to width and height properties on each change.
   */
  ngAfterViewInit() {
    this.observer = new MutationObserver(() => {
      this.width = this.navigationDiv.nativeElement.offsetWidth;
      this.heigth = this.navigationDiv.nativeElement.offsetHeight;
    });
    this.observer.observe(
      this.navigationDiv.nativeElement,
      { attributes: true, attributeFilter: ['style'] }
    );
  }

  /**
   * On destroy, disconnect observer.
   */
  ngOnDestroy() {
    this.observer?.disconnect();
  }

  /**
   * Methods called on 'Save size' button click.
   * 
   * - Calcul width and height % based on screen size.
   * - Call API to update navigation width and height.
   * - Assign new value to previousWidth and previousHeight properties.
   */
  onSaveSizeClick() {
    const navigationSize: Partial<Navigation> = {
      width: Math.round((this.width / window.innerWidth * 100)),
      height: Math.round((this.heigth / window.innerHeight * 100))
    };
    this._navigationService.updateNavigation(this._navigation.id, navigationSize)
      .pipe(
        retry(this._retryCount),
        take(this._takeCount)
      )
      .subscribe(() => {
        this.previousWidth = this.width.valueOf();
        this.previousHeigth = this.heigth.valueOf();
      });
  }

  /**
   * Methods called on 'Reset size' button click.
   * 
   * Reset width and height to their previous value.
   */
  onResetSizeClick() {
    this.width = this.previousWidth.valueOf();
    this.heigth = this.previousHeigth.valueOf();
  }

  /**
   * Methods called on edit button click.
   * 
   * Open navigation management form to edit navigation properties.
   */
  openFormToEditComponent() {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: this._navigation,
        type: 'component',
        parentId: this._navigation.parentId,
      }
    });
  }
  
}
