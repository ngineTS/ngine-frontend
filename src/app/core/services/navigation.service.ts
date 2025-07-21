import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Navigation } from "../models/navigation.interface";
import { environment } from "../../../environments/environment";
import { NavigationType } from "../models/navigation-type.interface";
import { take } from "rxjs";

export type UpdateReturnType = {
    affected: number;
    generatedMaps: Array<unknown>;
    raw: Array<unknown>;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

    constructor(private _http: HttpClient) {}

    /**
     * Get navigations and their children
     * @returns An observable of navigations
     */
    getNestedNavigations() {
        return this._http.get<Navigation[]>(`${environment.APIURL}navigation`).pipe(take(1));
    }

    /**
     * Get all navigation types
     * @returns An observable of navigation types
     */
    getNavigationTypes() {
        return this._http.get<NavigationType[]>(`${environment.APIURL}navigation-type`);
    }

    /**
     * Get flatten navigations
     * @returns An observable of all navigations
     */
    getFlatNavigations() {
        return this._http.get<Navigation[]>(`${environment.APIURL}navigation/flat`);
    }

    /**
     * Save navigations
     * @param navigations to be saved
     * @returns An observable of navigations saved
     */
    saveNavigations(navigations: Navigation[]) {
        return this._http.post<Navigation[]>(`${environment.APIURL}navigation`, navigations).pipe(take(1));
    }

    /**
     * Update given navigation properties
     * @param navigationId The navigation id
     * @param navigationProps An array of navigation properties to update
     * @returns An observable of UpdateReturnType object
     */
    updateNavigation(navigationId: string, navigationProps: Partial<Navigation>) {
        return this._http.patch<UpdateReturnType>(`${environment.APIURL}navigation/${navigationId}`, navigationProps).pipe(take(1));
    }

    /**
     * Delete navigation
     * @param navigationId The navigation id
     * @returns An observable of UpdateReturnType object
     */
    deleteNavigation(navigationId: string) {
        return this._http.delete<UpdateReturnType>(`${environment.APIURL}navigation/${navigationId}`).pipe(take(1));
    }
}