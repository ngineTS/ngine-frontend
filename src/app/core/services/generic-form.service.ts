import { Injectable } from "@angular/core";
import { DropdownConfig2, DropdownInputConfig, InputType, StandardInputConfig } from "../models/form-input.interface";
import { ValidatorFn } from "@angular/forms";

export interface Person {
    job: string;
    //age: number;
    //book: string;
    numberArray: Array<number>;
    //objectArray: Array<{om: string, nad: number}>;
    child: {
      a: number, 
      b: string, 
    };
}

@Injectable({
  providedIn: 'root',
})
export class GenericFormService { 

  lucas: Person = {
      job: 'jgjg',
      //age: 19,
      //book: 'oooo',
      child: {
        a: 1, 
        b: 'b', 
      },
      numberArray: [1, 1, 2]
      //objectArray: [{om: 'allez', nad: 38}, {om: 'yoooo', nad: 14}],
      /*child: { 
        id: 'a',
        name: 'TEXXXXXXXT',
        message: 'this is a test text or generic form',
        navigationId: 'abcdefg'
      }*/
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
    dropdownConfig: DropdownConfig2<T[K], U>
  ): DropdownInputConfig<T[K], U>;
  defineInputFormat<T, K extends keyof T, U>(
    obj: T,
    key: K,
    validators: Array<ValidatorFn>,
    type: InputType,
    dropdownConfig?: DropdownConfig2<T[K], U>
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