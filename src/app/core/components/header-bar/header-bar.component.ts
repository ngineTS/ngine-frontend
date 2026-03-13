import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { Navigation } from '../../models/navigation.interface';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { NavigationService } from '../../services/navigation.service';
import { StylePayload } from '../../models/menu.interface';
import { MenuService } from '../../services/menu.service';
import { MenuButtonComponent } from '../menu-button/menu-button.component';
import { MatMenuModule } from '@angular/material/menu';
import { CustomButtonComponent } from '../custom-button/custom-button.component';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { take, takeUntil } from 'rxjs';
import { TypographyStyleService } from '../../services/typography-style.service';
import { DeepFormConfig } from '../../models/form-input.interface';
import { ContainerStyleService } from '../../services/container-style.service';
import { SideNavService } from '../../services/side-nav.service';


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
    private _menuService: MenuService,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    public _sideNavService: SideNavService,
  ) { }

  /** The navigations container. */
  navigation!: Navigation;
  /** Boolean to inform if one of the items of navigation bar is being dragged. */
  isDragging = false;
  /** The initial window width. */
  initialWindowWidth!: number;

  /**
   * Lifecycle hook called after the component has been initialized.
   * - get data from snapshot
   * - assign initial window size
   * - sort navigation by xPos if we are on phone screen
   */
  ngOnInit() {
    this.navigation = this._route.snapshot.data["navigation"];
    this.initialWindowWidth = window.innerWidth;

    if (this.initialWindowWidth < 600) {
      this.navigation.children?.sort((a, b) => a.containerLayout.xPos! - b.containerLayout.xPos!);
    }
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
   * Methods called on 'edit menu' button click.
   * Open menu form to edit navigation bar configuration.
   */
  editMenuStyle() {   
    this._sideNavService.resetSideNavContent();

    const menuStyleFormConfig: DeepFormConfig<Partial<StylePayload>> = {
      containerLayout: this._containerLayoutService.setUpContainerLayoutForm(
        this.navigation.menu.containerLayout, 
        ['paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'xPos', 'yPos']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        this.navigation.menu.containerStyle
      ),
    }

    this._menuService.manageStyle(
      menuStyleFormConfig,
      this.navigation.menu.id,
      `${this.navigation.displayLabel} - Menu`
    );

    this.setSideNavFormListener();
  }

  /**
   * Edit navigation style. 
   * 
   * @param navigation The navigation to edit.
   */
  editNavigationStyle(navigation: Navigation) {
    this._sideNavService.resetSideNavContent();

    const navigationStylePayload: DeepFormConfig<Partial<StylePayload>> = {
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(
        navigation.typographyStyle
      )
    }
    
    this._menuService.manageStyle(
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
   * Method called when drag end.
   * Get element position from cdkDragEnd event, convert it to percentage of screen size and save it.
   * It also set `isDragging` to false;
   * 
   * @param event The cdkDragEnd event.
   * @param navigation The navigation dragged.
   */
  onDragEnded(event: CdkDragEnd, navigation: Navigation) {
    this.isDragging = false;

    const positon = event.source.getFreeDragPosition();
    const navigationPosition = {
      xPos: Math.round(positon.x / window.innerWidth * 100),
      yPos: 0,
    }

    this._containerLayoutService.updateContainerLayout(navigation.containerLayout.id, navigationPosition)
      .pipe(take(1))
      .subscribe(() => {
        navigation.containerLayout.xPos = navigationPosition.xPos;
        navigation.containerLayout.yPos = navigationPosition.yPos;
      });
  }

   setSideNavFormListener(navigation?: Navigation) {
    let initialFormContent: Partial<StylePayload> = {};

    //navigation case
    if (navigation) {
      initialFormContent = {
        typographyStyle: JSON.parse(JSON.stringify(navigation.typographyStyle)),
      }

      this._sideNavService.formValueEvent
        .pipe(takeUntil(this._sideNavService.stopSubscriptions))
        .subscribe(formValueEvent => {
          if (formValueEvent.formControlValue === 'close') {
            this.navigation.children!.find(child => child.id === navigation.id)!
              .typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
          }
          else {
            this.navigation.children!.find(child => child.id === navigation.id)!
              .typographyStyle[`${formValueEvent.formControlName}`] = formValueEvent.formControlValue
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

}
