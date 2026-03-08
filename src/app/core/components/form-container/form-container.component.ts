import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GenericFormDialogData } from '../../models/form-input.interface';
import { GenericFormComponent } from '../generic-form/generic-form.component';

@Component({
  selector: 'app-form-container',
  imports: [GenericFormComponent],
  templateUrl: './form-container.component.html',
  styleUrl: './form-container.component.scss'
})
export class FormContainerComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public _data: GenericFormDialogData<Record<string, any>>,
    private _dialogRef: MatDialogRef<FormContainerComponent>,
  ) { }

  action(event: 'added' | 'edited' | 'deleted') {
    console.log(event);
    this._dialogRef.close(event);
  }

  onFormValueChange(event: Record<string, any>) {
    console.log(event);
  }

}
