import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DropdownInputConfig, FormValueEvent, GenericFormDialogData, InputConfig, StandardInputConfig } from '../../models/form-input.interface';
import { KeyValue, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MediaService } from '../../services/media.service';
import { FormFile } from '../../models/form-file.interface';
import { catchError, debounceTime, firstValueFrom, take, throwError } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '../../services/snackbar.service';

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
    MatTooltipModule,
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
export class GenericFormComponent {

  constructor(
    private _formBuilder: FormBuilder,
    private _http: HttpClient,
    private _snackbarService: SnackBarService,
    private _mediaService: MediaService
  ) { }
          
  formContent!: FormGroup;
  hidePassword = signal(true);
  dateAndTimeRecord: Record<string, Date> = {};
  formFileSettings: Array<FormFile> = [];
  isSaving = signal(false);
  /** The form inputs configuration. */
  @Input('formConfiguration') formConfiguration!:  GenericFormDialogData<Record<string, any>>;
  /** Event emitter for form submition. */
  @Output() action: EventEmitter<'added' | 'edited' | 'deleted'> = new EventEmitter();
  /** Event emitter for form value change.  */
  @Output() onFormValueChange: EventEmitter<FormValueEvent> = new EventEmitter();

  ngOnChanges(simpleChanges: SimpleChanges) {
    if (simpleChanges['formConfiguration']) {
      this.formContent = this.buildFormGroup(this.formConfiguration.formConfig);
      this.watchControls(this.formContent);
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

  async submitForm() {
    this.isSaving.set(true);
    //if new file uploaded then post it and assign file key to related form control
    for (const formFileSetting of this.formFileSettings) {
      if (formFileSetting.hasChanged && formFileSetting.formFile?.get('file')) {
        const media = await firstValueFrom(
          this._mediaService.uploadFile(formFileSetting.formFile)
            .pipe(catchError(err => {
              this.isSaving.set(false);
              return throwError(() => err);
            }))
        );
        this.getFormControl(formFileSetting.formGroup, formFileSetting.formControlName).setValue(media.name);
      }
    }
    if (this.formConfiguration.payloadId) {
      this.updateObject(); //edit
    }
    else {
      this.saveObject(); //add
    }
  }

  saveObject() {
    //if navigationId is passed then save it in the db;
    if (this.formConfiguration.navigationId) {
      this.formContent.addControl(
        'navigationId', 
        this._formBuilder.control(this.formConfiguration.navigationId)
      );
    }
    this._http.post(`${environment.APIURL}${this.formConfiguration.controllerName}`, this.formContent.value)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this._snackbarService.showSuccessSnackBar(`Element added successfully.`);
          this.action.emit('added');
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
  }

  updateObject() {
    this._http.patch(`${environment.APIURL}${this.formConfiguration.controllerName}/${this.formConfiguration.payloadId}`, this.formContent.value)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this._snackbarService.showSuccessSnackBar(`Element edited successfully.`);
          this.action.emit('edited');
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
  }

  deleteObject() {
    if (confirm("Are you sure to delete this element?")) { 
      this._http.delete(`${environment.APIURL}${this.formConfiguration.controllerName}/${this.formConfiguration.payloadId}`)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this._snackbarService.showSuccessSnackBar(`Element deleted successfully.`);
            this.action.emit('deleted');
          },
          error: () => {
            this.isSaving.set(false);
          }
        });
    }
  }

  watchControls(group: FormGroup, groupName: string = '') {
    Object.entries(group.controls).forEach(([name, control]) => {
      if (control instanceof FormControl) {
        control.valueChanges
          .pipe(debounceTime(100))
          .subscribe(value => {
             this.onFormValueChange.emit({
              formGroupName: groupName,
              formControlName: name,
              formControlValue: value
             });
          });
      }

      if (control instanceof FormGroup) {
        const nestedGroupName = groupName ? `${groupName}.${name}` : `${name}`
        this.watchControls(control, nestedGroupName);
      }
    });
  }

  compareByOrder(
    a: KeyValue<string, any>,
    b: KeyValue<string, any>
  ): number {
    const orderA: number = a.value.order ?? Number.MAX_SAFE_INTEGER;
    const orderB: number = b.value.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  };
}
