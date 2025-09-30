import { ChangeDetectionStrategy, Component, Inject, signal } from '@angular/core';
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
import { MediaService } from '../../services/media.service';
import { FormFile } from '../../models/form-file.interface';
import { firstValueFrom, retry, take } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    FormsModule,
    MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './generic-form.component.html',
  styleUrl: './generic-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * "T extends Record<string, any> & { length?: never } & { getTime?: never }"
 *  constraints the type to be an object and not an array or a date
 */
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
              private _snackBar: MatSnackBar,
              private _mediaService: MediaService){}
          
  formContent!: FormGroup;
  hidePassword = signal(true);
  dateAndTimeRecord: Record<string, Date> = {};
  formFileSettings: Array<FormFile> = [];
  isSaving = false;
    
  ngOnInit() {
    this.formContent = this.buildFormGroup(this._data.formConfig);
  }

  async submitForm() {
    this.isSaving = true;
    //if new file uploaded then post it to S3 and assign file key to related form control
    for (const formFileSetting of this.formFileSettings) {
      if (formFileSetting.hasChanged && formFileSetting.formFile?.get('file')) {
        const media = await firstValueFrom(this._mediaService.uploadFileToS3(formFileSetting.formFile));
        this.getFormControl(formFileSetting.formGroup, formFileSetting.formControlName).setValue(media.name);
      }
    }
    //edit
    if (this._data.id) {
      this._http.patch(`${environment.APIURL}${this._data.controllerName}/${this._data.id}`, this.formContent.value)
        .pipe(
          retry(2),
          take(1),
        )
        .subscribe(resp => {
          this.isSaving = false;
          this.showSuccessSnackBar('edited');
          this._dialogRef.close('edited');
        });
    }
    //add
    else {
      //if navigationId is passed then save it in the db;
      if (this._data.navigationId) {
        this.formContent.addControl(
          'navigationId', 
          this._formBuilder.control(this._data.navigationId)
        );
      }
      this._http.post(`${environment.APIURL}${this._data.controllerName}`, this.formContent.value)
        .pipe(
          retry(2),
          take(1),
        )
        .subscribe(resp => {
          this.isSaving = false;
          this.showSuccessSnackBar('added');
          this._dialogRef.close('added');
        });
    }
  }

  deleteObject(){
    if (confirm("Are you sure to delete this element?")) { 
      this._http.delete(`${environment.APIURL}${this._data.controllerName}/${this._data.id}`)
      .pipe(
        retry(2),
        take(1),
      )
      .subscribe(resp => {
        this.showSuccessSnackBar('deleted');
        this._dialogRef.close('deleted');
      });
    }

  }

  buildFormGroup(data: any): FormGroup {
    const group: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (this.isStandardInput(value) || this.isDropdownInput(value)) {
        // It's an input configuration - create FormControl with the value
        group[key] = new FormControl(value.value, value.validators ?? []);
        // Check if input is 'date-and-time' or 'file' and setup record information 
        this.setUpDateTimeAndFileRecords(key, value, group);
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

  //TODO: Find a way to get form group without calling this method from HTML 
  getFormGroup(formGroup: FormGroup, name: any) {
    return formGroup.get(name) as FormGroup;
  }

  //TODO: Find a way to get form control without calling this method from HTML 
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

  setUpDateTimeAndFileRecords(key: string, value: any, group: any) {    
    if (value.type === 'date-and-time') {
      this.dateAndTimeRecord[key] = value.value;
    }

    if (value.type === 'file') {
      this.formFileSettings.push({
        fileId: value.value,
        formFile: new FormData(),
        formControlName: key,
        formGroup: new FormGroup(group),
        hasChanged: false
      });
    }
  }

  onFileSelection(event: any, formControlName: string) {
    const fileUploaded: File = event.target.files[0];
    const formFileSetting = this.formFileSettings.find(obj => obj.formControlName === formControlName);
    if (formFileSetting) {
      formFileSetting.formFile.delete('file');
      formFileSetting.formFile.append('file', fileUploaded);
      formFileSetting.hasChanged = true;
      formFileSetting.fileId = fileUploaded.name;  
      this.getFormControl(formFileSetting.formGroup, formFileSetting.formControlName).setValue(fileUploaded.name);
    }
  }

  onFileRemove(formControlName: string, control: FormControl) {
    const formFileSetting = this.formFileSettings.find(obj => obj.formControlName === formControlName);
    if (formFileSetting) {
      formFileSetting.formFile.delete('file');
      formFileSetting.fileId = '';
      this.getFormControl(formFileSetting.formGroup, formFileSetting.formControlName).setValue('');
    }
    control.setValue('');
  }

   //TODO: Find a way to get file name without calling this method from HTML 
  getFileName(formControlName: string): string | undefined {
    const fileId = this.formFileSettings.find(obj => obj.formControlName === formControlName)?.fileId;
    if (fileId && fileId !== '') {
      return fileId;
    }
    return 'No file selected'
  }

}
