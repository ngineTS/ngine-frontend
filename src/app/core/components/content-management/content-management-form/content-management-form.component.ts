import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../../../environments/environment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Navigation } from '../../../models/navigation.interface';
import { CustomFormInput, TableViz } from '../../../models/content-management.interface';
import { retry, switchMap, take } from 'rxjs';
import { NavigationManagementComponent } from '../../navigation-management/navigation-management.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-content-management-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './content-management-form.component.html',
  styleUrl: './content-management-form.component.scss'
})
export class ContentManagementFormComponent implements OnInit {

  constructor(private _formBuilder: FormBuilder,
              private _http: HttpClient,
              @Inject(MAT_DIALOG_DATA) 
              public _data: { navigationId: Navigation["id"] },
              private _dialogRef: MatDialogRef<NavigationManagementComponent>) {}

  formContent!: FormGroup;
  inputTypeItems = [
    'email',
    'url',
    'text',
    'password',
    'number',
    'date',
    'date-and-time',
    'dropdown',
    'checkbox',
    'file',
    'textarea'
  ];
  validatorItems = ['required', 'email'];
  columnTypeItems = ['number', 'text']; // use when dropdown is selected (to know the value type)

  /**
   * On initialization, create forms with following format:
   * - A form group for table configuration
   * - A form array for columns/inputs configuration
   */
  ngOnInit(): void {
    this.formContent = this._formBuilder.group({
      tableLabel: new FormControl('', Validators.required),
      formInputs: this._formBuilder.array([])
    });
    this.formInputs.push(
      this._formBuilder.group({
        inputType: new FormControl('', Validators.required),
        inputLabel: new FormControl('', Validators.required),
        columnType: new FormControl(''),
        validators: new FormControl([]),
        isList: new FormControl(false),
        dropdownItems: new FormControl(''),
        dropdownRouteName: new FormControl(''),
        bindLabel: new FormControl(''),
        bindValue: new FormControl('')
      })
    );
  }

  /**
   * Create accessor for inputs configurations form array.
   * 
   * This allows to call 'formInputs' in html without using 'formContent' property.
   */
  get formInputs() {
    return this.formContent.get('formInputs') as FormArray;
  }

  /**
   * Add new input configuration row when user click on "+ Add another input" button.
   */
  addInput() {
    this.formInputs.push(
      this._formBuilder.group({
        inputType: new FormControl('', Validators.required),
        inputLabel: new FormControl('', Validators.required),
        columnType: new FormControl(''),
        validators: new FormControl([]),
        isList: new FormControl(false),
        dropdownItems: new FormControl(''),
        dropdownRouteName: new FormControl(''),
        bindLabel: new FormControl(''),
        bindValue: new FormControl('')
      })
    );
  }

  /**
   * Save Table and inputs configuration into database:
   * 
   * 1. Save table information record and retrieve table id.
   * 2. Assign table id to each input config and save them.
   * 3. Close form and pass success message to parent.
   */
  onSubmit() {
    const tableVizPayload: Omit<TableViz, "id" | "customFormInputs"> = {
      navigationId: this._data.navigationId,
      tableName: '',
      tableLabel: this.formContent.get('tableLabel')?.value,
      isEditable: true
    }
    this._http.post<TableViz>(`${environment.APIURL}table-viz`, tableVizPayload)
      .pipe(
        take(1),
        switchMap(resp => {
          const customInputFormPayload = this.formInputs.value as Array<Omit<CustomFormInput, "id">>;
          customInputFormPayload.forEach(input => input.tableId = resp.id!);
          return this._http.post(`${environment.APIURL}custom-form-input/${resp.tableName}`, customInputFormPayload)
            .pipe(
              take(1)
            )
        })
      )
      .subscribe(() => this._dialogRef.close('Content added successfully'));
  }

  onDeleteClick(index: number) {
    this.formInputs.removeAt(index);
  }

}
