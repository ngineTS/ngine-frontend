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
    typographyStyle: TypographyStyle
  ): DeepFormConfig<Omit<TypographyStyle, 'id' | 'refId'>> {
    return {
      fontFamily: {
          value: typographyStyle.fontFamily ?? 'Roboto',
          type: 'dropdown',
          dropdownConfig: {
              items: this.availableFonts
          },
          validators: [Validators.required]
      },
      fontSize: {
          value: typographyStyle.fontSize ?? 16,
          type: 'number',
          validators: [Validators.required]
      },
      fontWeight: {
          value: typographyStyle.fontWeight ?? 400,
          type: 'number',
          validators: [Validators.required]
      },
      color: {
          value: typographyStyle.color ?? '#D3D3D3',
          type: 'color',
          validators: [Validators.required]
      },
      activeColor: {
          value: typographyStyle.activeColor ?? '#1E90FF',
          type: 'color',
          validators: [Validators.required]
      }
    }
  }

}