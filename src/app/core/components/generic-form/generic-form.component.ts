import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DeepFormConfig, DropdownInputConfig, InputConfig, StandardInputConfig } from '../../models/form-input.interface';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-generic-form',
  imports: [
    ReactiveFormsModule, 
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    KeyValuePipe
  ],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.scss'
})
//T extends Record<string, any> & { length?: never } constraints the type to be an object and not an array
export class GenericFormComponent<T extends Record<string, any> & { length?: never }> {

  constructor(@Inject(MAT_DIALOG_DATA) 
              public _data: DeepFormConfig<T>,
              private _formBuilder: FormBuilder,
              private _dialogRef: MatDialogRef<GenericFormComponent<T>>){}
          
  formContent!: FormGroup;
    
  ngOnInit() {
    console.log(this._data);
    console.log(typeof this._data);
    this.createForm();
  }

  createForm() {
    this.formContent = this._formBuilder.group({});
    this.generateFormControls(this._data, this.formContent);
    console.log(this.formContent);
  }

  submitForm() {
    console.log(this.formContent.value);
  }

  generateFormControls(data: Record<string, any>, form: FormGroup){
    for (let key in data) {
      if (this.isInput(data[key])) {
        form.addControl(
          key, 
          this._formBuilder.control(data[key].value ?? null, data[key].validators)
        )
      }
      else {
        form.addControl(key, new FormGroup({}));
        this.generateFormControls(data[key], form.get(key) as FormGroup);
      }
    }
  }

  isInput(obj: any): obj is InputConfig<any> {
    return (
      typeof obj === "object" &&
      obj !== null &&
      Array.isArray(obj.validators)
    );
  }

  isDropdownInput(input: any): input is DropdownInputConfig<unknown, unknown> {
    return input.type === 'dropdown'
  }

}
