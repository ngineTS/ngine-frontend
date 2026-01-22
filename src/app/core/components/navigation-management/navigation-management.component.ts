import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Navigation } from '../../models/navigation.interface';
import { NavigationService } from '../../services/navigation.service';
import { NavigationType } from '../../models/navigation-type.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { map, Observable, retry, switchMap, take } from 'rxjs';
import { AppService } from '../../services/app.service';
import { HeaderBarService } from '../../services/header-bar.service';
import { SnackBarService } from '../../services/snackbar.service';
import { CustomButtonType } from '../../models/custom-button.interface';

@Component({
  selector: 'app-navigation-management',
  imports: [
    ReactiveFormsModule, 
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './navigation-management.component.html',
  styleUrl: './navigation-management.component.scss'
})
export class NavigationManagementComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) 
              public data: { 
                navigation: Navigation | undefined, 
                type: 'component' | CustomButtonType,
                parentId: Navigation["parentId"],
              },
              private _formBuilder: FormBuilder,
              private _navigationService: NavigationService,
              private _dialogRef: MatDialogRef<NavigationManagementComponent>,
              private _appService: AppService,
              public _headerBarService: HeaderBarService,
              private _snackbarService: SnackBarService) {}

  navigationForm!: FormGroup;
  navigationTypes: NavigationType[] = [];
  flatNavigations: Navigation[] = [];
  parentNavigations: Navigation[] = [];
  navigationChildrenAndGrandChildren: Navigation[] = [];

  ngOnInit() {
    if (this.data.navigation) {
      this.storeNavigationChildrenAndOldChildrenAsArray(this.data.navigation);
    }
    this.getParentDropdownValues().subscribe(resp => this.parentNavigations = resp);
    this.getNavigationTypeDropdownValues().subscribe(resp => this.navigationTypes = resp);
    this.createForm();
  }

  /**
   * Create Navigation form based on navigation passed in this component.
   * 
   * If navigation is a component then make parent as mandatory and set up initial size.
   */
  createForm() {
    this.navigationForm = this._formBuilder.group({
      parentId: [this.data.navigation?.parentId ?? this.data.parentId, [Validators.required]],
      navigationTypeId: [this.data.navigation?.navigationTypeId ?? null, Validators.required],
      displayLabel: [this.data.navigation?.displayLabel ?? null, [
        Validators.required,
        Validators.maxLength(50)
      ]],
      description: [this.data.navigation?.description ?? null],
      isDisabled: [this.data.navigation?.isDisabled ?? false],
    });
    if (this.data.type === 'component') {
      if (!this.data.navigation?.id) {
        this.navigationForm.addControl('width', this._formBuilder.control(50));
        this.navigationForm.addControl('height', this._formBuilder.control(50));
      }
    }
    if (this.data.type === 'redirect-button' || this.data.type === 'menu-button') {
      this.navigationForm.addControl('icon', this._formBuilder.control(
        this.data.navigation?.icon ?? null
      ));
    }
  }

  /**
   * Define and return Parent dropdown values and store flat navigations.
   * * Parent can't be current navigation.
   * * Parent can't be one of the children or grandchildren of current navigation.
   * * If form type is a component: parent can only be a redirect-button without navigation bar.
   * * If form type is a redirect-button or a menu-button: parent can only be a redirect-button or a menu-button
   * * User requires 'add' permission on navigation.
   * 
   * @returns An observable of assignable parent navigations.
   */
  getParentDropdownValues(): Observable<Navigation[]> {
    return this._navigationService.getFlatNavigations()
      .pipe(
        retry(2),
        take(1),
        map(flatNavigations => {
          this.flatNavigations = flatNavigations;
          return flatNavigations.filter(flatNav => {            
            if (flatNav.id === this.data.navigation?.id) {
              return false;
            }
            if (this.navigationChildrenAndGrandChildren.find(obj => obj.id === flatNav.id)) {
              return false;
            }
            if (this.data.type === 'component') {
              if (flatNav.menu || flatNav.navigationType.name !== 'redirect-button') {
                return false;
              }
            }
            if (this.data.type === 'redirect-button' || this.data.type === 'menu-button') {
              if (flatNav.navigationType.name !== 'menu-button' && flatNav.navigationType.name !== 'redirect-button') {
                return false;
              }
            }
            if (!flatNav.permissionName?.includes('add')) {
              return false;
            }
            return true;
          });
        })
      );
  }

  /**
   * Define and return Navigation Type dropdown values.
   * * If form is a redirect-button: keep only "redirect-button" type. 
   * * If form is a menu-button: keep only "menu-button" type. 
   * * If form is a component: exclude "redirect-button" and "menu-button" types.
   * @returns An observable of assignable navigation types.
   */
  getNavigationTypeDropdownValues(): Observable<NavigationType[]> {
    return this._navigationService.getNavigationTypes()
      .pipe(
        retry(2),
        take(1),
        map(
          navigationTypes => {
            if (this.data.type === 'redirect-button') {
              this.navigationForm.controls['navigationTypeId'].setValue(navigationTypes.find(obj => obj.name === 'redirect-button')?.id);
              return navigationTypes.filter(obj => obj.name === 'redirect-button');
            }
            else if (this.data.type === 'menu-button') {
              this.navigationForm.controls['navigationTypeId'].setValue(navigationTypes.find(obj => obj.name === 'menu-button')?.id);
              return navigationTypes.filter(obj => obj.name === 'menu-button');
            }
            else {
              return navigationTypes.filter(obj => obj.name !== 'redirect-button' && obj.name !== 'menu-button');
            }
          }
        )
      );
  }

  /**
   * Delete navigation, update old big sisters order and refresh routing.
   */
  deleteNavigation() {
    if (confirm("Are you sure to delete this navigation?")) {
      if (this.data.navigation?.id) {
        this._navigationService.deleteNavigationAndChildren(this.data.navigation)
          .pipe(
            take(1),
            switchMap(() => this.updateNavigationBigSistersOrder(this.data.navigation!.parentId, this.data.navigation!.order))
          )
          .subscribe(() => {
            this._snackbarService.showSuccessSnackBar('Element deleted successfully.');
            this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
          });
      }
    }
  }

  /**
   * Save or update navigation and refresh routing.
   * 
   * In case of update, if parentId has changed then update old big sisters order.
   */
  submitForm() {
    //EDIT
    if (this.data.navigation?.id) {
      //Parent has changed
      if (this.data.navigation.parentId !== this.navigationForm.get('parentId')?.value) {
        this.navigationForm.value["order"] = this.flatNavigations.filter(obj => 
          obj.parentId === this.navigationForm.get('parentId')?.value).length;
        this._navigationService.updateNavigation(this.data.navigation.id, this.navigationForm.value)
          .pipe(
            take(1),
            switchMap(() => this.updateNavigationBigSistersOrder(this.data.navigation!.parentId, this.data.navigation!.order))
          )
          .subscribe(() => {
            this._snackbarService.showSuccessSnackBar('Element edited successfully.');
            this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
          });
      }
      //Parent has not changed
      else {
        this._navigationService
          .updateNavigation(this.data.navigation.id, this.navigationForm.value)
          .pipe(
            take(1)
          )
          .subscribe(() => {
            this._snackbarService.showSuccessSnackBar('Element edited successfully.');
            this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
          });
      }
    }
    //ADD
    else {
      this.navigationForm.value["order"] = this.flatNavigations.filter(obj => 
        obj.parentId === this.navigationForm.get('parentId')?.value).length;
      this._navigationService
        .saveNavigation(this.navigationForm.value)
        .pipe(
          take(1)
        )
        .subscribe(() => {
          this._snackbarService.showSuccessSnackBar('Element added successfully.');
          this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
        });
    }
  }

  /**
   * Recursively retrieve parent name until the last parent.
   * @param navigationId The navigation id of the wished navigation name.
   * @returns The navigation parent name with "/" prefix.
   */
  getParentName(navigationId: string): string {
    let name = '/';
    const parent = this.flatNavigations.find(obj => obj.id === navigationId);
    if (parent && parent.name !== 'global') {
      if (parent.navigationType.name === 'redirect-button') {
        name = parent.name;
      }
      if (parent?.parentId) {
        name = this.getParentName(parent.parentId) + '/' + name;
      }
    }
    return name;
  }

  /**
   * Update navigation big sisters order by decreasing it by 1.
   * @param parentId The navigation parentId used to find sisters.
   * @param order The navigation order used to compare with sisters one.
   * @returns An array of navigation ids and orders setup.
   */
  updateNavigationBigSistersOrder(
    parentId: Navigation["parentId"], 
    order: Navigation["order"]
  ): Observable<Partial<Navigation>[]> {
    const navigationOrdersToUpdate: Partial<Navigation>[] = [];
    let bigSisterNavigations = this.flatNavigations.filter(obj => 
      obj.parentId === parentId && obj.order > order
    );
    bigSisterNavigations.forEach(sister => navigationOrdersToUpdate.push({
      id: sister.id,
      order: sister.order - 1
    }));
    return this._navigationService.bulkUpdateNavigations(navigationOrdersToUpdate);
  }

  /**
   * Close popup, refresh routing and redirect to parent navigation.
   * @param parentId The navigation parent id we want to redirect on.
   */
  refreshRoutingAndRedirect(parentId: Navigation["parentId"]) {
    const redirectName = this.getParentName(parentId);
    this._appService.createAppRouting(redirectName);
    this._dialogRef.close();
  }

  /**
   * Store navigation children and grandchildren inside `this.navigationChildrenAndGrandChildren` array.
   * @param navigation The navigation we want to know the children.
   */
  storeNavigationChildrenAndOldChildrenAsArray(navigation: Navigation) {
    if (navigation.children) {
      this.navigationChildrenAndGrandChildren.push(...navigation.children);
      for (const child of navigation.children) {
        this.storeNavigationChildrenAndOldChildrenAsArray(child);
      }
    }
  }

  /**
   * Getter used in icon dropdown to display icon as selected value.
   */
  get iconFormControl() {
    return this.navigationForm.get('icon')!;
  }

  /**
   * Clear icon selection
   */
  clearIcon(event: Event) {
    event.stopPropagation();
    this.iconFormControl?.setValue(null);
  }
}
