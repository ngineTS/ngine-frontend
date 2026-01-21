import { AfterViewInit, Component, ComponentRef, ElementRef, inject, Injector, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { take } from 'rxjs';
import { ComponentsContainerService } from '../../services/components-container.service';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { MenuService } from '../../services/menu.service';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { StylePayload } from '../../models/menu.interface';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { CustomButtonComponent } from '../custom-button/custom-button.component';

@Component({
  selector: 'app-navigation',
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    MatTooltipModule,
    MenuButtonComponent,
    CustomButtonComponent
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent extends NavigationBaseComponent implements OnInit, AfterViewInit, OnDestroy {

  injector = inject(Injector);
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('navigationDiv') navigationDiv!: ElementRef<HTMLDivElement>;
  containerRef!: ComponentRef<NavigationBaseComponent>;
  previousWidth!: number;
  previousheight!: number;
  initialWindowWidth!: number;
  initialWindowheight!: number;
  observer: MutationObserver | undefined;
  isMouseOver = false;

  constructor(
    private _componentContainerService: ComponentsContainerService,
    private _containerLayoutService: ContainerLayoutService,
    private _menuService: MenuService,
    private _appService: AppService,
    private _router: Router
  ) { 
    super(); 
  }

  /**
   * Initialize width, previousWidth and initialWindowSize properties.
   */
  ngOnInit(): void {
    this.initialWindowWidth = window.innerWidth;
    this.initialWindowheight = window.innerHeight;
    this.previousWidth = this._navigation.containerLayout.width ? 
      this._navigation.containerLayout.width * this.initialWindowWidth / 100 :
      20 * this.initialWindowWidth / 100;
    this.previousheight = this._navigation.containerLayout.height ?
      this._navigation.containerLayout.height * this.initialWindowheight / 100 :
      20 * this.initialWindowheight / 100;
    this._width = this.previousWidth;
    this._height = this.previousheight;
  }

  /**
   * After view init, 
   * load component and create size observer.
   */
  ngAfterViewInit(): void {
    if (
      this._navigation.navigationType.name !== 'redirect-button' &&
      this._navigation.navigationType.name !== 'menu-button'
    ) {
      this.loadComponent();
    }
    this.createSizeObserver();
  }

  /**
   * On destroy, disconnect observer and detroy containerRef.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.containerRef?.destroy();
  }

  /**
   * Load component from component dictionnary.
   */
  async loadComponent() {
    const component = await this._componentContainerService
      .componentStore[this._navigation.navigationType.name]().then(m => 
        m[this._componentContainerService.kebabCasetoPascaleCase(this._navigation.navigationType.name) + 'Component']
      );

    this.containerRef = this.container.createComponent(component, {
        injector: this.injector,
    });

    this.containerRef.setInput('_navigation', this._navigation);
    this.containerRef.setInput('_canAdd', this._canAdd);
    this.containerRef.setInput('_canEdit', this._canEdit);
    this.containerRef.setInput('_canDelete', this._canDelete);
    this.containerRef.setInput('_width', this._width);
    this.containerRef.setInput('_height', this._height);
    this.containerRef.setInput('_isEditing', false);
    this.containerRef.instance._stopEditing.subscribe(resp => {
      this._isEditing = !resp;
      this.containerRef.setInput('_isEditing', this._isEditing);
    })
  }

  /**
   * Create size observer on itself.
   * 
   * This observer retrieve width and height of HTML element
   * and assign it to _width and _height class properties on each change.
   * 
   * It also updates _width and _height inputs of container ref.
   */
  createSizeObserver() {
    this.observer = new MutationObserver(() => {
      this._width = this.navigationDiv.nativeElement.offsetWidth;
      this._height = this.navigationDiv.nativeElement.offsetHeight;
      if (
        this._navigation.navigationType.name !== 'redirect-button' &&
        this._navigation.navigationType.name !== 'menu-button'
      ) {
        this.containerRef.setInput('_width', this._width);
        this.containerRef.setInput('_height', this._height);
      }
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
    const navigationSize = {
      width: Math.round((this._width! / window.innerWidth * 100)),
      height: Math.round((this._height! / window.innerHeight * 100))
    };
    this._containerLayoutService.updateContainerLayout(this._navigation.containerLayout.id, navigationSize)
      .pipe(take(this._takeCount))
      .subscribe(() => {
        this._navigation.containerLayout.width = navigationSize.width;
        this._navigation.containerLayout.height = navigationSize.height;
        this.previousWidth = this._width.valueOf();
        this.previousheight = this._height.valueOf();
      });
  }

  /**
   * Methods called on 'Reset size' button click.
   * 
   * Reset width and height to their previous value.
   */
  onResetSizeClick(): void {
    this._width = this.previousWidth.valueOf();
    this._height = this.previousheight.valueOf();
  }

  /**
   * Methods triggered on gear button click.
   * 
   * Open navigation management form to edit navigation properties.
   */
  openFormToEditNavigation(type: 'redirect-button' | 'component' | 'menu-button'): void {
    this._matDialog.open(NavigationManagementComponent, {
      data: {
        navigation: this._navigation,
        type: type,
        parentId: this._navigation.parentId,
      }
    });
  }

  /**
   * Methods triggered on marker button click.
   * 
   * Open generic form to edit navigation style.
   */
  openFormToEditStyle() {
    const navigationStyleForm = this._menuService.setupStyleForm({
      containerLayout: this._navigation.containerLayout,
      containerStyle: this._navigation.containerStyle,
      typographyStyle: this._navigation.typographyStyle
    });

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<StylePayload>,
      { 
        maxWidth: '700px',
        data: {
          hasDeleteButton: false,
          formConfig: navigationStyleForm,
          id: this._navigation.id,
          controllerName: 'menu',
        }
      }
    );

    matDialogRef.afterClosed().subscribe(resp => {
      if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
        this._appService.createAppRouting(this._router.url);
      }
    });
  }

  /**
   * Methods triggered on "edit" or "x" button click.
   * 
   * Switch edit mode.
   */
  switchEditMode() {
    this._isEditing = !this._isEditing;
    this.containerRef.setInput('_isEditing', this._isEditing);
  }

}