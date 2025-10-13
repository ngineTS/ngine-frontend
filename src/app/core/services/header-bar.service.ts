import { Injectable } from "@angular/core";
import { HeaderBar, HeaderBarPayload } from "../models/header-bar.interface";
import { HttpClient } from "@angular/common/http";
import { Observable, take } from "rxjs";
import { environment } from "../../../environments/environment";
import { DeepFormConfig } from "../models/form-input.interface";
import { Validators } from "@angular/forms";

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

    getMainHeaderBar(): Observable<HeaderBar> {
        return this._http.get<HeaderBar>(`${environment.APIURL}header-bar/main`);
    }

    /**
     * Set up header bar form.
     * @param headerBar The header bar object to edit. If nothing is passed it means we are in addition mode.
     * @returns 
     */
    setUpHeaderBarForm(headerBar?: HeaderBar): DeepFormConfig<HeaderBarPayload> {
        return {
            imageName: {
                value: headerBar?.imageName ?? '',
                type: 'file',
                validators: []
            },
            backgroundColor: {
                value: headerBar?.backgroundColor ?? '',
                type: 'color',
                validators: [Validators.required]
            },
            borderBottom: {
                value: headerBar?.borderBottom ?? 0,
                type: 'number',
                validators: []
            },
            gap: {
                value: headerBar?.gap ?? 10,
                type: 'number',
                validators: [Validators.required]
            },
            fontFamily: {
                value: headerBar?.fontFamily ?? 'Roboto',
                type: 'dropdown',
                dropdownConfig: {
                items: this.headerBarFonts
                },
                validators: [Validators.required]
            },
            fontSize: {
                value: headerBar?.fontSize ?? 16,
                type: 'number',
                validators: [Validators.required]
            },
            color: {
                value: headerBar?.color ?? '',
                type: 'color',
                validators: [Validators.required]
            },
            activeColor: {
                value: headerBar?.activeColor ?? '',
                type: 'color',
                validators: [Validators.required]
            },
            height: {
                value: headerBar?.height ?? 50,
                type: 'number',
                validators: [Validators.required]
            },
            isVisibleDuringNavigation: {
                value: headerBar?.isVisibleDuringNavigation ?? true,
                type: 'checkbox',
                validators: [Validators.required]
            },
        }
    }

}
