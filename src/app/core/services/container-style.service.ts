import { Injectable } from "@angular/core";
import { ContainerStyle } from "../models/container-style.interface";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";


@Injectable({
    providedIn: 'root',
})
export class ContainerStyleService {


    constructor() { }
  
  setUpContainerStyleForm(
    containerStyle: ContainerStyle
  ): DeepFormConfig<Omit<ContainerStyle, 'id' | 'refId'>> { 

    return {
      backgroundColor: {
          value: containerStyle.backgroundColor ?? '#636363',
          type: 'color',
          validators: [Validators.required]
      },
      borderColor: {
          value: containerStyle.borderColor ?? null,
          type: 'color',
          validators: []
      },
      borderStyle: {
          value: containerStyle.borderStyle ?? null,
          type: 'text',
          validators: []
      },
      borderWidth: {
          value: containerStyle.borderWidth ?? null,
          type: 'number',
          validators: []
      },
      borderTopLeftRadius: {
          value: containerStyle.borderTopLeftRadius ?? 4,
          type: 'number',
          validators: [Validators.required]
      },
      borderTopRightRadius: {
          value: containerStyle.borderTopRightRadius ?? 4,
          type: 'number',
          validators: [Validators.required]
      },
      borderBottomLeftRadius: {
          value: containerStyle.borderBottomLeftRadius ?? 4,
          type: 'number',
          validators: [Validators.required]
      },
      borderBottomRightRadius: {
          value: containerStyle.borderBottomRightRadius ?? 4,
          type: 'number',
          validators: [Validators.required]
      },
      isBorderTopHidden: {
          value: containerStyle.isBorderTopHidden ?? false,
          type: 'checkbox',
          validators: [Validators.required]
      },
      isBorderRightHidden: {
          value: containerStyle.isBorderRightHidden ?? false,
          type: 'checkbox',
          validators: [Validators.required]
      },
      isBorderBottomHidden: {
          value: containerStyle.isBorderBottomHidden ?? false,
          type: 'checkbox',
          validators: [Validators.required]
      },
      isBorderLeftHidden: {
          value: containerStyle.isBorderLeftHidden ?? false,
          type: 'checkbox',
          validators: [Validators.required]
      }
    }
  }

}