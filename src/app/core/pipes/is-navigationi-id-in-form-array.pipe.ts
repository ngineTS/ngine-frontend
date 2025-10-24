import { Pipe, PipeTransform } from '@angular/core';
import { FormArray } from '@angular/forms';

/**
 * Generated class for the IsNavigationIdInFormArrayPipe pipe.
 * 
 * Detect if a navigationId is selected inside form array controls.
 */
@Pipe({
  name: 'isNavigationIdInFormArray',
})
export class IsNavigationIdInFormArrayPipe implements PipeTransform {

  constructor() {}

  transform(navigationId: string, formArray: FormArray): boolean {
    const isSelected = formArray.controls.find(obj => obj.value['navigationId'] === navigationId);
    return isSelected ? true : false;
  }

}