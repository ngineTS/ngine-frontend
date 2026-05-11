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

@Component({
  selector: 'app-vertical-header-bar',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatTooltipModule,
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
  ) { }

  /** The navigations container. */
  navigation!: Navigation;
  /** The window width. */
  windowWidth!: number;
  /** Responsive threshold. */
  windowWidthLimit = 1000;
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
   * Check if a navigation has children.
   * 
   * @param navigation The navigation to check.
   * @returns True if the navigation has children, false otherwise.
   */
  hasChildren(navigation: Navigation): boolean | undefined {
    return navigation.children && navigation.children.length > 0;
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
        ['width', 'height', 'marginTop', 'marginBottom', 'marginRight', 'marginLeft']
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
   * Setup listener on sidenav to update navigation style in real time.
   * If sidenav is closed without saving then assign back initial style.
   */
  setSideNavFormListener(navigation: Navigation) {
    const initialFormContent: Partial<StylePayload> = {
      containerStyle: JSON.parse(JSON.stringify(navigation.containerStyle)),
      typographyStyle: JSON.parse(JSON.stringify(navigation.typographyStyle)),
    }

    this._sideNavService.formValueEvent
      .pipe(takeUntil(this._sideNavService.stopSubscriptions))
      .subscribe(formValueEvent => {
        if (formValueEvent.formControlValue === 'close') {
          navigation.containerStyle = this._sideNavService.initalFormContent!['containerStyle'];
          navigation.typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
        }
        else {
          navigation[`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue;
        }
      });

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

  navigateTo(navigation: Navigation, parentPath: string[] = []): void {
    if (!navigation.isDisabled) {
      const fullPath = [...parentPath, navigation.name];
      console.log('Navigation path:', fullPath);
      this._router.navigate(fullPath, { relativeTo: this._route });
    }
  }

}
