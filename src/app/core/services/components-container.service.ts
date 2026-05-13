import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class ComponentsContainerService {

    constructor() {}

    /** 
     * The active components container width in px.
     * 
     * It is used in navigation component to make the box fit the full available width 
     * via the 'full screen' button.
     */
    currentWidth: number | undefined;

    /**
     * The user global navigation permission.
     */
    userGlobalNavigationPermission: string | undefined;
}