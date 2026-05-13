import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { StylePayload } from '../../models/menu.interface';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { MatMenuModule } from '@angular/material/menu';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take, takeUntil } from 'rxjs';
import { TypographyStyleService } from '../../services/typography-style.service';
import { DeepFormConfig } from '../../models/form-input.interface';
import { ContainerStyleService } from '../../services/container-style.service';
import { SideNavService } from '../../services/side-nav.service';
import { ContainerLayout } from '../../models/container-layout.interface';


@Component({
  selector: 'app-header-bar',
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule, 
    MatTooltipModule,
    CdkDrag,
    MenuButtonComponent,
    CustomButtonComponent,
    MatMenuModule,
  ],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent implements OnInit {
  
  constructor(
    public _router: Router,
    private _route: ActivatedRoute,
    private _navigationService: NavigationService,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _sideNavService: SideNavService,
  ) { }

  /** The navigations container. */
  navigation!: Navigation;
  /** The window width. */
  windowWidth!: number;
  /** Responsive threasold. */
  windowWidthLimit = 1000;
  /** Navigation bar width in pixel */
  dropZoneWidth: number | undefined;
  /** Boolean to inform if one of the items of navigation bar is being dragged. */
  isDragging = false;
  /** Boolean to hide navigation bar during position refining. */
  isRefiningPosition = true;
  /** Boolean to hide navigation bar when user click on 'Hide menu'.*/
  isNavigationBarHidden = false;
  /** HTML drop zone */
  @ViewChild('dropZone') dropZone: ElementRef<HTMLDivElement> | undefined;
  
  /**
   * Get window and navigation bar width each time it changes (zoom, screen resize...).
   * 
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.dropZoneWidth = this.dropZone?.nativeElement.offsetWidth;
  }

  /**
   * Lifecycle hook called after the component has been initialized.
   * - get data from snapshot
   * - assign initial window size
   * - sort navigation by xPos for phone screen (right elements have negative xPos and
   * left elements positive xPos so calculation is applied to get the right order)
   */
  ngOnInit() {
    this.navigation = this._route.snapshot.data["navigation"];
    this.windowWidth = window.innerWidth;
    this.navigation.children?.sort((a, b) => {
      const aPos = Number(a.containerLayout.xPos) >= 0;
      const bPos = Number(b.containerLayout.xPos) >= 0;

      if (aPos && bPos) return Number(a.containerLayout.xPos) - Number(b.containerLayout.xPos); // both positive → ASC
      if (aPos && !bPos) return -1; // positive before negative
      if (!aPos && bPos) return 1; // negative after positive
      return Number(a.containerLayout.xPos) - Number(b.containerLayout.xPos);  
    });
  }

  /**
   * Lifecycle hook called after the component view has been initialized.
   * 
   * Get drop zone width used to compute navigation positions.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.dropZoneWidth = this.dropZone?.nativeElement.offsetWidth;
        this.isRefiningPosition = false;
    }, 50);
  }

  /**
   * Computes navigation bar width based on screen size and side nav status.
   */
  get containerWidth(): string {
    if (this._sideNavService.initalFormContent) {
      return '100vw';
    }

    return 'unset';
  }

  /**
   * Methods called on '+' or 'gear' button click.
   * Open navigation management form to add or edit navigation properties.
   * 
   * @param navigation The navigation to edit (optional).
   */
  manageNavigation(navigation?: Navigation): void {
    this._navigationService.manageNavigation(this.navigation.id, navigation);
  }

  /**
   * Methods called on 'edit menu style' button click.
   * 
   * Open sidenav with menu style properties and listen to changes.
   * It also stop the previous listener.
   */
  editMenuStyle() {
    this._sideNavService.resetSideNavContent();

    const menuStyleFormConfig: DeepFormConfig<Partial<StylePayload>> = {
      containerLayout: this._containerLayoutService.setUpContainerLayoutForm(
        this.navigation.menu.containerLayout,
        ['height', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        this.navigation.menu.containerStyle,
        [
         'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
         'borderColor', 'borderStyle', 'borderWidth', 'isBorderBottomHidden', 'isBorderLeftHidden',
         'isBorderRightHidden', 'isBorderTopHidden', 'backgroundColor', 'isBackgroundTransparent'
        ]
      ),
    }

    this._sideNavService.openStyleForm(
      menuStyleFormConfig,
      this.navigation.menu.id,
      `${this.navigation.displayLabel} - Menu`
    );

    this.setSideNavFormListener();
  }

  /**
   * Method called on navigation 'marker' button click. 
   * 
   * Open sidenav with navigation style properties and listen to changes.
   * It also stop the previous listener.
   * 
   * @param navigation The navigation to edit.
   */
  editNavigationStyle(navigation: Navigation) {
    this._sideNavService.resetSideNavContent();

    const navigationStylePayload: DeepFormConfig<Partial<StylePayload>> = {
      containerLayout: this._containerLayoutService.setUpContainerLayoutForm(
        navigation.containerLayout,
        ['xPos', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        navigation.containerStyle,
        [
         'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
         'borderColor', 'borderStyle', 'borderWidth', 'isBorderBottomHidden', 'isBorderLeftHidden',
         'isBorderRightHidden', 'isBorderTopHidden', 'backgroundColor', 'isBackgroundTransparent'
        ]
      ),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(
        navigation.typographyStyle
      ),
    }
    
    this._sideNavService.openStyleForm(
      navigationStylePayload,
      navigation.id,
      navigation.displayLabel
    );
    
    this.setSideNavFormListener(navigation);
  }

  /**
   * Methods called when an item is being dragged.
   * Set `isDragging` to true.
   */
  onDragStart() {
    this.isDragging = true;
  }

  /**
   * Method called when drag ends.
   * 
   * Get dragged navigation position and save it.
   * 
   * @param event The cdkDragEnd event.
   * @param navigation The navigation dragged.
   */
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    this.isDragging = false;

    const positon = event.source.getFreeDragPosition();
    let newPos = Number(navigation.containerLayout.xPos) + positon.x;
    if (this.dropZoneWidth && (newPos > (0.7 * this.dropZoneWidth))) {
      newPos = newPos - this.dropZoneWidth;
    }
    const navigationPosition = { xPos: newPos }

    this._containerLayoutService.updateContainerLayout(navigation.containerLayout.id, navigationPosition)
      .pipe(take(1))
      .subscribe(() => {});
  }

   /**
   * Setup listener on sidenav to update navigation style in real time.
   * If sidenav is closed without saving then assign back initial style.
   */
   setSideNavFormListener(navigation?: Navigation) {
    let initialFormContent: Partial<StylePayload> = {};

    //navigation case
    if (navigation) {
      initialFormContent = {
        containerStyle: JSON.parse(JSON.stringify(navigation.containerStyle)),
        typographyStyle: JSON.parse(JSON.stringify(navigation.typographyStyle)),
        
      }

      this._sideNavService.formValueEvent
        .pipe(takeUntil(this._sideNavService.stopSubscriptions))
        .subscribe(formValueEvent => {
          if (formValueEvent.formControlValue === 'close') {
            this.navigation.children!.find(child => child.id === navigation.id)!
              .containerStyle = this._sideNavService.initalFormContent!['containerStyle'];
             this.navigation.children!.find(child => child.id === navigation.id)!
              .typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
          }
          else {
            this.navigation.children!.find(child => child.id === navigation.id)!
              [`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue;

          }
        });
    }
    //menu case
    else {
      initialFormContent = {
        containerLayout: JSON.parse(JSON.stringify(this.navigation.menu.containerLayout)),
        containerStyle: JSON.parse(JSON.stringify(this.navigation.menu.containerStyle)),
      }

      this._sideNavService.formValueEvent
        .pipe(takeUntil(this._sideNavService.stopSubscriptions))
        .subscribe(formValueEvent => {
          if (formValueEvent.formControlValue === 'close') {
            this.navigation.menu.containerLayout = this._sideNavService.initalFormContent!['containerLayout'];
            this.navigation.menu.containerStyle = this._sideNavService.initalFormContent!['containerStyle'];
          }
          else {
            this.navigation.menu[`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue
          }
        });
    }

    this._sideNavService.initalFormContent = initialFormContent;
  }

  /** 
   * Method called on logo click.
   * 
   * Navigate to rool url.
   */
  navigateToRootUrl() {
    this._router.navigateByUrl('');
  }

  /**
   * Get navigation position.
   * 
   * @param containerLayout The navigation container layout.
   * @returns The x position.
   */
  getNavigationPosition(containerLayout: ContainerLayout) {
    const xPos = Number(containerLayout.xPos);

    if (xPos >= 0) {
      return xPos;
    }
    else {
      return this.dropZoneWidth! + xPos;
    }
  }

}