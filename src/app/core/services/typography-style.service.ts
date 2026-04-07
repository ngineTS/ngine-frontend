import { Injectable } from "@angular/core";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";
import { TypographyStyle } from "../models/typography-style.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { pipe, retry, take } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class TypographyStyleService {

  
  constructor(private _http: HttpClient) { }

  baseUrl = environment.APIURL;
  availableFonts = [
    'Lato',
    'Merriweather',
    'Montserrat',
    'Open Sans',
    'Oswald',
    'Poppins',
    'Raleway',
    'Nunito',
    'Roboto',
    'Ubuntu'
  ];

  getDefaultTypographyStyle() {
    return this._http.get<TypographyStyle>(`${this.baseUrl}typography-style/default`)
      .pipe(take(1), retry(1));
  }

  setUpTypographyStyleForm(
    typographyStyle: TypographyStyle,
    skipedProperties?: Array<keyof TypographyStyle>
  ): DeepFormConfig<Partial<TypographyStyle>> {

    const typographyStyleFormConfig: DeepFormConfig<Partial<TypographyStyle>> = {
      fontFamily: {
          value: typographyStyle.fontFamily ?? 'Roboto',
          alias: 'Font Family',
          type: 'dropdown',
          dropdownConfig: {
              items: this.availableFonts
          },
          validators: [Validators.required]
      },
      fontSize: {
          value: typographyStyle.fontSize ?? 16,
          alias: 'Font Size',
          type: 'number',
          validators: [Validators.required]
      },
      fontWeight: {
          value: typographyStyle.fontWeight ?? 400,
          alias: 'Font Weight',
          type: 'number',
          validators: [Validators.required]
      },
      color: {
          value: typographyStyle.color ?? '#D3D3D3',
          alias: 'Color',
          type: 'color',
          validators: [Validators.required]
      },
      activeColor: {
          value: typographyStyle.activeColor ?? '#1E90FF',
          alias: 'Active Color',
          type: 'color',
          validators: [Validators.required]
      }
    }

    if (skipedProperties) {
      skipedProperties.forEach(key => delete typographyStyleFormConfig[key]);
    }

    return typographyStyleFormConfig;
  }

}