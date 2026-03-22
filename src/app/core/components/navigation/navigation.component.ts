import { AfterViewInit, Component, ComponentRef, ElementRef, HostListener, inject, Injector, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { take, takeUntil } from 'rxjs';
import { ComponentsContainerService } from '../../services/components-container.service';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { MenuService } from '../../services/menu.service';
import { StylePayload } from '../../models/menu.interface';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { TypographyStyleService } from '../../services/typography-style.service';
import { ContainerStyleService } from '../../services/container-style.service';
import { DeepFormConfig } from '../../models/form-input.interface';
import { SideNavService } from '../../services/side-nav.service';

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

  /* The injector to use as the parent for the dynamic component. */
  injector = inject(Injector);
  /* The HTML container of the dynamic component. */
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  /* The HTML container of the navigation. */
  @ViewChild('navigationDiv') navigationDiv!: ElementRef<HTMLDivElement>;
  /* The dynamic component ref. */
  containerRef!: ComponentRef<NavigationBaseComponent>;
  /* The size observer used to detect resize of navigation. */
  observer: MutationObserver | undefined;
    /** The window width. */
  windowWidth!: number;
  /** The window height. */
  windowHeight!: number;
  /** Navigation mouseover state. */
  isMouseOver = false;
  /** Navigation resize state. */
  isResizing = false;

  constructor(
    private _componentContainerService: ComponentsContainerService,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _menuService: MenuService,
    private _sideNavService: SideNavService,
  ) { 
    super(); 
  }

  /**
   * Get window size each time it changes (zoom, screen resize...).
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  /**
   * Lifecycle hook called after component has been initialized.
   * 
   * Assign window size.
   */
  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
  }

  /**
   * Lifecycle hook called after component template has been initialized.
   * 
   * Load component and create navigation size observer.
   */
  ngAfterViewInit(): void {
    this.loadComponent();
    this.createSizeObserver();
  }

  /**
   * On destroy, disconnect observer and destroy containerRef.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.containerRef?.destroy();
  }

  /**
   * Load component from components library and set inputs. 
   */
  async loadComponent() {
    const componentImportRef = this._componentContainerService.componentStore[this._navigation.navigationType.name];
    if (!componentImportRef) {
      return;
    }

    const component = await componentImportRef().then(m => 
        m[this._componentContainerService.kebabCasetoPascaleCase(this._navigation.navigationType.name) + 'Component']
      );

    this.containerRef = this.container.createComponent(component, {
        injector: this.injector,
    });

    this.containerRef.setInput('_navigation', this._navigation);
    this.containerRef.setInput('_canAdd', this._canAdd);
    this.containerRef.setInput('_canEdit', this._canEdit);
    this.containerRef.setInput('_canDelete', this._canDelete);
    this.containerRef.setInput('_isEditing', false);
    this.containerRef.instance._stopEditing.subscribe(resp => {
      this._isEditing = !resp;
      this.containerRef.setInput('_isEditing', this._isEditing);
    });
  }

  /**
   * Create size observer on navigation.

   * On size change detection show save/reset size buttons.
   */
  createSizeObserver() {
    this.observer = new MutationObserver(() => {
      if (this.isMouseOver) this.isResizing = true;
    });

    this.observer.observe(
      this.navigationDiv.nativeElement,
      { attributes: true, attributeFilter: ['style'] }
    );
  }

  /**
   * Methods called on 'Save size' button click.
   * - calcul width and height % based on screen size
   * - update container layout width and height
   */
  onSaveSizeClick(): void {
    const navigationSize = {
      width: this.navigationDiv.nativeElement.offsetWidth / window.innerWidth * 100,
      height: this.navigationDiv.nativeElement.offsetHeight / window.innerHeight * 100
    };

    this._containerLayoutService.updateContainerLayout(this._navigation.containerLayout.id, navigationSize)
      .pipe(take(this._takeCount))
      .subscribe(() => {
        this._navigation.containerLayout.width = navigationSize.width;
        this._navigation.containerLayout.height = navigationSize.height;
        this.isResizing = false;
        
        if (this.containerRef) {
          this._sizeChanged = !this._sizeChanged;
          this.containerRef.setInput('_sizeChanged', this._sizeChanged);
        }
      });
  }

  /**
   * Methods called on 'Reset size' button click.
   * Reset navigation size to his previous value.
   */
  onResetSizeClick(): void {
    this.windowWidth = this.windowWidth + 0.01; //used to force change detection (TODO: improve)
    this.isResizing = false;
  }

  /**
   * Methods called on 'edit' or 'x' button click.
   * 
   * Switch edit mode and update component input.
   */
  switchEditMode() {
    this._isEditing = !this._isEditing;
    this.containerRef.setInput('_isEditing', this._isEditing);
  }

  /**
   * Methods called on top right 'gear' button click.
   * 
   * Open form to edit navigation properties.
   */
  editNavigation(): void {
    this._navigationService.manageNavigation(this._navigation.parentId, this._navigation);
  }

  /**
   * Methods called on top right 'marker' button click.
   * 
   * Open sidenav with navigation style properties and listen to changes.
   * It also stop the previous listener.
   */
  editNavigationStyle() {
    this._sideNavService.resetSideNavContent();

    const navigationStylePayload:  DeepFormConfig<StylePayload> = {
      containerLayout: this._containerLayoutService.setUpContainerLayoutForm(
        this._navigation.containerLayout,
        ['marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'width', 'height']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(this._navigation.containerStyle),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(this._navigation.typographyStyle)
    };

    this._menuService.manageStyle(
      navigationStylePayload,
      this._navigation.id,
      this._navigation.displayLabel
    );

    this.setSideNavFormListener();
  }

  /**
   * Setup listener on sidenav to update navigation style in real time.
   * 
   * If sidenav is closed without saving then assign back initial style.
   */
  setSideNavFormListener() {
    const initialFormContent: StylePayload = {
      containerLayout: JSON.parse(JSON.stringify(this._navigation.containerLayout)),
      containerStyle: JSON.parse(JSON.stringify(this._navigation.containerStyle)),
      typographyStyle: JSON.parse(JSON.stringify(this._navigation.typographyStyle)),
    }

    this._sideNavService.initalFormContent = initialFormContent;

    this._sideNavService.formValueEvent
      .pipe(takeUntil(this._sideNavService.stopSubscriptions))
      .subscribe(formValueEvent => {
        if (formValueEvent.formControlValue === 'close') {
          this._navigation.containerLayout = this._sideNavService.initalFormContent!['containerLayout'];
          this._navigation.containerStyle = this._sideNavService.initalFormContent!['containerStyle'];
          this._navigation.typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
        }
        else {
          this._navigation[`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue
        }
      });
  }
}