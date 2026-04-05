import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppSetting } from "../models/app-setting.interface";
import { environment } from "../../../environments/environment";
import { BehaviorSubject } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.APIURL;
  private backgroundColorSubject = new BehaviorSubject<string>('#ffffff');
  backgroundColor$ = this.backgroundColorSubject.asObservable();

  setAppBackgroundColor(color: string): void {
    this.backgroundColorSubject.next(color);
  }

  getCurrentAppBackgroundColor(): string {
    return this.backgroundColorSubject.value;
  }

  getAppSettings() {
    return this._http.get<Array<AppSetting>>(`${this.baseURL}app-setting`);
  }

  saveAppSetting(appSettingPayload: Omit<AppSetting, 'id'>) {
    return this._http.post<AppSetting>(`${this.baseURL}app-setting`, appSettingPayload);
  }



}