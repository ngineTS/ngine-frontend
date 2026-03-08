import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { StylePayload } from "../models/menu.interface";
import { DeepFormConfig, GenericFormDialogData } from "../models/form-input.interface";
import { AppService } from "./app.service";
import { Router } from "@angular/router";
import { SideNavService } from "./side-nav.service";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(
        private _http: HttpClient,
        private _appService: AppService,
        private _router: Router,
        private _sideNavService: SideNavService
    ) {}

    baseURL = environment.APIURL;

    /* Create menu prop by inheriting style of parent menu and add first redirect button. */
    createNavigationBar(navigationId: string) {
        return this._http.get<any>(`${this.baseURL}menu/create-navigation-bar/${navigationId}`)
    }

    /**
     * Open form to manage object style.
     * 
     * @param stylePayload The style properties.
     * @param refId The object ref id (not the style id).
     */
    manageStyle(stylePayload: DeepFormConfig<Partial<StylePayload>>, refId: string) {

        const formConfiguration: GenericFormDialogData<Partial<StylePayload>> = {
            hasDeleteButton: false,
            formConfig: stylePayload,
            payloadId: refId,
            controllerName: 'menu',
        };

        this._sideNavService.formConfiguration.next(formConfiguration);

        /*const matDialogRef = this._matDialog.open(
            FormContainerComponent,
            { 
                maxWidth: '700px',
                data: {
                    hasDeleteButton: false,
                    formConfig: stylePayload,
                    payloadId: refId,
                    controllerName: 'menu',
                }
            }
        );

        matDialogRef.afterClosed().subscribe((resp: string) => {
            console.log(resp);
            if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
                this._appService.createAppRouting(this._router.url);
            }
        });*/
    }

}