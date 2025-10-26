import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Role, RolePayload } from "../models/role.interface";
import { RoleNavigationPermission, RoleNavigationPermissionPayload } from "../models/role-navigation-permission.interface";

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

    deleteRole(id: string) {
        return this._http.delete(`${environment.APIURL}role/${id}`);
    }

    bulkSaveRoleNavigationPermissions(
        roleNavigationPermissionsPayload: Array<RoleNavigationPermissionPayload>
    ): Observable<Array<RoleNavigationPermission>> {
        return this._http.post<Array<RoleNavigationPermission>>(`${environment.APIURL}role-navigation-permission/bulk-save`, roleNavigationPermissionsPayload);
    }

    bulkDeleteRoleNavigationPermissions(ids: string[]): Observable<RoleNavigationPermission> {
        return this._http.post<RoleNavigationPermission>(`${environment.APIURL}role-navigation-permission/bulk-delete`, ids);
    }

}