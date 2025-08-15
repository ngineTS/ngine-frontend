import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

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
export class ContentManagementFormComponent implements OnInit{

  constructor(private _formBuilder: FormBuilder) {}

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
      moduleName: new FormControl('', Validators.required),
      formInputs: this._formBuilder.array([])
    });
    this.formInputs.push(
      this._formBuilder.group({
        columnName: new FormControl('', Validators.required),
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
        columnName: new FormControl('', Validators.required),
        inputType: new FormControl('', Validators.required),
        inputLabel: new FormControl('', Validators.required),
        validators: new FormControl([])
      })
    );
  }

  onSubmit() {
    console.log(this.formContent.value)
  }

}
