import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Banner } from "../models/banner.interface";
import { environment } from "../../../environments/environment";
import { retry, take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class BannerService {

    constructor(private _http: HttpClient) { }

    getAllBanners() {
        return this._http.get<Array<Banner>>(`${environment.APIURL}banner`)
            .pipe(
                take(1),
                retry(1)
            )
    }

    getBannerByNavigationId(navigationId: string) {
        return this._http.get<Banner>(`${environment.APIURL}banner/navigation/${navigationId}`)
            .pipe(
                take(1),
                retry(1)
            )
    }
}