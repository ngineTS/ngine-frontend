import { Injectable } from "@angular/core";
import { DropdownConfig, DropdownInputConfig, InputType, StandardInputConfig } from "../models/form-input.interface";
import { ValidatorFn, Validators } from "@angular/forms";

export interface Person {
    job: string;
    age: number;
    book: string;
}

@Injectable({
  providedIn: 'root',
})
export class GenericFormService { 

    lucas: Person = {
        job: 'a',
        age: 19,
        book: 'oooo'
    }

    defineInputFormat<T, K extends keyof T, U>(
      obj: T,
      key: K,
      validators: Array<ValidatorFn>,
      type: "dropdown",
      dropdownConfig: DropdownConfig<U>
    ): DropdownInputConfig<T, U>;
    defineInputFormat<T, K extends keyof T>(
      obj: T,
      key: K,
      validators: Array<ValidatorFn>,
      type: Exclude<InputType, "dropdown">
    ): StandardInputConfig<T>;
    defineInputFormat<T, K extends keyof T, U>(
      obj: T,
      key: K,
      validators: Array<ValidatorFn>,
      type: InputType,
      dropdownConfig?: DropdownConfig<U>
    ): DropdownInputConfig<T, U> | StandardInputConfig<T> {
      if (type === "dropdown") {
        return {
          name: key,
          value: obj[key],
          validators,
          type,
          dropdownConfig
        } as DropdownInputConfig<T, U>
      } 
      else {
        return {
          name: key,
          value: obj[key],
          validators,
          type,
        }
      }
    }

}