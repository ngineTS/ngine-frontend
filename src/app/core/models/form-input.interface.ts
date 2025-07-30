import { ValidatorFn } from "@angular/forms";

export type FormConfig<T> = T extends Record<string, any> 
  ? T extends Array<any>
    ? StandardInputConfig<T> | DropdownInputConfig<T, any>
    : { [K in keyof T]: FormConfig<T[K]> }
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
    dropdownConfig: DropdownConfig2<T, U>
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

export type DropdownConfig2<T, U> = U extends string | number
  ? { 
      items: T extends Array<any> ? T : Array<T>;
      isPrimitive: true;
    }
  : { 
      isPrimitive: false;
      bindValue: T extends Array<infer V> ? V & keyof U : T & keyof U;
      bindLabel: T extends Array<infer V> ? V & keyof U : T & keyof U;
      items: Array<U>;
    }

export type InputType = 'date' | 'email' | 'url' | 'text' | 'password' | 'dropdown' | 'number' | 'range' | 'checkbox' | 'file';

/*
export type OldInputsArray<T> = Array<
    StandardInputConfig<T> |
    DropdownInputConfig<T, any> |
    { [K in keyof T]?: OldInputsArray<T[K]> }
>

export interface OldInputConfig<T> {
    name: keyof T & string;
    value: T[keyof T];
    validators: Array<ValidatorFn>;
}
    */