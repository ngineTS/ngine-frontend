import { Injectable } from "@angular/core";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";
import { TypographyStyle } from "../models/typography-style.interface";


@Injectable({
    providedIn: 'root',
})
export class TypographyStyleService {

  
  constructor() {}

  availableFonts = [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Oswald',
    'Raleway',
    'Merriweather',
    'Nunito',
    'Ubuntu'
  ];

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