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

  /**
   * Get S3 file temporary url.
   * 
   * @param fileName The file key.
   * @returns S3 File temporary URL.
   */
  getS3ObjectSignedUrl(fileName: string): Observable<string> {
    return this._http.get<string>(`${this.baseURL}file-management/${fileName}`)
      .pipe(retry(1), take(1));
  }

  /**
   * Get all media metadata.
   * 
   * @param orderBy The media property used to order the array.
   * @param order 'ASC' or 'DESC'.
   * @returns An obeservable of media array.
   */
  getAllMedias(orderBy?: keyof Media, order?: 'ASC' | 'DESC'): Observable<Array<Media>> {
    if(orderBy && order) {
      const params = new HttpParams()
        .set('orderBy', orderBy)
        .set('order', order);
      return this._http.get<Array<Media>>(`${this.baseURL}media`, { params })
        .pipe(retry(1), take(1));
    }
    return this._http.get<Array<Media>>(`${this.baseURL}media`)
      .pipe(retry(1), take(1));
  }

  /**
   * Upload file to S3.
   * 
   * @param formData The file.
   * @returns The media metadata.
   */
  uploadFileToS3(formData: FormData): Observable<Media> {
    return this._http.post<Media>(`${this.baseURL}file-management/upload`, formData)
      .pipe(take(1));
  }

  /**
   * Delete media from S3.
   * 
   * @param fileName The file key.
   * @returns A delete response.
   */
  deleteMedia(fileName: string) {
    return this._http.delete(`${this.baseURL}file-management/${fileName}`)
      .pipe(retry(1), take(1));
  }

}