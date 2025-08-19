import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { environment } from '../../../../../environments/environment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Navigation } from '../../../models/navigation.interface';
import { CustomFormInput, TableViz } from '../../../models/content-management.interface';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'app-content-management-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    MatSelectModule
  ],
  templateUrl: './content-management-form.component.html',
  styleUrl: './content-management-form.component.scss'
})
export class ContentManagementFormComponent implements OnInit {

  constructor(private _formBuilder: FormBuilder,
              private _http: HttpClient,
              @Inject(MAT_DIALOG_DATA) 
              public _data: { navigationId: Navigation["id"] }) {}

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
  ]

  ngOnInit(): void {
    this.formContent = this._formBuilder.group({
      tableLabel: new FormControl('', Validators.required),
      formInputs: this._formBuilder.array([])
    });
    this.formInputs.push(
      this._formBuilder.group({
        inputType: new FormControl('', Validators.required),
        inputLabel: new FormControl('', Validators.required),
        validators: new FormControl([])
      })
    );
  }

  get formInputs() {
    return this.formContent.get('formInputs') as FormArray;
  }

  addInput() {
    this.formInputs.push(
      this._formBuilder.group({
        inputType: new FormControl('', Validators.required),
        inputLabel: new FormControl('', Validators.required),
        validators: new FormControl([])
      })
    );
  }

  onSubmit() {
    const tableVizPayload: Omit<TableViz, "id"> = {
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
          customInputFormPayload.forEach(input => input.tableId = resp.id);
          return this._http.post(`${environment.APIURL}custom-form-input/${resp.tableName}`, customInputFormPayload)
            .pipe(
              take(1)
            )
        })
      )
      .subscribe(resp => console.log(resp));
  }

}
