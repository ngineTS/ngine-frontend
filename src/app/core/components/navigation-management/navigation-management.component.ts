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
                type: 'header' | 'component',
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
    this.getParentMenuValues().subscribe(resp => this.parentNavigations = resp);
    this.getNavigationTypeMenuValues().subscribe(resp => this.navigationTypes = resp);
    this.createForm();
  }

  /**
   * Create Navigation form based on navigation passed in this component.
   * 
   * If navigation is a header then add color form control.
   * 
   * If navigation is a component then make parent as mandatory and set up initial size.
   */
  createForm() {
    this.navigationForm = this._formBuilder.group({
      parentId: [this.data.navigation?.parentId ?? this.data.parentId],
      navigationTypeId: [this.data.navigation?.navigationTypeId ?? null, Validators.required],
      displayLabel: [this.data.navigation?.displayLabel ?? null, Validators.required],
      description: [this.data.navigation?.description ?? null],
      isDisabled: [this.data.navigation?.isDisabled ?? false],
    });
    if (this.data.type === 'component') {
      this.navigationForm.get('parentId')?.addValidators([Validators.required]);
      if (!this.data.navigation?.id) {     
        this.navigationForm.addControl('width', this._formBuilder.control(50));
        this.navigationForm.addControl('height', this._formBuilder.control(50));
      }
    }
    if (this.data.type === 'header') {
      this.navigationForm.addControl('icon', this._formBuilder.control(
        this.data.navigation?.icon ?? null
      ));
    }
  }

  /**
   * Define and return Parent menu values and store flat navigations.
   * 
   * Rules:
   * * Parent can only be header.
   * * Parent can't be current navigation.
   * * Parent can't be one of the children or grandchildren of current navigation.
   * * If form is a header: parent can't have component children.
   * * If form is a component: parent can't have header children.
   * 
   * @returns An observable of assignable parent navigations.
   */
  getParentMenuValues(): Observable<Navigation[]> {
    return this._navigationService.getFlatNavigations()
      .pipe(
        retry(2),
        take(1),
        map(flatNavigations => {
          this.flatNavigations = flatNavigations;
          return flatNavigations.filter(flatNav => {
            if (flatNav.name === this.data.navigation?.name) {
              return false;
            }
            if (flatNav.navigationType.name !== 'header') {
              return false;
            }
            if (this.navigationChildrenAndGrandChildren.find(obj => obj.id === flatNav.id)) {
              return false;
            }
            if (flatNav.children && flatNav.children.length > 0) {
              if (this.data.type === 'header') {
                if (flatNav.children[0].navigationType.name !== 'header') {
                  return false;
                }
              }
              else {
                if (flatNav.children[0].navigationType.name === 'header') {
                  return false;
                }
              }
            }
            return true;
          });
        })
      );
  }

  /**
   * Define and return Navigation Type menu values.
   * 
   * If form is a component: exclude "header" type.
   * 
   * If form is a header: keep only "header" type. 
   * @returns An observable of assignable navigation types.
   */
  getNavigationTypeMenuValues(): Observable<NavigationType[]> {
    return this._navigationService.getNavigationTypes()
      .pipe(
        retry(2),
        take(1),
        map(
          navigationTypes => {
            if (this.data.type === 'header') {
              this.navigationForm.controls['navigationTypeId'].setValue(navigationTypes.find(obj => obj.name === 'header')?.id);
              return navigationTypes.filter(obj => obj.name === 'header');
            }
            else {
              return navigationTypes.filter(obj => obj.name !== 'header');
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
            retry(2),
            take(1),
            switchMap(() => this.updateNavigationBigSistersOrder(this.data.navigation!.parentId, this.data.navigation!.order))
          )
          .subscribe(() => this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value));
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
            retry(2),
            take(1),
            switchMap(() => this.updateNavigationBigSistersOrder(this.data.navigation!.parentId, this.data.navigation!.order))
          )
          .subscribe(() => this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value));
      }
      //Parent has not changed
      else {
        this._navigationService
          .updateNavigation(this.data.navigation.id, this.navigationForm.value)
          .pipe(
            retry(2),
            take(1)
          )
          .subscribe(() => this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value));
      }
    }
    //ADD
    else {
      this.navigationForm.value["order"] = this.flatNavigations.filter(obj => 
        obj.parentId === this.navigationForm.get('parentId')?.value).length;
      this._navigationService
        .saveNavigation(this.navigationForm.value)
        .pipe(
          retry(2),
          take(1)
        )
        .subscribe({
          next: () => this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value),
          error: (err /* NestJS error type */) => this._snackbarService.showErrorSnackBar(err.message)
        });
    }
  }

  /**
   * Recursively retrieve parent name until the last parent
   * @param navigationId The navigation id of the wished navigation name.
   * @returns The navigation parent name with "/" prefix.
   */
  getParentName(navigationId: string): string {
    let name = '/';
    const parent = this.flatNavigations.find(obj => obj.id === navigationId);
    if (parent) {
      name = parent.name;
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
    this._dialogRef.close();
    this._appService.createAppRouting(redirectName);
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

}
