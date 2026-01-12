import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { MenuPayload } from "../models/menu.interface";
import { take } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class MenuService {

    constructor(private _http: HttpClient) {}

    baseURL = environment.APIURL;

}