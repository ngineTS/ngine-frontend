import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DeepFormConfig, DropdownInputConfig, StandardInputConfig } from '../../models/form-input.interface';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';




@Component({
  selector: 'app-generic-form',
  imports: [
    ReactiveFormsModule, 
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    KeyValuePipe,
    NgTemplateOutlet,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.scss'
})
//"T extends Record<string, any> & { length?: never }"" constraints the type to be an object and not an array
export class GenericFormComponent<
                                  T extends Record<string, any> 
                                    & { length?: never } 
                                    & { getTime?: never }
                                 > {

  constructor(@Inject(MAT_DIALOG_DATA) 
              public _data: DeepFormConfig<T>,
              private _formBuilder: FormBuilder,
              private _dialogRef: MatDialogRef<GenericFormComponent<T>>){}
          
  formContent!: FormGroup;
    
  ngOnInit() {
    console.log(this._data);
    this.createForm();
  }

  createForm() {
    this.formContent = this.buildFormGroup(this._data);
    console.log(this.formContent);
  }

  submitForm() {
    console.log(this.formContent.value);
  }

  buildFormGroup(data: any): FormGroup {
    const group: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (this.isStandardInput(value) || this.isDropdownInput(value)) {
        // It's an input configuration - create FormControl with the value
        group[key] = new FormControl(value.value, value.validators ?? []);
      } else {
        // It's an object - create FormGroup
        group[key] = this.buildFormGroup(value);
      }
    }
    
    return this._formBuilder.group(group);
  }

  isDropdownInput(input: any): input is DropdownInputConfig<any, any> {
    return input.type === 'dropdown'
  }

  isStandardInput(input: any): input is StandardInputConfig<any> {
    return input.type === 'text' || input.type === 'date'
  }

  getFormGroup(formGroup: FormGroup, name: any) {
    return formGroup.get(name) as FormGroup;
  }

  getFormControl(formGroup: FormGroup, name: any) {
    return formGroup.get(name) as FormControl;
  }

}
