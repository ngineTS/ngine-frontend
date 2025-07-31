import { ValidatorFn } from "@angular/forms";

export type DeepFormConfig<T> = T extends Record<string, any> 
  ? T extends Array<any>
    ? StandardInputConfig<T> | DropdownInputConfig<T, any>
    : { [K in keyof T]: DeepFormConfig<T[K]> }
  : StandardInputConfig<T> | DropdownInputConfig<T, any>

export type InputConfig<T> = {
    value: T | null;
    validators: Array<ValidatorFn>;
}

export interface StandardInputConfig<T> extends InputConfig<T> {
    type: Exclude<InputType, "dropdown">;
}

export interface DropdownInputConfig<T, U> extends InputConfig<T> {
    type: 'dropdown',
    dropdownConfig: DropdownConfig<T, U>
}

export type DropdownConfig<T, U> = U extends string | number
  ? { 
      items: T extends Array<any> ? T : Array<T>;
      isPrimitive: true;
    }
  : { 
      isPrimitive: false;
      bindValue: T extends Array<infer V>
       ? { [K in keyof U]: U[K] extends V ? K : never }[keyof U]
       : { [K in keyof U]: U[K] extends T ? K : never }[keyof U];
      bindLabel: keyof U;
      items: Array<U>;
    }

export type InputType = 'date' | 'email' | 'url' | 'text' | 'password' | 'dropdown' | 'number' | 'range' | 'checkbox' | 'file';
