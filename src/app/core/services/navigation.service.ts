import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

    constructor(private _http: HttpClient) {}

    /**
     * Save navigations
     * @param navigations to be saved
     * @returns navigations saved
     */
    saveNavigations(navigations: Navigation[]) {
        return this._http.post<Navigation[]>(`${environment.APIURL}navigation`, navigations);
    }

    /**
     * Update given navigation properties
     * @param navigationProps An array of navigation properties to update
     * @returns something to define
     */
    updateNavigation(navigationProps: Partial<Navigation>) {
        return this._http.put(`${environment.APIURL}navigation`, navigationProps);
    }
}