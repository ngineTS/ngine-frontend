import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, retry, take } from "rxjs";
import { Media } from "../models/media.interface";

@Injectable({
    providedIn: 'root',
})
export class MediaService {

  baseURL = environment.APIURL;
  constructor(private _http: HttpClient){}

  getS3ObjectSignedUrl(fileId: string) {
    return this._http.get<string>(`${this.baseURL}file-management/${fileId}`)
      .pipe(
        retry(2),
        take(1)
      );
  }

  getAllMedias() {
    return this._http.get<Array<Media>>(`${this.baseURL}media-library`)
      .pipe(
        retry(2),
        take(1)
      );
  }

  uploadFileToS3(formData: FormData) {
    return this._http.post<Media>(`${this.baseURL}file-management/upload`, formData)
      .pipe(
        retry(2),
        take(1)
      );
  }

}