import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { environment } from "../../../environments/environment";
import { NavigationType } from "../models/navigation-type.interface";
import { retry, take } from "rxjs";

export type UpdateReturnType = {
    affected: number;
    generatedMaps: Array<unknown>;
    raw: Array<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

    constructor(private _http: HttpClient) { }

    /**
     * Get navigations and their children.
     * @returns An observable of navigations.
     */
    getNestedNavigations() {
        return this._http.get<Navigation[]>(`${environment.APIURL}navigation`).pipe(retry(2), take(1));
    }

    /**
     * Get all navigation types.
     * @returns An observable of navigation types.
     */
    getNavigationTypes() {
        return this._http.get<NavigationType[]>(`${environment.APIURL}navigation-type`);
    }

    /**
     * Get flatten navigations.
     * @returns An observable of all navigations and their children.
     */
    getFlatNavigations() {
        return this._http.get<Navigation[]>(`${environment.APIURL}navigation/flat`);
    }

    /**
     * Save navigations.
     * @param navigations The navigations to save.
     * @returns An observable of the navigation saved.
     */
    saveNavigation(navigations: Navigation) {
        return this._http.post<Navigation>(`${environment.APIURL}navigation`, navigations);
    }

    /**
     * Update navigation properties.
     * @param navigationId The navigation id to update.
     * @param navigationProps The navigation properties to update.
     * @returns An observable of UpdateReturnType object.
     */
    updateNavigation(navigationId: string, navigationProps: Partial<Navigation>) {
        return this._http.patch<UpdateReturnType>(`${environment.APIURL}navigation/${navigationId}`, navigationProps);
    }

    /**
     * Update array of navigation properties.
     * @param navigationsProps Array of navigation properties to update.
     * @returns Array of navigation properties updated.
     */
    bulkUpdateNavigations(navigationsProps: Array<Partial<Navigation>>) {
        return this._http.post<Partial<Navigation>[]>(`${environment.APIURL}navigation/bulk-update`, navigationsProps)
            .pipe(retry(2), take(1));
    }

    /**
     * Delete navigation and children.
     * @param navigationId The navigation to delete.
     * @returns An observable of UpdateReturnType object.
     */
    deleteNavigationAndChildren(navigation: Navigation) {
        return this._http.post(`${environment.APIURL}navigation/delete`, navigation);
    }

}