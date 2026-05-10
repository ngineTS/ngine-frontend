import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(private _http: HttpClient) { }

    baseURL = environment.APIURL;

    /* Create menu prop by inheriting style of parent menu and add first redirect button. */
    createNavigationBar(navigationId: string, navigationTypeBar: 'horizontal' | 'vertical') {
        return this._http.get<any>(`${this.baseURL}menu/create-navigation-bar/${navigationId}/${navigationTypeBar}`)
    }

}