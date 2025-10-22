import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Role, RolePayload } from "../models/role.interface";

@Injectable({
  providedIn: 'root',
})
export class RoleService {

    constructor(private _http: HttpClient) { }

    getAllRoles(): Observable<Array<Role>> {
        return this._http.get<Array<Role>>(`${environment.APIURL}role`);
    }

    saveRole(rolePayload: RolePayload): Observable<Role> {
        return this._http.post<Role>(`${environment.APIURL}role`, rolePayload);
    }

    updateRole(id: string, updateRolePayload: Partial<RolePayload>): Observable<{
        [prop: string]: any;
        affected: number;
    }> {
        return this._http.patch<{
            [prop: string]: any; 
            affected: number;
        }>(`${environment.APIURL}role/${id}`, updateRolePayload);
    }


}