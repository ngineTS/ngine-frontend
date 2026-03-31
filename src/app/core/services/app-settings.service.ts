import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppSetting } from "../models/app-setting.interface";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  constructor(private _http: HttpClient) {}

  baseURL = environment.APIURL;

  getAppSettings() {
    return this._http.get<Array<AppSetting>>(`${this.baseURL}app-setting`);
  }

}