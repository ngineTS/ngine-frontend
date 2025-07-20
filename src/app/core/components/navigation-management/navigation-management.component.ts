import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Navigation } from '../../models/navigation.interface';
import { NavigationService } from '../../services/navigation.service';
import { NavigationType } from '../../models/navigation-type.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { map, Observable, retry, take } from 'rxjs';



@Component({
  selector: 'app-navigation-management',
  imports: [
    ReactiveFormsModule, 
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './navigation-management.component.html',
  styleUrl: './navigation-management.component.scss'
})
export class NavigationManagementComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) 
              public data: { navigation: Navigation, type: 'header' | 'component' },
              private _fb: FormBuilder,
              private _navigationService: NavigationService) {}

  navigationForm!: FormGroup;
  navigationTypes: NavigationType[] = [];
  parentNavigations: Navigation[] = [];

  ngOnInit() {   
    this.getParentMenuValues().subscribe(resp => this.parentNavigations = resp);
    this.getNavigationTypeMenuValues().subscribe(resp => this.navigationTypes = resp);
    this.createNavigationForm();
  }

  submitForm() {
    console.log(this.navigationForm.value);
    console.log("ha");
    //this._navigationService.saveNavigations(this.navigationForm.value).subscribe(resp => console.log(resp));
  }

  /**
   * Create Navigation form.
   * 
   * If navigation is a header then add color form control.
   */
  createNavigationForm() {
    this.navigationForm = this._fb.group({
      parentId: [this.data.navigation?.parentId ?? null],
      navigationTypeId: [this.data.navigation?.navigationTypeId ?? null],
      displayLabel: [this.data.navigation?.displayLabel ?? null],
      isDisabled: [this.data.navigation?.isDisabled ?? false],
    });
    if (this.data.type === 'header') {
      this.navigationForm.addControl(
        'color', 
        this._fb.control(this.data.navigation?.color ?? null)
      );
    }
  }

  /**
   * Set the parent menu values of this form.
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
   * If form is a component: exclude "header" values.
   * 
   * If form is a header: fix navigation type input value to "header". 
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

}
