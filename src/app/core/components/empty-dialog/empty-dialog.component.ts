import { Component, ComponentRef, inject, Inject, Injector, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Navigation } from '../../models/navigation.interface';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StylePayload } from '../../models/menu.interface';
import { NavigationService } from '../../services/navigation.service';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { ContainerStyleService } from '../../services/container-style.service';
import { TypographyStyleService } from '../../services/typography-style.service';
import { DeepFormConfig } from '../../models/form-input.interface';
import { SideNavService } from '../../services/side-nav.service';
import { takeUntil } from 'rxjs';
import { ComponentService } from '../../../components/component.service';

@Component({
  selector: 'app-empty-dialog',
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './empty-dialog.component.html',
  styleUrl: './empty-dialog.component.scss'
})
export class EmptyDialogComponent {

  constructor(
    private _dialogRef: MatDialogRef<EmptyDialogComponent>,
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { navigation: Navigation },
    private _componentService: ComponentService,
    private _navigationService: NavigationService,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
    private _sideNavService: SideNavService
  ) {}

  injector = inject(Injector);
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  containerRef!: ComponentRef<NavigationBaseComponent>;
  navigationToLoad: Navigation | undefined;
  _isEditing = false;

  /**
   * Lifecycle hook called after component has been initialized.
   * Check if navigation exists for template condition.
   */
  ngOnInit() {
    if (this.data.navigation.children && this.data.navigation.children.length > 0) {
      this.navigationToLoad = this.data.navigation.children[0];
    }
    else {
      this.navigationToLoad = undefined;
    }
  }

  /**
   * Lifecycle hook called after component view has been initialized.
   * Check if navigation exists. If yes load component, else display no component template.
   */
  ngAfterViewInit() {
    if (this.navigationToLoad) this.loadComponent(this.navigationToLoad);
  }

  /**
   * Lifecycle hook called when component is destroyed.
   * Destroy containerRef.
   */
  ngOnDestroy() {
    this.containerRef?.destroy();
  }

  /**
   * Load component on the fly.
   * 
   * @param navigation The navigation with type used to lookup component library.
   * @description
   * Find component from component library by navigation type.
   */
  async loadComponent(navigation: Navigation) {
    const navigationTypeName = navigation.navigationType.name;

    const componentImportRef = this._componentService.componentStore[navigationTypeName];
    if (!componentImportRef) {
      return;
    }

    const component = await componentImportRef().then(m => 
      m[this._componentService.kebabCasetoPascaleCase(navigationTypeName) + 'Component']
    );

    this.containerRef = this.container.createComponent(component, {
        injector: this.injector,
    });

    this.containerRef.setInput('_navigation', navigation);
    this.containerRef.setInput('_canAdd', navigation.permissionName?.includes('add'));
    this.containerRef.setInput('_canEdit', navigation.permissionName?.includes('edit'));
    this.containerRef.setInput('_canDelete', navigation.permissionName?.includes('delete'));
    this.containerRef.setInput('_isEditing', this._isEditing);
    this.containerRef.instance._stopEditing.subscribe(resp => {
      this._isEditing = !resp;
      this.containerRef.setInput('_isEditing', this._isEditing);
    })
  }

  /**
   * Methods called on top right 'gear' button click.
   * Open navigation managenement form to add or edit navigation.
   * 
   * @param navigation The navigation to edit.
   */
  manageNavigation(navigation?: Navigation) {
    this._navigationService.manageNavigation(this.data.navigation.id, navigation);
    this._dialogRef.close();
  }

  /**
   * Methods called on top right 'marker' button click.
   * Open generic form to edit navigation style.
   */
  editNavigationStyle(navigation: Navigation) {
    this._sideNavService.resetSideNavContent();

    const navigationStylePayload: DeepFormConfig<StylePayload> = {
      containerLayout: this._containerLayoutService.setUpContainerLayoutForm(
        navigation.containerLayout,
        ['height', 'width', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'xPos', 'yPos', 'zIndex']
      ),
      containerStyle: this._containerStyleService.setUpContainerStyleForm(
        navigation.containerStyle,
        [
         'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
         'borderColor', 'borderStyle', 'borderWidth', 'isBorderBottomHidden', 'isBorderLeftHidden',
         'isBorderRightHidden', 'isBorderTopHidden'
        ]
      ),
      typographyStyle: this._typographyStyleService.setUpTypographyStyleForm(navigation.typographyStyle)
    };
    
    this._sideNavService.openStyleForm(
      navigationStylePayload,
      navigation.id,
      navigation.displayLabel
    );

    this._dialogRef.close();
    this._matDialog.open(EmptyDialogComponent, {
      data: { navigation: this.data.navigation },
      hasBackdrop: false
    });

    this.setSideNavFormListener(navigation);
  }

  /**
   * Methods called on 'edit' or 'x' button click. Switch edit mode.
   */
  switchEditMode() {
    this._isEditing = !this._isEditing;
    this.containerRef.setInput('_isEditing', this._isEditing);
  }

  /**
   * Setup listener on sidenav to update navigation style in real time.
   * If sidenav is closed without saving then assign back initial style.
   */
  setSideNavFormListener(navigation: Navigation) {
    const initialFormContent: StylePayload = {
      containerLayout: JSON.parse(JSON.stringify(navigation.containerLayout)),
      containerStyle: JSON.parse(JSON.stringify(navigation.containerStyle)),
      typographyStyle: JSON.parse(JSON.stringify(navigation.typographyStyle)),
    }

    this._sideNavService.initalFormContent = initialFormContent;

    this._sideNavService.formValueEvent
      .pipe(takeUntil(this._sideNavService.stopSubscriptions))
      .subscribe(formValueEvent => {
        if (formValueEvent.formControlValue === 'close') {
          navigation.containerLayout = this._sideNavService.initalFormContent!['containerLayout'];
          navigation.containerStyle = this._sideNavService.initalFormContent!['containerStyle'];
          navigation.typographyStyle = this._sideNavService.initalFormContent!['typographyStyle'];
        }
        else {
          navigation[`${formValueEvent.formGroupName}`][`${formValueEvent.formControlName}`] = formValueEvent.formControlValue
        }
      });
    }
}
