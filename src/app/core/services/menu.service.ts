import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { StylePayload } from "../models/menu.interface";
import { DeepFormConfig, GenericFormDialogData } from "../models/form-input.interface";
import { SideNavService } from "./side-nav.service";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(
        private _http: HttpClient,
        private _sideNavService: SideNavService
    ) {}

    baseURL = environment.APIURL;

    /* Create menu prop by inheriting style of parent menu and add first redirect button. */
    createNavigationBar(navigationId: string) {
        return this._http.get<any>(`${this.baseURL}menu/create-navigation-bar/${navigationId}`)
    }

    /**
     * Pass form configuration to sidenav service.
     * 
     * @param stylePayload The form configuration.
     * @param refId The refId.
     * @param formTitle The form title.
     */
    manageStyle(
        stylePayload: DeepFormConfig<Partial<StylePayload>>,
        refId: string,
        formTitle?: string
    ) {
        const formConfiguration: GenericFormDialogData<Partial<StylePayload>> = {
            hasDeleteButton: false,
            formConfig: stylePayload,
            payloadId: refId,
            controllerName: 'menu',
            formTitle: formTitle
        };

        this._sideNavService.formConfiguration.next(formConfiguration);
    }

}