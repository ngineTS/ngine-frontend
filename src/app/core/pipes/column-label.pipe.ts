import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import { CustomFormInput } from '../models/content-management.interface';

/**
 * Generated class for the ColumnLabelPipe pipe.
 */
@Pipe({
  name: 'columnLabelPipe',
})
export class ColumnLabelPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(customFormInputs: Array<CustomFormInput>, columnName: string) {
    return customFormInputs.find(obj => obj.columnName === columnName)?.inputLabel;
  }

}