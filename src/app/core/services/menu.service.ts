import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Validators } from "@angular/forms";
import { ContainerLayout } from "../models/container-layout.interface";
import { ContainerStyle } from "../models/container-style.interface";
import { TypographyStyle } from "../models/typography-style.interface";
import { StylePayload } from "../models/menu.interface";
import { DeepFormConfig } from "../models/form-input.interface";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(private _http: HttpClient) {}

    baseURL = environment.APIURL;
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

    /* Create menu prop by inheriting style of parent menu and add first redirect button. */
    createNavigationBar(navigationId: string) {
        return this._http.get<any>(`${this.baseURL}menu/create-navigation-bar/${navigationId}`)
    }

    /**
     * Set up style form.
     * @param styleInformation The style information to edit.
     * @returns A DeepFormConfig of style information.
     */
    setupStyleForm(styleInformation: {
        containerLayout: ContainerLayout;
        containerStyle: ContainerStyle;
        typographyStyle: TypographyStyle;
    }): DeepFormConfig<StylePayload> {
        return {
            containerLayout: {
                width: {
                    value: styleInformation.containerLayout.width ?? null,
                    type: 'number',
                    validators: []
                },
                height: {
                    value: styleInformation.containerLayout.height ?? 50,
                    type: 'number',
                    validators: [Validators.required]
                },
                marginTop: {
                    value: styleInformation.containerLayout.marginTop ?? 0,
                    type: 'number',
                    validators: []
                },
                marginRight: {
                    value: styleInformation.containerLayout.marginRight ?? 0,
                    type: 'number',
                    validators: []
                },
                marginBottom: {
                    value: styleInformation.containerLayout.marginBottom ?? 0,
                    type: 'number',
                    validators: []
                },
                marginLeft: {
                    value: styleInformation.containerLayout.marginLeft ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingTop: {
                    value: styleInformation.containerLayout.paddingTop ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingRight: {
                    value: styleInformation.containerLayout.paddingRight ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingBottom: {
                    value: styleInformation.containerLayout.paddingBottom ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingLeft: {
                    value: styleInformation.containerLayout.paddingLeft ?? 0,
                    type: 'number',
                    validators: []
                },
                gap: {
                    value: styleInformation.containerLayout.gap ?? 20,
                    type: 'number',
                    validators: []
                }
            },
            containerStyle: {
                backgroundColor: {
                    value: styleInformation.containerStyle.backgroundColor ?? '#636363',
                    type: 'color',
                    validators: [Validators.required]
                },
                borderColor: {
                    value: styleInformation.containerStyle.borderColor ?? null,
                    type: 'color',
                    validators: []
                },
                borderStyle: {
                    value: styleInformation.containerStyle.borderStyle ?? null,
                    type: 'text',
                    validators: []
                },
                borderWidth: {
                    value: styleInformation.containerStyle.borderWidth ?? null,
                    type: 'number',
                    validators: []
                },
                borderTopLeftRadius: {
                    value: styleInformation.containerStyle.borderTopLeftRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderTopRightRadius: {
                    value: styleInformation.containerStyle.borderTopRightRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderBottomLeftRadius: {
                    value: styleInformation.containerStyle.borderBottomLeftRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderBottomRightRadius: {
                    value: styleInformation.containerStyle.borderBottomRightRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                isBorderTopHidden: {
                    value: styleInformation.containerStyle.isBorderTopHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderRightHidden: {
                    value: styleInformation.containerStyle.isBorderRightHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderBottomHidden: {
                    value: styleInformation.containerStyle.isBorderBottomHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderLeftHidden: {
                    value: styleInformation.containerStyle.isBorderLeftHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                }
            },
            typographyStyle: {
                fontFamily: {
                    value: styleInformation.typographyStyle.fontFamily ?? 'Roboto',
                    type: 'dropdown',
                    dropdownConfig: {
                        items: this.availableFonts
                    },
                    validators: [Validators.required]
                },
                fontSize: {
                    value: styleInformation.typographyStyle.fontSize ?? 16,
                    type: 'number',
                    validators: [Validators.required]
                },
                fontWeight: {
                    value: styleInformation.typographyStyle.fontWeight ?? 400,
                    type: 'number',
                    validators: [Validators.required]
                },
                color: {
                    value: styleInformation.typographyStyle.color ?? '#D3D3D3',
                    type: 'color',
                    validators: [Validators.required]
                },
                activeColor: {
                    value: styleInformation.typographyStyle.activeColor ?? '#1E90FF',
                    type: 'color',
                    validators: [Validators.required]
                }
            }
        }
    }

}