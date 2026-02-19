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
import { switchMap, take } from 'rxjs';
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

  constructor(
    private _formBuilder: FormBuilder,
    private _http: HttpClient,
    @Inject(MAT_DIALOG_DATA) 
    public _data: { 
      navigationId: Navigation["id"],
      tableConfig: TableViz | undefined
    },
    private _dialogRef: MatDialogRef<NavigationManagementComponent>
  ) { }

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
  hasInputBeenRemoved = false;

  /**
   * Lifecycle hook called after component has been initialized.
   * Create reactive form with following format:
   * - A form group for table configuration
   * - A form array for columns/inputs configuration
   */
  ngOnInit(): void {
    this.formContent = this._formBuilder.group({
      tableLabel: new FormControl(this._data.tableConfig?.tableLabel ?? '', Validators.required),
      formInputs: this._formBuilder.array([])
    });
    if (this._data.tableConfig?.customFormInputs) {
      for (const customFormInput of this._data.tableConfig?.customFormInputs) {
        this.formInputs.push(
          this._formBuilder.group({
            id: new FormControl(customFormInput.id),
            inputType: new FormControl(customFormInput.inputType, Validators.required),
            inputLabel: new FormControl(customFormInput.inputLabel, Validators.required),
            columnType: new FormControl(customFormInput.columnType),
            validators: new FormControl(customFormInput.validators),
            isList: new FormControl(customFormInput.isList),
            dropdownItems: new FormControl(customFormInput.dropdownItems),
            dropdownRouteName: new FormControl(customFormInput.dropdownRouteName),
            bindLabel: new FormControl(customFormInput.bindLabel),
            bindValue: new FormControl(customFormInput.bindValue)
          })
        )
      }
    }
    else {
      this.addInput();
    }
  }

  /**
   * Create accessor for inputs configurations form array.
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
        id: new FormControl(undefined),
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
   * On submit click, save or update table and inputs configuration.
   */
  onSubmit() {
    const tableVizPayload: Omit<TableViz, "id" | "customFormInputs"> = {
      navigationId: this._data.navigationId,
      tableName: '',
      tableLabel: this.formContent.get('tableLabel')?.value,
      isEditable: true
    }
    if (this._data.tableConfig?.id) {
      if (this.hasInputBeenRemoved) {
        if (confirm('Are you sure to save this selection? Deleted columns cannot be recovered.')) {
          this.updateTableAndInputConfig(this._data.tableConfig.id, tableVizPayload);
        }
      }
      else {
        this.updateTableAndInputConfig(this._data.tableConfig.id, tableVizPayload);
      }
    }
    else {
      this.createTableAndInputConfig(tableVizPayload);
    }
  }

  /**
   * Remove item from form array.
   * 
   * @param index The form item index.
   */
  onDeleteClick(index: number) {
    this.formInputs.removeAt(index);
    this.hasInputBeenRemoved = true;
  }

  /**
   * Update table configuration.
   * 
   * @param tableVizId The table config id.
   * @param tableVizPayload The table configuration.
   */
  updateTableAndInputConfig(
    tableVizId: string,
    tableVizPayload: Omit<TableViz, "id" | "customFormInputs">
  ) {
    this._http.patch<TableViz>(`${environment.APIURL}table-viz/${tableVizId}`, tableVizPayload)
      .pipe(
        take(1),
        switchMap(resp => {
          console.log(resp);
          const customInputFormPayload = this.formInputs.value as Array<CustomFormInput>;
          console.log(customInputFormPayload);
          customInputFormPayload.forEach(input => input.tableId = tableVizId);
          return this._http.patch(`${environment.APIURL}custom-form-input/${resp}`, customInputFormPayload)
            .pipe(take(1));
        })
      )
      .subscribe(() => this._dialogRef.close('Content edited successfully'));
  }

  /**
   * Create table and input configuration.
   * 
   * @param tableVizPayload The table configuration.
   */
  createTableAndInputConfig(tableVizPayload: Omit<TableViz, "id" | "customFormInputs">) {
    this._http.post<TableViz>(`${environment.APIURL}table-viz`, tableVizPayload)
      .pipe(
        take(1),
        switchMap(resp => {
          const customInputFormPayload = this.formInputs.value as Array<Omit<CustomFormInput, "id">>;
          customInputFormPayload.forEach(input => input.tableId = resp.id!);
          return this._http.post(`${environment.APIURL}custom-form-input/${resp.tableName}`, customInputFormPayload)
            .pipe(take(1));
        })
      )
      .subscribe(() => this._dialogRef.close('Content added successfully'));
  }

}
