import { Injectable } from "@angular/core";
import { HeaderBar, HeaderBarPayload } from "../models/header-bar.interface";
import { HttpClient } from "@angular/common/http";
import { Observable, retry, take } from "rxjs";
import { environment } from "../../../environments/environment";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";
import { Menu, MenuPayload } from "../models/menu.interface";

@Injectable({
    providedIn: 'root',
})
export class HeaderBarService { 

    constructor(private _http: HttpClient) {}

    headerBarFonts = [
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

    boostrapIconNamesList = ['person', 'person-circle',
        'person-gear', 'person-vcard', 'people', 'gear', 'key', 'list', 'grid', 'house',
        'compass', 'bell', 'chat', 'chat-dots', 'envelope', 'megaphone', 'heart', 'hand-thumbs-up', 
        'share', 'bookmark', 'search', 'filter', 'funnel', 'sliders', 'pencil', 'trash', 
        'arrow-repeat', 'arrow-clockwise', 'download', 'upload', 'moon', 'sun', 'circle-half',
        'palette', 'globe', 'flag', 'translate', 'lock', 'unlock', 'shield','shield-lock', 'cart',
        'bag', 'calendar', 'clock', 'info-circle', 'question-circle', 'award', 'trophy', 'star', 'patch-check',
        'graph-up', 'bar-chart', 'speedometer', 'activity', 'clock-history', 'chat-left-text', 'chat-heart',
        'inbox', 'reply', 'send', 'tools', 'wrench', 'layout-text-window', 'life-preserver', 'card-image',
        'database', 'cloud', 'film', 'rocket-takeoff', 'fork-knife', 'suitcase', 'globe-americas', 'geo'
    ];

    /**
     * Set up header bar form.
     * @param headerBar The header bar object to edit. If nothing is passed it means we are in addition mode.
     * @returns 
     */
    setUpHeaderBarForm(menu?: Menu): DeepFormConfig<MenuPayload> {
        return {

            containerLayout: {
                width: {
                    value: menu?.containerLayout.width ?? null,
                    type: 'number',
                    validators: []
                },
                height: {
                    value: menu?.containerLayout.height ?? 50,
                    type: 'number',
                    validators: [Validators.required]
                },
                marginTop: {
                    value: menu?.containerLayout.marginTop ?? 0,
                    type: 'number',
                    validators: []
                },
                marginRight: {
                    value: menu?.containerLayout.marginRight ?? 0,
                    type: 'number',
                    validators: []
                },
                marginBottom: {
                    value: menu?.containerLayout.marginBottom ?? 0,
                    type: 'number',
                    validators: []
                },
                marginLeft: {
                    value: menu?.containerLayout.marginLeft ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingTop: {
                    value: menu?.containerLayout.paddingTop ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingRight: {
                    value: menu?.containerLayout.paddingRight ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingBottom: {
                    value: menu?.containerLayout.paddingBottom ?? 0,
                    type: 'number',
                    validators: []
                },
                paddingLeft: {
                    value: menu?.containerLayout.paddingLeft ?? 0,
                    type: 'number',
                    validators: []
                },
                gap: {
                    value: menu?.containerLayout.gap ?? 20,
                    type: 'number',
                    validators: []
                }
            },
            containerStyle: {
                backgroundColor: {
                    value: menu?.containerStyle.backgroundColor ?? '#636363',
                    type: 'color',
                    validators: [Validators.required]
                },
                borderColor: {
                    value: menu?.containerStyle.borderColor ?? null,
                    type: 'color',
                    validators: []
                },
                borderStyle: {
                    value: menu?.containerStyle.borderStyle ?? null,
                    type: 'text',
                    validators: []
                },
                borderWidth: {
                    value: menu?.containerStyle.borderWidth ?? null,
                    type: 'number',
                    validators: []
                },
                borderTopLeftRadius: {
                    value: menu?.containerStyle.borderTopLeftRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderTopRightRadius: {
                    value: menu?.containerStyle.borderTopRightRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderBottomLeftRadius: {
                    value: menu?.containerStyle.borderBottomLeftRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                borderBottomRightRadius: {
                    value: menu?.containerStyle.borderBottomRightRadius ?? 4,
                    type: 'number',
                    validators: [Validators.required]
                },
                isBorderTopHidden: {
                    value: menu?.containerStyle.isBorderTopHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderRightHidden: {
                    value: menu?.containerStyle.isBorderRightHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderBottomHidden: {
                    value: menu?.containerStyle.isBorderBottomHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                },
                isBorderLeftHidden: {
                    value: menu?.containerStyle.isBorderLeftHidden ?? false,
                    type: 'checkbox',
                    validators: [Validators.required]
                }
            },
            typographyStyle: {
                fontFamily: {
                    value: menu?.typographyStyle.fontFamily ?? 'Roboto',
                    type: 'dropdown',
                    dropdownConfig: {
                        items: this.headerBarFonts
                    },
                    validators: [Validators.required]
                },
                fontSize: {
                    value: menu?.typographyStyle.fontSize ?? 16,
                    type: 'number',
                    validators: [Validators.required]
                },
                fontWeight: {
                    value: menu?.typographyStyle.fontWeight ?? 400,
                    type: 'number',
                    validators: [Validators.required]
                },
                color: {
                    value: menu?.typographyStyle.color ?? '#D3D3D3',
                    type: 'color',
                    validators: [Validators.required]
                },
                activeColor: {
                    value: menu?.typographyStyle.activeColor ?? '#1E90FF',
                    type: 'color',
                    validators: [Validators.required]
                }
            }
        }
    }

}
