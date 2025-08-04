import { Component, Inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DropdownInputConfig, GenericFormDialogData, StandardInputConfig } from '../../models/form-input.interface';
import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
    MatTimepickerModule,
    MatIconModule,
    KeyValuePipe,
    NgTemplateOutlet,
    FormsModule
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
              public _data: GenericFormDialogData<T>,
              private _formBuilder: FormBuilder,
              private _dialogRef: MatDialogRef<GenericFormComponent<T>>,
              private _http: HttpClient){}
          
  formContent!: FormGroup;
  hidePassword = signal(true);
  dateTimeValue!: Date;
    
  ngOnInit() {
    console.log(this._data);
    this.formContent = this.buildFormGroup(this._data.formConfig);
  }

  submitForm() {
    console.log(this.formContent.value);
    //edit
    if(this._data.id) {
      this._http.patch(`${environment.APIURL}${this._data.controllerName}/${this._data.id}`, this.formContent.value)
                .subscribe(resp => console.log(resp));
    }
    //add
    else {
      this._http.post(`${environment.APIURL}${this._data.controllerName}`, this.formContent.value)
                .subscribe(resp => console.log(resp));
    }
  }

  deleteObject(){
    if (confirm("Are you sure to delete this element?")) { 
      this._http.delete(`${environment.APIURL}${this._data.controllerName}/${this._data.id}`)
                .subscribe(resp => console.log(resp));
    }

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
    return input.type && input.type !== 'dropdown'
  }

  getFormGroup(formGroup: FormGroup, name: any) {
    return formGroup.get(name) as FormGroup;
  }

  getFormControl(formGroup: FormGroup, name: any) {
    return formGroup.get(name) as FormControl;
  }

  passwordEyeclickEvent(event: MouseEvent) {
      this.hidePassword.set(!this.hidePassword());
      event.stopPropagation();
  }

  onDateAndTimeChange(control: FormControl) {
    setTimeout(() => control.setValue(new Date(this.dateTimeValue)), 250);
  }


}
