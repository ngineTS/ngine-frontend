import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DropdownInputConfig, StandardInputConfig } from '../../models/form-input.interface';

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
              public _data: Array<StandardInputConfig<T> | DropdownInputConfig<T, any>>,
              private _formBuilder: FormBuilder,
              private _dialogRef: MatDialogRef<GenericFormComponent<T>>){}
          
  formContent!: FormGroup;
    
  ngOnInit() {
    console.log(this._data);
    console.log(typeof this._data);
    this.createForm();
  }

  createForm() {
    let formControls = {} as Record<string, FormControl>;
    this._data.forEach(input => {
      formControls[input.name] = new FormControl(input.value ?? null, input.validators);
    });
    this.formContent = this._formBuilder.group(formControls);
    console.log(this.formContent);
  }

  submitForm() {
    console.log(this.formContent.value);
  }
   

}
