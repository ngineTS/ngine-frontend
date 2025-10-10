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

    totalHeaderHeight: number = 0;

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
