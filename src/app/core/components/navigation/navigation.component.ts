import { AfterViewInit, Component, ComponentRef, ElementRef, inject, Injector, Input, inputBinding, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Navigation } from '../../models/navigation.interface';
import { MatDialog } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { NavigationService } from '../../services/navigation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { retry, take } from 'rxjs';
import { ComponentsContainerService } from '../../services/components-container.service';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';

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
export class NavigationComponent extends NavigationBaseComponent implements OnInit, AfterViewInit, OnDestroy {

  injector = inject(Injector);
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('navigationDiv') navigationDiv!: ElementRef<HTMLDivElement>;
  //containerRef!: ComponentRef<unknown>;
  width!: number;
  heigth!: number;
  previousWidth!: number;
  previousHeigth!: number;
  initialWindowWidth!: number;
  initialWindowHeigth!: number;
  observer: MutationObserver | undefined;

  constructor(
              private _componentContainerService: ComponentsContainerService,
              _matDialog: MatDialog,
              _navigationService: NavigationService) { 
                super(_matDialog, _navigationService); 
              }

  /**
   * Initialize width, previousWidth and initialWindowSize properties.
   */
  ngOnInit(): void {
    this.initialWindowWidth = window.innerWidth;
    this.initialWindowHeigth = window.innerHeight;
    this.previousWidth = this._navigation.width.valueOf() * this.initialWindowWidth / 100;
    this.previousHeigth = this._navigation.height.valueOf() * this.initialWindowHeigth / 100;
    this.width = this._navigation.width.valueOf() * this.initialWindowWidth / 100;
    this.heigth = this._navigation.height.valueOf() * this.initialWindowHeigth / 100;
  }

  /**
   * After view init, 
   * load component and create size observer.
   */
  ngAfterViewInit(): void {
    this.loadComponent();
    this.createSizeObserver();
  }

  /**
   * On destroy, disconnect observer.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /**
   * Load component from component dictionnary.  
   */
  async loadComponent() {
    const component = await this._componentContainerService
      .componentStore[this._navigation.navigationType.name]().then(m => 
        m[this._componentContainerService.kebabCasetoPascaleCase(this._navigation.navigationType.name) + 'Component']
      );

    this.container.createComponent(component, {
        injector: this.injector,
        bindings: [
          inputBinding('_navigation', () => this._navigation),
          inputBinding('_canEdit', () => this._canEdit),
          inputBinding('_canAdd', () => this._canAdd),
        ]
    });
  }

  /**
   * Create size observer on itself.
   * 
   * This observer retrieve width and height of HTML element
   * and assign it to width and height class properties on each change.
   * 
   */
  createSizeObserver() {
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
   * Methods called on 'Save size' button click.
   * 
   * - Calcul width and height % based on screen size.
   * - Call API to update navigation width and height.
   * - Assign new value to previousWidth and previousHeight properties.
   */
  onSaveSizeClick(): void {
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
  onResetSizeClick(): void {
    this.width = this.previousWidth.valueOf();
    this.heigth = this.previousHeigth.valueOf();
  }

  /**
   * Methods called on edit button click.
   * 
   * Open navigation management form to edit navigation properties.
   */
  openFormToEditNavigation(): void {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: this._navigation,
        type: 'component',
        parentId: this._navigation.parentId,
      }
    });
  }
  
}
