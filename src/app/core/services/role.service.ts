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

    /**
     * Get all roles ordered alphabaetically.
     */
    getAllRoles(): Observable<Array<Role>> {
        return this._http.get<Array<Role>>(`${environment.APIURL}role`);
    }

    /**
     * Get all roles and related navigation permissions.
     * @returns An obervable of all roles.
     */
    getAllRolesWithNavigationPermissions(): Observable<Array<Role>> {
        return this._http.get<Array<Role>>(`${environment.APIURL}role/rpn`);
    }

    /**
     * Save role and return it.
     * @returns An obervable of the role saved.
     */
    saveRole(rolePayload: RolePayload): Observable<Role> {
        return this._http.post<Role>(`${environment.APIURL}role`, rolePayload);
    }

    /**
     * Update role.
     * @param id The id of the role to update.
     * @param updateRolePayload The role properties to update.
     * @returns An update response type object.
     */
    updateRole(id: string, updateRolePayload: Partial<RolePayload>): Observable<{
        [prop: string]: any;
        affected: number;
    }> {
        return this._http.patch<{
            [prop: string]: any; 
            affected: number;
        }>(`${environment.APIURL}role/${id}`, updateRolePayload);
    }

    /**
     * Delete role.
     * @param id The id of the role to delete.
     * @returns An update response type object.
     */
    deleteRole(id: string) {
        return this._http.delete(`${environment.APIURL}role/${id}`);
    }

    /**
     * Save Array of roleNavigationPermission.
     * @param roleNavigationPermissionsPayload An array of roleNavigationPermission payload to save.
     * @returns The array of roleNavigationPermission saved.
     */
    bulkSaveRoleNavigationPermissions(
        roleNavigationPermissionsPayload: Array<RoleNavigationPermissionPayload>
    ): Observable<Array<RoleNavigationPermission>> {
        return this._http.post<Array<RoleNavigationPermission>>(`${environment.APIURL}role-navigation-permission/bulk-save`, roleNavigationPermissionsPayload);
    }

}