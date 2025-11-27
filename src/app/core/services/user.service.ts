import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../models/user.interface";
import { environment } from "../../../environments/environment";
import { UserRolePayload } from "../models/user-role.interface";

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private _http: HttpClient) {}

  getAllUsers(): Observable<Array<User>> {
    return this._http.get<Array<User>>(`${environment.APIURL}user`);
  }

  updateUser(id: string, userProps: Partial<User>) {
    return this._http.patch(`${environment.APIURL}user/${id}`, userProps);
  }

  bulksaveUserRoles(id: string, userRolePayload: Array<UserRolePayload>): Observable<Array<User>> {
    return this._http.post<Array<User>>(`${environment.APIURL}user-role/bulk-save/${id}`, userRolePayload);
  }

  deleteUser(id: string) {
    return this._http.delete(`${environment.APIURL}user/${id}`);
  }
}