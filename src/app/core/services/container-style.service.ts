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
        type: 'color',
        validators: [Validators.required]
      },
      borderColor: {
        value: containerStyle.borderColor ?? null,
        type: 'color',
        alias: 'Border Color',
        validators: []
      },
      borderStyle: {
        value: containerStyle.borderStyle ?? null,
        alias: 'Border Style',
        type: 'text',
        validators: []
      },
      borderWidth: {
        value: containerStyle.borderWidth ?? null,
        alias: 'Border Width',
        type: 'number',
        validators: []
      },
      borderTopLeftRadius: {
        value: containerStyle.borderTopLeftRadius ?? 0,
        alias: 'Border Top Left Radius',
        type: 'number',
        validators: [Validators.required]
      },
      borderTopRightRadius: {
        value: containerStyle.borderTopRightRadius ?? 0,
        alias: 'Border Top Right Radius',
        type: 'number',
        validators: [Validators.required]
      },
      borderBottomLeftRadius: {
        value: containerStyle.borderBottomLeftRadius ?? 0,
        alias: 'Border Bottom Left Radius',
        type: 'number',
        validators: [Validators.required]
      },
      borderBottomRightRadius: {
        value: containerStyle.borderBottomRightRadius ?? 0,
        alias: 'Border Bottom Right Radius',
        type: 'number',
        validators: [Validators.required]
      },
      isBorderTopHidden: {
        value: containerStyle.isBorderTopHidden ?? false,
        alias: 'Hide Top Border',
        type: 'checkbox',
        validators: [Validators.required]
      },
      isBorderRightHidden: {
        value: containerStyle.isBorderRightHidden ?? false,
        alias: 'Hide Right Border',
        type: 'checkbox',
        validators: [Validators.required]
      },
      isBorderBottomHidden: {
        value: containerStyle.isBorderBottomHidden ?? false,
        alias: 'Hide Bottom Border',
        type: 'checkbox',
        validators: [Validators.required]
      },
      isBorderLeftHidden: {
        value: containerStyle.isBorderLeftHidden ?? false,
        alias: 'Hide Left Border',
        type: 'checkbox',
        validators: [Validators.required]
      },
      backgroundImage: {
        value: containerStyle.backgroundImage ?? null,
        alias: 'Background Image',
        type: 'file',
        validators: []
      }
    }

    if (skipedProperties) {
      skipedProperties.forEach(key => delete containerStyleFormConfig[key]);
    }

    return containerStyleFormConfig;
  }

}