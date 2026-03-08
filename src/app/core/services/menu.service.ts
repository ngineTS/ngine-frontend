import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { StylePayload } from "../models/menu.interface";
import { DeepFormConfig } from "../models/form-input.interface";
import { GenericFormComponent } from "../components/generic-form/generic-form.component";
import { AppService } from "./app.service";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormContainerComponent } from "../components/form-container/form-container.component";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(
        private _http: HttpClient,
        private _matDialog: MatDialog,
        private _appService: AppService,
        private _router: Router,
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
        const matDialogRef = this._matDialog.open(
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
            if (resp === 'added' || resp === 'edited' || resp === 'deleted') {
                this._appService.createAppRouting(this._router.url);
            }
        });
    }

}