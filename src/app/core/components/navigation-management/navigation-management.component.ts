import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Navigation } from '../../models/navigation.interface';
import { NavigationService } from '../../services/navigation.service';
import { NavigationType } from '../../models/navigation-type.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Observable, switchMap, take } from 'rxjs';
import { AppService } from '../../services/app.service';
import { SnackBarService } from '../../services/snackbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ContainerLayoutService } from '../../services/container-layout.service';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MediaService } from '../../services/media.service';


@Component({
  selector: 'app-navigation-management',
  imports: [
    ReactiveFormsModule, 
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './navigation-management.component.html',
  styleUrl: './navigation-management.component.scss'
})
export class NavigationManagementComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) 
    public data: { 
      navigation: Navigation | undefined,
      parentId: string,
    },
    private _formBuilder: FormBuilder,
    private _navigationService: NavigationService,
    private _dialogRef: MatDialogRef<NavigationManagementComponent>,
    private _appService: AppService,
    private _snackbarService: SnackBarService,
    private _containerLayoutService: ContainerLayoutService,
    private _http: HttpClient,
    private _mediaService: MediaService
  ) {}

  navigationForm!: FormGroup;
  navigationTypes: NavigationType[] = [];
  flatNavigations: Navigation[] = [];
  navigationTypeSelected: NavigationType | undefined;
  filteredIcons: Array<string> = [];
  bootstrapIconNamesList: Array<string> = [];
  isSearchingIcon = false;
  isLoadingNavigationTypes = true;
  isLoadingFlatNavigations = true;
  navigationTypeImageS3UrlMap: Record<string, Observable<string>> = {};


  /**
   * Lifecycle hook called after the component has been initialized.
   */
  ngOnInit() {
    this._http.get<Array<string>>('assets/icons.json').subscribe(icons => {
      this.bootstrapIconNamesList = icons;
    });

    this._navigationService.getFlatNavigations().subscribe(resp => {
      this.flatNavigations = resp;
      this.isLoadingFlatNavigations = false;
    });

    this._navigationService.getNavigationTypes().subscribe(resp => {
      this.navigationTypes = resp;
      this.isLoadingNavigationTypes = false;
      this.navigationTypes.forEach(navType => {
        if (navType.thumbnailImage) {
          this.navigationTypeImageS3UrlMap[navType.thumbnailImage] = this._mediaService.getS3ObjectSignedUrl(navType.thumbnailImage);
        }
      });
    });
    
    if (this.data.navigation) {
      this.navigationTypeSelected = this.data.navigation.navigationType;
    }

    this.createForm();
  }

  /**
   * Create Navigation form based on navigation passed in this component.
   * If navigation is a component then make parent as mandatory and set up initial size.
   */
  createForm() {
    this.navigationForm = this._formBuilder.group({
      parentId: [this.data.navigation?.parentId ?? this.data.parentId, [Validators.required]],
      navigationTypeId: [this.data.navigation?.navigationTypeId ?? null, Validators.required],
      url: [this.data.navigation?.url ?? null],
      icon: [this.data.navigation?.icon ?? null],
      showIconOnly: [this.data.navigation?.showIconOnly ?? null],
      displayLabel: [this.data.navigation?.displayLabel ?? null, [
        Validators.required,
        Validators.maxLength(30)
      ]],
      description: [this.data.navigation?.description ?? null],
      isDisabled: [this.data.navigation?.isDisabled ?? false],
    });
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
          obj.parentId === this.navigationForm.get('parentId')?.value
        ).length;

        this._navigationService.updateNavigation(this.data.navigation.id, this.navigationForm.value)
          .pipe(
            take(1),
            switchMap(() => this.updateNavigationBigSistersOrder(this.data.navigation!.parentId, this.data.navigation!.order)),
            switchMap(() => this._containerLayoutService.updateContainerLayout(
              this.data.navigation!.containerLayout.id,
              { xPos: 0, yPos: 0 }
            ))
          )
          .subscribe({
            next: () => {
              this._snackbarService.showSuccessSnackBar('Element edited successfully.');
              this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
            }
          });
      }
      //Parent has not changed
      else {
        this._navigationService
          .updateNavigation(this.data.navigation.id, this.navigationForm.value)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this._snackbarService.showSuccessSnackBar('Element edited successfully.');
              this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
            }
          });
      }
    }
    //ADD
    else {
      this.navigationForm.value["order"] = this.flatNavigations.filter(obj => 
        obj.parentId === this.navigationForm.get('parentId')?.value).length;
      this._navigationService
        .saveNavigation(this.navigationForm.value)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this._snackbarService.showSuccessSnackBar('Element added successfully.');
            this.refreshRoutingAndRedirect(this.navigationForm.get('parentId')?.value)
          }
        });
    }
  }

  /**
   * Recursively retrieve parent name until the last parent.
   * 
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
   * 
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
   * 
   * @param parentId The navigation parent id we want to redirect on.
   */
  refreshRoutingAndRedirect(parentId: Navigation["parentId"]) {
    const redirectName = this.getParentName(parentId);
    this._appService.createAppRouting(redirectName);
    this._dialogRef.close();
  }

  /**
   * Getter used in icon dropdown to display icon as selected value.
   */
  get iconFormControl() {
    return this.navigationForm.get('icon')!;
  }

  /**
   * Clear icon selection.
   */
  clearIcon(event: Event) {
    event.stopPropagation();
    this.iconFormControl?.setValue(null);
  }

  /**
   * Method called on Navigation Type selection change.
   * If navigation type is a component then setup default size (/!\ Only in case of adding navigation)
   * 
   * @param event The MatSelectChange event.
   */
  onNavigationTypeChange(event: MatSelectChange) {
    this.navigationTypeSelected = this.navigationTypes.find(obj => obj.id === event.value);
    if(this.navigationTypeSelected?.name === 'external-link-button') {
      this.navigationForm.get('url')?.addValidators(Validators.required);
    }
    else {
      this.navigationForm.get('url')?.removeValidators(Validators.required);
    }
    this.navigationForm.get('url')?.updateValueAndValidity();
  }

  /**
   * Select navigation type from card and update form control.
   */
  selectNavigationType(navType: NavigationType) {
    this.navigationForm.get('navigationTypeId')?.setValue(navType.id);
    this.onNavigationTypeChange({ value: navType.id } as MatSelectChange);
  }

  /**
   * Filter icon list on user search.
   */
  async filterIcons(event: Event) {
    if (!this.isSearchingIcon) {

      setTimeout(() => {
        this.isSearchingIcon = true;
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();

        if (filterValue && filterValue.length > 1) {
          this.filteredIcons = this.bootstrapIconNamesList.filter(obj => 
            obj.trim().toLowerCase().includes(filterValue)
          );
        }

        this.isSearchingIcon = false;
      }, 200);
      
    }
  }

}
