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
  constructor(private _http: HttpClient) {}

  getS3ObjectSignedUrl(fileId: string): Observable<string> {
    return this._http.get<string>(`${this.baseURL}file-management/${fileId}`)
      .pipe(
        retry(2),
        take(1)
      );
  }

  getAllMedias(): Observable<Array<Media>> {
    return this._http.get<Array<Media>>(`${this.baseURL}media`)
      .pipe(
        retry(2),
        take(1)
      );
  }

  uploadFileToS3(formData: FormData): Observable<Media> {
    return this._http.post<Media>(`${this.baseURL}file-management/upload`, formData)
      .pipe(
        retry(2),
        take(1)
      );
  }

}