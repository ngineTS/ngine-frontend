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
                navigation: Navigation, 
                type: 'header' | 'component',
                parentId: string,
              },
              private _formBuilder: FormBuilder,
              private _navigationService: NavigationService,
              private dialogRef: MatDialogRef<NavigationManagementComponent>,
              private _appService: AppService) {}

  navigationForm!: FormGroup;
  navigationTypes: NavigationType[] = [];
  flatNavigations: Navigation[] = [];
  parentNavigations: Navigation[] = [];

  ngOnInit() {
    this.getParentMenuValues().subscribe(resp => this.parentNavigations = resp);
    this.getNavigationTypeMenuValues().subscribe(resp => this.navigationTypes = resp);
    this.createNavigationForm();
  }

  /**
   * Create Navigation form based on navigation passed in this component.
   * 
   * If navigation is a header then add color form control.
   * 
   * If navigation is a component then make parent as mandatory
   */
  createNavigationForm() {
    this.navigationForm = this._formBuilder.group({
      parentId: [this.data.navigation?.parentId ?? this.data.parentId],
      navigationTypeId: [this.data.navigation?.navigationTypeId ?? null, Validators.required],
      displayLabel: [this.data.navigation?.displayLabel ?? null, Validators.required],
      isDisabled: [this.data.navigation?.isDisabled ?? false],
    });
    if (this.data.type === 'header') {
      this.navigationForm.addControl(
        'color', 
        this._formBuilder.control(this.data.navigation?.color ?? null, Validators.required)
      );
    }
    if (this.data.type === 'component') {
      this.navigationForm.get('parentId')?.addValidators([Validators.required]);
    }
  }

  /**
   * Set the parent menu values and retrieve sister navigations.
   * 
   * If form is a header: the parents can only be headers without component children.
   * 
   * If form is a component: the parents can only be headers without header children.
   * @returns An observable of parent navigations.
   */
  getParentMenuValues(): Observable<Navigation[]> {
    return this._navigationService.getFlatNavigations().pipe(
      retry(2),
      take(1),
      map(flatNavigations => {
        this.flatNavigations = flatNavigations;
        return flatNavigations.filter(obj => {
          if (obj.name === this.data.navigation?.name) {
            return false;
          }
          if(obj.navigationType.name !== 'header') {
            return false;
          }
          if(obj.children && obj.children.length > 0) {
            if (this.data.type === 'header') {
              if (obj.children[0].navigationType.name !== 'header') {
                return false;
              }
            }
            else {
              if (obj.children[0].navigationType.name === 'header') {
                return false;
              }
            }
          }
          return true;
        });
      }
    ));
  }

  /**
   * Set the Navigation Type menu values.
   * 
   * If form is a component: exclude "header" type.
   * 
   * If form is a header: keep only "header" type. 
   * @returns An observable of navigation types
   */
  getNavigationTypeMenuValues(): Observable<NavigationType[]> {
    return this._navigationService.getNavigationTypes().pipe(
      retry(2),
      take(1),
      map(
        navigationTypes => {
          if (this.data.type === 'header') {
            this.navigationForm.controls['navigationTypeId'].setValue(navigationTypes.find(obj => obj.name === 'header')?.id);
            return navigationTypes.filter(obj => obj.name === 'header');;
          }
          else {
            return navigationTypes.filter(obj => obj.name !== 'header');
          }
        }
      )
    );
  }

  /**
   * Delete navigation, update old sisters order and refresh routing.
   */
  deleteNavigation() {
    if (confirm("Are you sure to delete this navigation?")) {
      if (this.data.navigation?.id) {
        this._navigationService.deleteNavigation(this.data.navigation.id)
          .pipe(
            retry(2),
            take(1),
            switchMap(() => this.updateOldSisterNavigationsOrder(this.data.navigation.parentId, this.data.navigation?.order))
          )
          .subscribe(() => this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value));
      }
    }
  }

  /**
   * Save or update navigation and refresh routing.
   * 
   * In case of update, if parentId has changed then update old sisters order
   */
  submitForm() {
    //EDIT
    if (this.data.navigation?.id) {
      //Parent has changed
      if(this.data.navigation.parentId !== this.navigationForm.get('parentId')?.value){
        this.navigationForm.value["order"] = this.flatNavigations.filter(obj => 
          obj.parentId === this.navigationForm.get('parentId')?.value).length;
        this._navigationService.updateNavigation(this.data.navigation.id, this.navigationForm.value)
          .pipe(
            retry(2),
            take(1),
            switchMap(() => this.updateOldSisterNavigationsOrder(this.data.navigation.parentId, this.data.navigation?.order))
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
        .subscribe(() => this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value));
    }
  }

  /**
   * Recursively retrieve parent name until the last parent
   * @param navigationId Navigation id of the wished navigation name
   * @returns Navigation parent name with "/" prefix
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
   * Update in database order of old navigation sisters by decreasing by 1 the navigation with bigger order.
   * @param oldParentId Old navigation parentId
   * @param oldOrder Old navigation order
   * @returns An array of navigation ids and orders with position setup
   */
  updateOldSisterNavigationsOrder(
    oldParentId: string, 
    oldOrder: number
  ): Observable<Pick<Navigation, "id" | "order">[]> {
    const navigationOrdersToUpdate: Pick<Navigation, "id" | "order">[] = [];
    let bigSisterNavigations = this.flatNavigations.filter(obj => 
      obj.parentId === oldParentId && obj.order > oldOrder
    );
    bigSisterNavigations.forEach(obj => navigationOrdersToUpdate.push({
      id: obj.id,
      order: obj.order - 1
    }));
    return this._navigationService.bulkUpdateNavigationOrders(navigationOrdersToUpdate);
  }

  /**
   * Close popup, refresh routing and redirect to parent navigation.
   * @param parentId Navigation parent id
   */
  refreshRoutingAndRedirect(parentId: string){
    const redirectName = this.getParentName(parentId);
    this.dialogRef.close();
    this._appService.createRouting(redirectName);
  }

}
