import { Component, ComponentRef, inject, Inject, Injector, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationManagementComponent } from '../navigation-management/navigation-management.component';
import { Navigation } from '../../models/navigation.interface';
import { NavigationBaseComponent } from '../navigation-base/navigation-base.component';
import { ComponentsContainerService } from '../../services/components-container.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppService } from '../../services/app.service';
import { MenuService } from '../../services/menu.service';
import { Router } from '@angular/router';
import { GenericFormComponent } from '../generic-form/generic-form.component';
import { StylePayload } from '../../models/menu.interface';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-empty-dialog',
  imports: [MatButtonModule, MatTooltipModule],
  templateUrl: './empty-dialog.component.html',
  styleUrl: './empty-dialog.component.scss'
})
export class EmptyDialogComponent {

  constructor(
    private _dialogRef: MatDialogRef<EmptyDialogComponent>,
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: { navigation: Navigation },
    private _componentsContainerService: ComponentsContainerService,
    private _appService: AppService,
    private _menuService: MenuService,
    private _router: Router,
    private _navigationService: NavigationService
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
   * Destroy containerRef
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
    const component = await this._componentsContainerService
      .componentStore[navigation.navigationType.name]().then(m => 
        m[this._componentsContainerService.kebabCasetoPascaleCase(navigation.navigationType.name) + 'Component']
      );
    this.containerRef = this.container.createComponent(component, {
        injector: this.injector,
    });
    this.containerRef.setInput('_navigation', navigation);
    this.containerRef.setInput('_canAdd', navigation.permissionName?.includes('add'));
    this.containerRef.setInput('_canEdit', navigation.permissionName?.includes('add'));
    this.containerRef.setInput('_canDelete', navigation.permissionName?.includes('add'));
    this.containerRef.setInput('_width', 0);
    this.containerRef.setInput('_height', 0);
    this.containerRef.setInput('_isEditing', this._isEditing);
    this.containerRef.instance._stopEditing.subscribe(resp => {
      this._isEditing = !resp;
      this.containerRef.setInput('_isEditing', this._isEditing);
    })
  }

  /**
   * Open navigation managenement form to add or edit navigation.
   * If navigation is passed then edit navigation else add navigation.
   * 
   * @param navigation The navigation to edit.
   */
  manageNavigation(navigation?: Navigation) {
    this._dialogRef.close();
    this._navigationService.manageNavigation(this.data.navigation.id, navigation);
  }

  /**
   * Methods triggered on top right 'marker' button click.
   * Open generic form to edit navigation style.
   */
  manageNavigationStyle(navigation: Navigation) {
    this._dialogRef.close();
    const navigationStyleForm = this._menuService.setupStyleForm({
      containerLayout: navigation.containerLayout,
      containerStyle: navigation.containerStyle,
      typographyStyle: navigation.typographyStyle
    });

    const matDialogRef = this._matDialog.open(
      GenericFormComponent<StylePayload>,
      { 
        maxWidth: '700px',
        data: {
          hasDeleteButton: false,
          formConfig: navigationStyleForm,
          id: navigation.id,
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
   * Methods called on 'edit' or 'x' button click. Switch edit mode.
   */
  switchEditMode() {
    this._isEditing = !this._isEditing;
    this.containerRef.setInput('_isEditing', this._isEditing);
  }
}
