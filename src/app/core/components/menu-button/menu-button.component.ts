import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Navigation } from '../../models/navigation.interface';
import { NgTemplateOutlet } from '@angular/common';
import { Menu, StylePayload } from '../../models/menu.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { NavigationService } from '../../services/navigation.service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { DeepFormConfig } from '../../models/form-input.interface';
import { TypographyStyleService } from '../../services/typography-style.service';
import { ContainerStyleService } from '../../services/container-style.service';
import { SideNavService } from '../../services/side-nav.service';
import { takeUntil } from 'rxjs';


@Component({
  selector: 'app-menu-button',
  imports: [
    MatMenuModule,
    MatButtonModule,
    NgTemplateOutlet,
    MatTooltipModule,
    CustomButtonComponent,
    CdkDrag,
    CdkDropList,
  ],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss'
})
export class MenuButtonComponent {

  constructor(
    private _navigationService: NavigationService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _sideNavService: SideNavService,
  ) { }

  /** The main menu button. */
  @Input() navigation!: Navigation;
  /** Define if icon should be on top or name or on the left. */
  @Input() iconOnTop? = false;
  /** Object which stores navigation hovered status. */
  isButtonHoveredRecord: Record<string, boolean> = {};
  /** Initial window width. */
  initialWindowWidth!: number;

  /**
   * Lifecycle hook called after component ahs been initialized.
   */
  ngOnInit() {
    this.initialWindowWidth = window.innerWidth;
    this.sortNavigationsByOrder();
  }
  
  /**
   * Methods called on 'add navigation' button click.
   * Open form to add navigation.
   * 
   * @param parentId The parent id where to add a navigation.
   */
  addNavigation(parentId: string) {
    this._navigationService.manageNavigation(parentId);
  }

  /**
   * Methods called on 'edit navigation' button click.
   * Open form to edit navigation.
   * 
   * @param event The click event.
   * @param navigation The navigation to edit.
   */
  editNavigation(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();
    this._navigationService.manageNavigation(navigation.parentId, navigation);
  }

  /**
   * Methods called on navigation 'marker' button click.
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
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(navigation.typographyStyle)
    }

    this._sideNavService.openStyleForm(
      navigationStylePayload,
      navigation.id,
      navigation.displayLabel
    );

    this.setSideNavFormListener(navigation);
  }

  /**
   * Methods called on menu 'marker' button click.
   * 
   * Open sidenav with navigation style properties and listen to changes.
   * It also stop the previous listener.
   * 
   * @param menu The menu to edit.
   */
  editMenuStyle(event: MouseEvent, navigation: Navigation) {
    event.stopPropagation();
    this._sideNavService.resetSideNavContent();

    const menuStylePayload: DeepFormConfig<Partial<StylePayload>> = {
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        navigation.menu.containerStyle,
        ['borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius']
      ),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(navigation.menu.typographyStyle)
    };

    this._sideNavService.openStyleForm(
      menuStylePayload,
      navigation.menu.id,
      `${navigation.displayLabel} - Menu`
    );
    
    this.setSideNavFormListener(navigation.menu);
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
   * Setup listener on sidenav to update navigation style in real time.
   * If sidenav is closed without saving then assign back initial style.
   */
  setSideNavFormListener(object: Navigation | Menu) {
      let initialFormContent: Partial<StylePayload> = {};
  
      //navigation case
      if (!object.navigationId) {
        initialFormContent = {
          typographyStyle: JSON.parse(JSON.stringify(object.typographyStyle)),
        }
  
        this._sideNavService.formValueEvent
          .pipe(takeUntil(this._sideNavService.stopSubscriptions))
          .subscribe(formValueEvent => {
            if (formValueEvent.formControlValue === 'close') {
              object.typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
            }
            else {
              object.typographyStyle[`${formValueEvent.formControlName}`] = formValueEvent.formControlValue
            }
          });
      }
      //menu case
      else {
        initialFormContent = {
          containerStyle: JSON.parse(JSON.stringify(object.containerStyle)),
          typographyStyle: JSON.parse(JSON.stringify(object.typographyStyle)),
        }
  
        this._sideNavService.formValueEvent
          .pipe(takeUntil(this._sideNavService.stopSubscriptions))
          .subscribe(formValueEvent => {
            if (formValueEvent.formControlValue === 'close') {
              object.containerStyle = this._sideNavService.initalFormContent!['containerStyle'];
              object.typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
            }
            else {
              object[`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue
            }
          });
      }

      this._sideNavService.initalFormContent = initialFormContent;
    }

}