import { Injectable } from "@angular/core";
import { DropdownConfig, DropdownInputConfig, InputType, StandardInputConfig } from "../models/form-input.interface";
import { ValidatorFn } from "@angular/forms";

export interface Person {
    job: string;
    book: string;
    numberArray: Array<number>;
    child: {
      a: number | null, 
      b: string, 
      grCh: {
        c: number,
        d: string,
      }
    };
}

@Injectable({
  providedIn: 'root',
})
export class GenericFormService { 

  lucas: Person = {
      job: 'jgjg',
      //age: 19,
      book: 'a2',
      child: {
        a: null, 
        b: 'b', 
        grCh: {
          c: 1, 
          d: 'd', 
      },
      },
      numberArray: [1, 1, 2]
      //objectArray: [{om: 'allez', nad: 38}, {om: 'yoooo', nad: 14}],
  }

  defineInputFormat<T, K extends keyof T>(
    obj: T,
    key: K,
    validators: Array<ValidatorFn>,
    type: Exclude<InputType, "dropdown">
  ): StandardInputConfig<T[K]>;
  defineInputFormat<T, K extends keyof T, U>(
    obj: T,
    key: K,
    validators: Array<ValidatorFn>,
    type: "dropdown",
    dropdownConfig: DropdownConfig<T[K], U>
  ): DropdownInputConfig<T[K], U>;
  defineInputFormat<T, K extends keyof T, U>(
    obj: T,
    key: K,
    validators: Array<ValidatorFn>,
    type: InputType,
    dropdownConfig?: DropdownConfig<T[K], U>
  ): DropdownInputConfig<T[K], U> | StandardInputConfig<T[K]> {
    if (type === "dropdown") {
      return {
        value: obj[key],
        validators,
        type,
        dropdownConfig
      } as DropdownInputConfig<T[K], U>
    } 
    else {
      return {
        value: obj[key],
        validators,
        type,
      }
    }
  }


}