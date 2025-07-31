import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormConfig, InputConfig } from '../../models/form-input.interface';

@Component({
  selector: 'app-generic-form',
  imports: [
    ReactiveFormsModule, 
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.scss'
})
export class GenericFormComponent<T> {

  constructor(@Inject(MAT_DIALOG_DATA) 
              public _data: FormConfig<T>,
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

  /*isInput(obj: any): obj is DropdownInputConfig<Record<string, any>, any> | StandardInputConfig<Record<string, any>> {
    return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.name === "string" &&
      Array.isArray(obj.validators)
    );
  }

  generateFormGroupControls(
    data: InputsArray<Record<string, any>>,
    form: FormGroup
  ) {
    data.forEach(input => {
      if (this.isInput(input)) {
        form.addControl(
          input.name, 
          this._formBuilder.control(input.value ?? null, input.validators)
        );
      }
      else {
        for (let key in input) {
          if (input[key]) {
            form.addControl(key, new FormGroup({}));
            this.generateFormGroupControls(input[key], form.get(key) as FormGroup);
          }
        }
      }
    });
  }*/

  generateFormControls(data: Record<string, any>, form: FormGroup){
    for(let key in data) {
      if(this.isInput(data[key])) {
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

}
