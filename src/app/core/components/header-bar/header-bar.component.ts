import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
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


interface NavigationMeasure {
  navId: string;
  xPos: number;
  width: number;
}

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
  /** Refining position timeout */
  refiningPositionTimeout: ReturnType<typeof setTimeout> | undefined;
  /** HTML navigation elements as array. */
  @ViewChildren('navigationElement') navigationHTMLElements!: QueryList<ElementRef<HTMLDivElement>>;
  /** HTML drop zone */
  @ViewChild('dropZone') dropZone: ElementRef<HTMLDivElement> | undefined;
  
  /**
   * Get window and navigation bar width each time it changes (zoom, screen resize...).
   * 
   * If large screen (navigation bar mode) refine navigation positions.
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    this.dropZoneWidth = this.dropZone?.nativeElement.offsetWidth;

    if (this.windowWidth > this.windowWidthLimit) {
      clearTimeout(this.refiningPositionTimeout);
      this.refiningPositionTimeout = setTimeout(() => {
        this.refineNavigationPosition();
        this.isRefiningPosition = false;
      }, 200);
    }
  }

  /**
   * Lifecycle hook called after the component has been initialized.
   * - get data from snapshot
   * - assign initial window size
   * - sort navigation by xPos if we are on phone screen
   */
  ngOnInit() {
    this.navigation = this._route.snapshot.data["navigation"];
    this.windowWidth = window.innerWidth;
    this.navigation.children?.sort((a, b) => a.containerLayout.xPos! - b.containerLayout.xPos!);
  }

  /**
   * Lifecycle hook called after the component view has been initialized.
   * 
   * Refine navigation positions.
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.dropZoneWidth = this.dropZone?.nativeElement.offsetWidth;
      if (this.dropZoneWidth) {
        this.refineNavigationPosition();
        this.isRefiningPosition = false;
      }
    }, 50);
  }

  /**
   * Computes navigation bar width based on screen size and side nav status.
   */
  get containerWidth(): string {
    if (this._sideNavService.initalFormContent) {
      return '100vw';
    }

    return 'none';
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
        ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'xPos', 'yPos', 'width']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        this.navigation.menu.containerStyle,
        ['backgroundImage']
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
        ['width', 'height', 'yPos', 'zIndex', 'marginTop', 'marginBottom', 'marginRight', 'marginLeft']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        navigation.containerStyle,
        ['backgroundImage']
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
   * Get dragged navigation position, convert it to percentage of screen size and save it.
   * 
   * @param event The cdkDragEnd event.
   * @param navigation The navigation dragged.
   */
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    this.isDragging = false;

    const positon = event.source.getFreeDragPosition();
    const navigationPosition = {
      xPos: Math.round(positon.x / this.dropZoneWidth! * 10000) / 100,
      yPos: 0,
    }

    this._containerLayoutService.updateContainerLayout(navigation.containerLayout.id, navigationPosition)
      .pipe(take(1))
      .subscribe(() => {
        navigation.containerLayout.xPos = navigationPosition.xPos;
        navigation.containerLayout.yPos = navigationPosition.yPos;
      });
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
   * Refine navigation positions to prevent overlapping.
   * 
   * Process:
   * 1. Get navigations measures.
   * 2. Adjust navigation positions compared to left items.
   * 3. Adjust navigation positions compared to right items.
   */
  refineNavigationPosition() {
    const navigations = this.navigation.children;

    if (navigations && navigations?.length > 0) {
      const navigationMeasures: Array<NavigationMeasure> = [];

      this.navigationHTMLElements.forEach((navElt, index) => {
        const navigation = navigations[index];
        const navId = navigation.id;
        const xPos = Number(navigation.containerLayout.xPos!);
        const width = Math.round(navElt.nativeElement.offsetWidth / this.dropZoneWidth! * 10000) / 100;
        navigationMeasures.push({ navId, xPos, width });
      });

      this.adjustPosition(navigationMeasures, navigations, 'left');
      navigationMeasures.sort((a, b) => b.xPos - a.xPos);
      this.adjustPosition(navigationMeasures, navigations, 'right');
    }
  }


  /**
   * Prevent overlapping of navigations.
   * 
   * @param navigationMeasures The navigations width and xPos.
   * @param navigations The navigations.
   * @param side The side to adjust.
   */
  adjustPosition(
    navigationMeasures: Array<NavigationMeasure>,
    navigations: Array<Navigation>,
    side: 'left' | 'right'
  ) {
    for (const a of navigationMeasures) {
      for (const b of navigationMeasures) {
        if (side === 'left') {
          if (a.xPos > b.xPos && (b.xPos + b.width > a.xPos)) {
            a.xPos = b.xPos + b.width + 1;
            break;
          }
        }
        else {
          if (b.xPos > a.xPos && (a.xPos + a.width > b.xPos)) {
            a.xPos = b.xPos - a.width - 1;
            break;
          }
        }
      }

      if (a.xPos + a.width > 98) {
        a.xPos = 98 - a.width;
      }

      navigations.find(nav => nav.id === a.navId)!.containerLayout.xPos = a.xPos;
    }
  }

  /** 
   * Method called on logo click.
   * 
   * Navigate to rool url.
   */
  navigateToRootUrl() {
    this._router.navigateByUrl('');
  }

}