import { ValidatorFn, Validators } from "@angular/forms";

export interface InputConfig<T> {
    name: keyof T;
    value: T[keyof T];
    validators: Array<ValidatorFn>;
}

export interface StandardInputConfig<T> extends InputConfig<T> {
    type: Exclude<InputType, "dropdown">;
}

export interface DropdownInputConfig<T, U> extends InputConfig<T> {
    type: 'dropdown',
    dropdownConfig: DropdownConfig<U>
}

export type DropdownConfig<T> = T extends string | number | Date
  ? { items: Array<T>; }
  : { 
      bindValue: keyof T;
      bindLabel: keyof T;
      items: Array<T>;
    }

export type InputType = 'date' | 'email' | 'url' | 'text' | 'password' | 'dropdown' | 'number' | 'range' | 'checkbox' | 'file';