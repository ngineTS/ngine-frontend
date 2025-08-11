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
import { MatSnackBar } from '@angular/material/snack-bar';

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
              private _http: HttpClient,
              private _snackBar: MatSnackBar){}
          
  formContent!: FormGroup;
  hidePassword = signal(true);
  dateAndTimeRecord: Record<string, Date> = {};
  dateTimeValue!: Date;
    
  ngOnInit() {
    this.storeDateAndTimeInputsForNgModel(this._data.formConfig);
    this.formContent = this.buildFormGroup(this._data.formConfig);
  }

  submitForm() {
    console.log(this.formContent.value);
    //edit
    if(this._data.id) {
      this._http.patch(`${environment.APIURL}${this._data.controllerName}/${this._data.id}`, this.formContent.value)
                .subscribe(resp => {
                  this.showSuccessSnackBar('edited');
                  this._dialogRef.close();
                });
    }
    //add
    else {
      //if navigationId is passed then save it in the db;
      this.formContent.addControl(
        'navigationId', 
        this._formBuilder.control(this._data.navigationId ?? null)
      );
      this._http.post(`${environment.APIURL}${this._data.controllerName}`, this.formContent.value)
                .subscribe(resp => {
                  this.showSuccessSnackBar('added');
                  this._dialogRef.close();
                });
    }
  }

  deleteObject(){
    if (confirm("Are you sure to delete this element?")) { 
      this._http.delete(`${environment.APIURL}${this._data.controllerName}/${this._data.id}`)
                .subscribe(resp => {
                  console.log(resp);
                  this.showSuccessSnackBar('deleted');
                  this._dialogRef.close();
                });
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

  onDateAndTimeChange(control: FormControl, formControlName: string) {
    setTimeout(() => control.setValue(new Date(this.dateAndTimeRecord[formControlName])), 250);
  }

  showSuccessSnackBar(action: string) {
    this._snackBar.open(`Element ${action} successfully`, 'Close', {
      verticalPosition: 'top',
      duration: 10000
    });
  }

  /**
   * Store 'date-and-time' inputs inside Records to be used in [(ngModel)] of HTML page.
   * 
   * Info: [(ngModel)] is used for 'date-and-time' input instead of form control due to synchronization issue with this last one.
   * @param formConfig The form config
   */
  storeDateAndTimeInputsForNgModel(formConfig: typeof this._data.formConfig) {
    for (const [key, value] of Object.entries(formConfig)) {
      if (value.type === 'date-and-time') {
        this.dateAndTimeRecord[key] = value.value;
      }
    }
  }


}
