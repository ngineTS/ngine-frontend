import { ValidatorFn } from "@angular/forms";

export type DeepFormConfig<T> = T extends Record<string, any> 
  ? T extends Array<any> | Date
    ? StandardInputConfig<T> | DropdownInputConfig<T, any>
    : { [K in keyof T]: DeepFormConfig<T[K]> }
  : StandardInputConfig<T> | DropdownInputConfig<T, any>

export type InputConfig<T> = {
    value: T;
    alias?: string;
    validators: Array<ValidatorFn>;
}

/**
 * Type of standard input config.
 * 
 * T is the type of the input value.
 */
export interface StandardInputConfig<T> extends InputConfig<T> {
    type: Exclude<InputType, "dropdown">;
}

/**
 * Type of dropdown input config.
 * 
 * T is the type of the input value.
 * 
 * U is the type of the dropdown items.
 */
export interface DropdownInputConfig<T, U> extends InputConfig<T> {
    type: 'dropdown',
    dropdownConfig: DropdownConfig<T, U>
}

export type DropdownConfig<T, U> = U extends string | number
  ? { 
      items: T extends Array<any> ? T : Array<T>;
    }
  : { 
      bindValue: T extends Array<infer V>
       ? { [K in keyof U]: U[K] extends V ? K : never }[keyof U]
       : { [K in keyof U]: U[K] extends T ? K : never }[keyof U];
      bindLabel: keyof U;
      items: Array<U>;
    }

export type InputType = 'email' | 'url' | 'text' | 'password' | 'number' | 'date' | 'date-and-time' | 'dropdown' | 'checkbox' | 'file' | 'textarea' | 'color';

export type GenericFormDialogData<T> = {
  payloadId: string;
  navigationId: string;
  formConfig: DeepFormConfig<T>;
  controllerName: string;
  formTitle: string;
  hasDeleteButton: boolean;
}
