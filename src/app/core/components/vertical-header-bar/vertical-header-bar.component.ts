import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { NavigationService } from '../../services/navigation.service';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { ContainerStyleService } from '../../services/container-style.service';
import { TypographyStyleService } from '../../services/typography-style.service';
import { SideNavService } from '../../services/side-nav.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntil } from 'rxjs';
import { DeepFormConfig } from '../../models/form-input.interface';
import { StylePayload } from '../../models/menu.interface';
import { MatDialog } from '@angular/material/dialog';
import { EmptyDialogComponent } from '../empty-dialog/empty-dialog.component';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-vertical-header-bar',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatTooltipModule,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './vertical-header-bar.component.html',
  styleUrl: './vertical-header-bar.component.scss',
})
export class VerticalHeaderBarComponent implements OnInit {

  constructor(
    public _router: Router,
    private _route: ActivatedRoute,
    private _navigationService: NavigationService,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _sideNavService: SideNavService,
    private _matDialog: MatDialog
  ) { }

  /** The navigations container. */
  navigation!: Navigation;
  /** The window width. */
  windowWidth!: number;
  /** Responsive threshold. */
  windowWidthLimit = 750;
  /** Tracks which navigation items are expanded in the tree. */
  expandedNodes: Set<string> = new Set();
  /** Reference to the navigation sidebar element */
  @ViewChild('navigationSidebar') navigationSidebar!: ElementRef<HTMLDivElement>;

  /**
   * Get window size each time it changes (zoom, screen resize...).
   */
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
  }

  /**
   * Lifecycle hook called after the component has been initialized.
   */
  ngOnInit() {
    this.navigation = this._route.snapshot.data["navigation"];
    this.windowWidth = window.innerWidth;
    this._navigationService.sortNavigationsByOrder(this.navigation);
  }

  /**
   * Toggle the expanded state of a navigation node in the tree.
   * 
   * @param navigationId The id of the navigation to toggle.
   */
  toggleNodeExpanded(navigationId: string): void {
    if (this.expandedNodes.has(navigationId)) {
      this.expandedNodes.delete(navigationId);
    } else {
      this.expandedNodes.add(navigationId);
    }
  }

  /**
   * Check if a navigation node is expanded.
   * 
   * @param navigationId The id of the navigation to check.
   * @returns True if the node is expanded, false otherwise.
   */
  isNodeExpanded(navigationId: string): boolean {
    return this.expandedNodes.has(navigationId);
  }

  /**
   * Check if a node is extandable.
   * 
   * It must have:
   * - no menu attached to it
   * - at least one child which is not a component
   * 
   * @param navigation The navigation to check.
   * @returns True if the navigation is extandable, false otherwise.
   */
  isExtandable(navigation: Navigation): boolean | undefined {
    if(navigation.menu) {
      return false;
    }

    const child = navigation.children?.find(child => 
      child.navigationType.name === 'redirect-button' ||
      child.navigationType.name === 'dialog-button' ||
      child.navigationType.name === 'external-link-button'
    )

    if (child) {
      return true;
    }

    return false;
  }

  /**
   * Methods called on '+' or 'gear' button click.
   * Open navigation management form to add or edit navigation properties.
   * 
   * @param navigation The navigation to edit (optional).
   */
  manageNavigation(event: MouseEvent, navigation?: Navigation): void {
    event.stopPropagation();
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
        ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']
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
  editNavigationStyle(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();
    this._sideNavService.resetSideNavContent();

    const navigationStylePayload: DeepFormConfig<Partial<StylePayload>> = {
      containerLayout: this._containerLayoutService.setUpContainerLayoutForm(
        navigation.containerLayout,
        ['marginTop', 'marginBottom']
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
   * Navigate to root url.
   */
  navigateToRootUrl() {
    this._router.navigateByUrl('');
  }

  /**
   * Navigate to given path.
   * 
   * @param navigation The navigationo clicked.
   * @param parentPath The accumulated route url.
   */
  navigateTo(navigation: Navigation, parentPath: string[] = []): void {
    const fullPath = [...parentPath, navigation.name];
    console.log('Navigation path:', fullPath);
    this._router.navigate(fullPath, { relativeTo: this._route });
  }

  /**
   * Trigger an action on button click depending of the navigation type.
   * 
   * @param navigation The navigation.
   */
  actionClick(navigation: Navigation, parentPath?: Array<string>) {
    if (!navigation.isDisabled) {
      switch (navigation.navigationType.name) {
        /* redirect to navigation url */
        case 'redirect-button':
          this.navigateTo(navigation, parentPath);
          break;
        /* open mat dialog */
        case 'dialog-button':
          this._matDialog.open(EmptyDialogComponent, {
            data: { navigation: navigation },
            width: '90%',
          });
          break;
        /* open url on new tab */
        case 'external-link-button':
          window.open(navigation.url, '_blank', 'noopener,noreferrer');
          break;
      }
    }
  }

  /**
   * Check if user is in this navigation or not (used in case button is in navigation bar).
   * 
   * @param navigationName The navigation name to check.
   * @returns true or false.
   */
  isRouteActive(navigationName: string) {
    const urlList = this._router.url.split('/');
    return urlList.includes(navigationName);
  }

  /**
   * Recursively sort navigations by order.
   */
  sortNavigationsByOrder() {
    this.navigation.children?.sort((a, b) => a.order - b.order);
    this.navigation.children?.forEach(child => 
      child.children?.sort((a, b) => a.order - b.order)
    );
  }

  /**
   * Drop a navigation and update position of all navigations.
   * 
   * @param event The CdkDragDrop event containing navigation positions.
   */
  drop(event: CdkDragDrop<Navigation[]>, navigation: Navigation): void {
    const navigationOrders: Partial<Navigation>[] = [];
    moveItemInArray(navigation.children!, event.previousIndex, event.currentIndex)
    navigation.children!.forEach((nav, index) => { 
      navigationOrders.push({ id: nav.id, order: index });
      nav.order = index;
    });
    this._navigationService.bulkUpdateNavigations(navigationOrders).subscribe(() => {});
  }

  

}
