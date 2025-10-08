import { Injectable } from "@angular/core";
import { HeaderBar } from "../models/header-bar.interface";
import { HttpClient } from "@angular/common/http";
import { Observable, take } from "rxjs";
import { environment } from "../../../environments/environment";

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

    getMainHeaderBar(): Observable<HeaderBar> {
        return this._http.get<HeaderBar>(`${environment.APIURL}header-bar/main`);
    }

}
