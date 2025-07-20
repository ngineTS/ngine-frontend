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
              public data: {navigation: Navigation, type: 'header' | 'component' },
              private _fb: FormBuilder,
              private _navigationService: NavigationService) {}

  navigationForm!: FormGroup;
  navigationTypes: NavigationType[] = [];

  ngOnInit() {   
    this.createNavigationForm();
    this._navigationService.getNavigationTypes().subscribe(
      navigationTypes => {
        this.navigationTypes = navigationTypes;
        if (this.data.type === 'header') {
          this.navigationTypes = navigationTypes;
          this.navigationForm.controls['navigationTypeId'].setValue(navigationTypes.find(obj => obj.name === 'header')?.id);
          this.navigationForm.get('navigationTypeId')?.disable();
        }
        if (this.data.type === 'component') {
          this.navigationTypes = navigationTypes.filter(obj => obj.name !== 'header');
        }
      }
    );
    
  }

  submitForm() {
    console.log(this.navigationForm.value);
    console.log("ha");
  }

  /**
   * Create Navigation Form
   * If navigation is a header then add color form control
   */
  createNavigationForm() {
    this.navigationForm = this._fb.group({
      parentId: [this.data.navigation?.parentId ?? ''],
      navigationTypeId: [this.data.navigation?.navigationTypeId ?? ''],
      displayLabel: [this.data.navigation?.displayLabel ?? ''],
      isDisabled: [this.data.navigation?.isDisabled ?? false],
    });
    if (this.data.type === 'header') {
      this.navigationForm.addControl(
        'color', 
        this._fb.control(this.data.navigation?.color ?? '')
      );
    }
  }

}
