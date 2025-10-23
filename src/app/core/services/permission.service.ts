import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Role, RolePayload } from "../models/role.interface";
import { Permission } from "../models/permission.interface";

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

    constructor(private _http: HttpClient) {}

    getPermissions(): Observable<Permission[]> {
        return this._http.get<Permission[]>(`${environment.APIURL}permission`);
    }
}