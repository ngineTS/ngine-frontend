import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, retry, take } from "rxjs";
import { Media } from "../models/media.interface";

@Injectable({
    providedIn: 'root',
})
export class MediaService {

  baseURL = environment.APIURL;
  constructor(private _http: HttpClient) {}

  getS3ObjectSignedUrl(fileName: string): Observable<string> {
    return this._http.get<string>(`${this.baseURL}file-management/${fileName}`)
      .pipe(
        retry(2),
        take(1)
      );
  }

  getAllMedias(orderBy?: keyof Media, order?: 'ASC' | 'DESC'): Observable<Array<Media>> {
    if(orderBy && order) {
      const params = new HttpParams()
        .set('orderBy', orderBy)
        .set('order', order);
      return this._http.get<Array<Media>>(`${this.baseURL}media`, { params })
      .pipe(
        retry(2),
        take(1)
      );
    }
    return this._http.get<Array<Media>>(`${this.baseURL}media`)
      .pipe(
        retry(2),
        take(1)
      );
  }

  uploadFileToS3(formData: FormData): Observable<Media> {
    return this._http.post<Media>(`${this.baseURL}file-management/upload`, formData)
      .pipe(
        take(1)
      );
  }

  deleteMedia(fileName: string) {
    return this._http.delete(`${this.baseURL}file-management/${fileName}`)
      .pipe(
        retry(2),
        take(1)
      );
  }

}