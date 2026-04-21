import { Injectable } from "@angular/core";
import { ContainerStyle } from "../models/container-style.interface";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { retry, take } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class ContainerStyleService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.APIURL;

  getDefaultContainerStyle() {
    return this._http.get<ContainerStyle>(`${this.baseUrl}container-style/default`)
      .pipe(take(1), retry(1));
  }
  
  setUpContainerStyleForm(
    containerStyle: ContainerStyle,
    skipedProperties?: Array<keyof ContainerStyle>
  ): DeepFormConfig<Partial<ContainerStyle>> {

    const containerStyleFormConfig: DeepFormConfig<Partial<ContainerStyle>> = {
      backgroundColor: {
        value: containerStyle.backgroundColor ?? '#636363',
        alias: 'Background Color',
        order: 1,
        type: 'color',
        validators: [Validators.required]
      },
      backgroundImage: {
        value: containerStyle.backgroundImage ?? null,
        alias: 'Background Image',
        order: 2,
        type: 'file',
        validators: []
      },
      borderColor: {
        value: containerStyle.borderColor ?? null,
        type: 'color',
        alias: 'Border Color',
        order: 3,
        validators: []
      },
      borderStyle: {
        value: containerStyle.borderStyle ?? null,
        alias: 'Border Style',
        order: 4,
        type: 'dropdown',
        dropdownConfig: {
          items: ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'none']
        },
        validators: []
      },
      borderWidth: {
        value: containerStyle.borderWidth ?? null,
        alias: 'Border Width',
        order: 5,
        type: 'number',
        validators: []
      },
      borderTopLeftRadius: {
        value: containerStyle.borderTopLeftRadius ?? 0,
        alias: 'Border Top Left Radius',
        order: 6,
        type: 'number',
        validators: []
      },
      borderTopRightRadius: {
        value: containerStyle.borderTopRightRadius ?? 0,
        alias: 'Border Top Right Radius',
        order: 7,
        type: 'number',
        validators: []
      },
      borderBottomLeftRadius: {
        value: containerStyle.borderBottomLeftRadius ?? 0,
        alias: 'Border Bottom Left Radius',
        order: 8,
        type: 'number',
        validators: []
      },
      borderBottomRightRadius: {
        value: containerStyle.borderBottomRightRadius ?? 0,
        alias: 'Border Bottom Right Radius',
        order: 9,
        type: 'number',
        validators: []
      },
      isBackgroundTransparent: {
        value: containerStyle.isBackgroundTransparent ?? false,
        alias: 'Transparent',
        order: 10,
        type: 'checkbox',
        validators: []
      },
      isBorderTopHidden: {
        value: containerStyle.isBorderTopHidden ?? false,
        alias: 'Hide Top Border',
        order: 11,
        type: 'checkbox',
        validators: []
      },
      isBorderRightHidden: {
        value: containerStyle.isBorderRightHidden ?? false,
        alias: 'Hide Right Border',
        order: 12,
        type: 'checkbox',
        validators: []
      },
      isBorderBottomHidden: {
        value: containerStyle.isBorderBottomHidden ?? false,
        alias: 'Hide Bottom Border',
        order: 13,
        type: 'checkbox',
        validators: []
      },
      isBorderLeftHidden: {
        value: containerStyle.isBorderLeftHidden ?? false,
        alias: 'Hide Left Border',
        order: 14,
        type: 'checkbox',
        validators: []
      },
    }

    if (skipedProperties) {
      skipedProperties.forEach(key => delete containerStyleFormConfig[key]);
    }

    return containerStyleFormConfig;
  }

}