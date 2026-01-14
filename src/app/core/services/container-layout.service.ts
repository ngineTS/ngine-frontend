import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContainerLayout } from "../models/container-layout.interface";
import { TypeORMUpdateResponseType } from "../models/typeorm-update-response.interface";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root',
})
export class ContainerLayoutService { 

    constructor(private _http: HttpClient) {}

    updateContainerLayout(id: string, containerLayoutProps: Partial<ContainerLayout>) {
        return this._http.patch<TypeORMUpdateResponseType>(`${environment.APIURL}container-layout/${id}`, containerLayoutProps);
    }

}