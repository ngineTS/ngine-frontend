import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Validators } from "@angular/forms";
import { ContainerLayout } from "../models/container-layout.interface";
import { ContainerStyle } from "../models/container-style.interface";
import { TypographyStyle } from "../models/typography-style.interface";
import { StylePayload } from "../models/menu.interface";
import { DeepFormConfig } from "../models/form-input.interface";
import { GenericFormComponent } from "../components/generic-form/generic-form.component";
import { AppService } from "./app.service";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(
        private _http: HttpClient,
        private _matDialog: MatDialog,
        private _appService: AppService,
        private _router: Router,
    ) {}

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
    setupStyleForm(stylePayload: Partial<StylePayload>): DeepFormConfig<Partial<StylePayload>> {
        let styleForm: DeepFormConfig<Partial<StylePayload>> = {};

        if (stylePayload.containerLayout) {
            styleForm.containerLayout = {
                width: {
                    value: stylePayload.containerLayout.width ?? null,
                    type: 'number',
                    validators: []
                },
                height: {
                    value: stylePayload.containerLayout.height ?? 50,
                    type: 'number',
                    validators: [Validators.required]
                },
                marginTop: {
                    value: stylePayload.containerLayout.marginTop ?? 0,
                    type: 'number',
                    validators: []
                },
                marginRight: {
                    value: stylePayload.containerLayout.marginRight ?? 0,
                    type: 'number',
                    validators: []
                },
                marginBottom: {
                    value: stylePayload.containerLayout.marginBottom ?? 0,
                    type: 'number',
                    validators: []
                },
                marginLeft: {
                    value: stylePayload.containerLayout.marginLeft ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingTop: {
                    value: stylePayload.containerLayout.paddingTop ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingRight: {
                    value: stylePayload.containerLayout.paddingRight ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingBottom: {
                    value: stylePayload.containerLayout.paddingBottom ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingLeft: {
                    value: stylePayload.containerLayout.paddingLeft ?? 0,
                    type: 'number',
                    validators: []
                },
                gap: {
                    value: stylePayload.containerLayout.gap ?? 20,
                    type: 'number',
                    validators: []
                },
                xPos: {
                    value: stylePayload.containerLayout.xPos ?? null,
                    type: 'number',
                    validators: []
                },
                yPos: {
                    value: stylePayload.containerLayout.yPos ?? null,
                    type: 'number',
                    validators: []
                },
            }
        }

        if (stylePayload.containerStyle) {
            styleForm.containerStyle = {
                backgroundColor: {
                    value: stylePayload.containerStyle.backgroundColor ?? '#636363',
                    type: 'color',
                    validators: [Validators.required]
                },
                borderColor: {
                    value: stylePayload.containerStyle.borderColor ?? null,
                    type: 'color',
                    validators: []
                },
                borderStyle: {
                    value: stylePayload.containerStyle.borderStyle ?? null,
                    type: 'text',
                    validators: []
                },
                borderWidth: {
                    value: stylePayload.containerStyle.borderWidth ?? null,
                    type: 'number',
                    validators: []
                },
                borderTopLeftRadius: {
                    value: stylePayload.containerStyle.borderTopLeftRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderTopRightRadius: {
                    value: stylePayload.containerStyle.borderTopRightRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderBottomLeftRadius: {
                    value: stylePayload.containerStyle.borderBottomLeftRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderBottomRightRadius: {
                    value: stylePayload.containerStyle.borderBottomRightRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                isBorderTopHidden: {
                    value: stylePayload.containerStyle.isBorderTopHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderRightHidden: {
                    value: stylePayload.containerStyle.isBorderRightHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderBottomHidden: {
                    value: stylePayload.containerStyle.isBorderBottomHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderLeftHidden: {
                    value: stylePayload.containerStyle.isBorderLeftHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                }
            }
        }

        if (stylePayload.typographyStyle) {
            styleForm.typographyStyle = {
                fontFamily: {
                    value: stylePayload.typographyStyle.fontFamily ?? 'Roboto',
                    type: 'dropdown',
                    dropdownConfig: {
                        items: this.availableFonts
                    },
                    validators: [Validators.required]
                },
                fontSize: {
                    value: stylePayload.typographyStyle.fontSize ?? 16,
                    type: 'number',
                    validators: [Validators.required]
                },
                fontWeight: {
                    value: stylePayload.typographyStyle.fontWeight ?? 400,
                    type: 'number',
                    validators: [Validators.required]
                },
                color: {
                    value: stylePayload.typographyStyle.color ?? '#D3D3D3',
                    type: 'color',
                    validators: [Validators.required]
                },
                activeColor: {
                    value: stylePayload.typographyStyle.activeColor ?? '#1E90FF',
                    type: 'color',
                    validators: [Validators.required]
                }
            }
        }

        return styleForm;
    }

    /**
     * Open form to manage object style.
     * 
     * @param stylePayload The style properties.
     * @param refId The object ref id (not the style id).
     */
    manageStyle(stylePayload: Partial<StylePayload>, refId: string) {
        const styleForm = this.setupStyleForm(stylePayload);

        const matDialogRef = this._matDialog.open(
            GenericFormComponent<StylePayload>,
            { 
                maxWidth: '700px',
                data: {
                hasDeleteButton: false,
                formConfig: styleForm,
                id: refId,
                controllerName: 'menu',
                }
            }
        );

        matDialogRef.afterClosed().subscribe((resp: string) => {
            if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
                this._appService.createAppRouting(this._router.url);
                
            }
        });
    }

}