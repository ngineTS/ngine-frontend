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
      color: {
          value: typographyStyle.color ?? '#D3D3D3',
          alias: 'Color',
          order: 1,
          type: 'color',
          validators: [Validators.required]
      },
      activeColor: {
          value: typographyStyle.activeColor ?? '#1E90FF',
          alias: 'Active Color',
          order: 2,
          type: 'color',
          validators: [Validators.required]
      },
      fontSize: {
          value: typographyStyle.fontSize ?? 16,
          alias: 'Font Size',
          order: 3,
          type: 'number',
          validators: [Validators.required]
      },
      fontFamily: {
          value: typographyStyle.fontFamily ?? 'Roboto',
          alias: 'Font Family',
          order: 4,
          type: 'dropdown',
          dropdownConfig: {
              items: this.availableFonts
          },
          validators: [Validators.required]
      },
      fontWeight: {
          value: typographyStyle.fontWeight ?? 400,
          alias: 'Font Weight',
          order: 5,
          type: 'number',
          validators: [Validators.required]
      },
    }

    if (skipedProperties) {
      skipedProperties.forEach(key => delete typographyStyleFormConfig[key]);
    }

    return typographyStyleFormConfig;
  }

}