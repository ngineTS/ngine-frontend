import { ValidatorFn } from "@angular/forms";

export type InputsArray<T> = Array<
    StandardInputConfig<T> |
    DropdownInputConfig<T, any> |
    { [K in keyof T]?: InputsArray<T[K]> }
>

export interface InputConfig<T> {
    name: keyof T & string;
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

export type DropdownConfig<T> = T extends string | number
  ? { 
      items: Array<T>;
      isPrimitive: true;
    }
  : { 
      isPrimitive: false;
      bindValue: keyof T;
      bindLabel: keyof T;
      items: Array<T>;
    }

export type InputType = 'date' | 'email' | 'url' | 'text' | 'password' | 'dropdown' | 'number' | 'range' | 'checkbox' | 'file';