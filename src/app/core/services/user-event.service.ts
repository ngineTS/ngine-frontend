import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { distinctUntilChanged, filter, Observable } from "rxjs";
import { v4 as uuidv4 } from 'uuid'
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class UserEventService {

  sessionId = uuidv4();

  constructor(private _http: HttpClient,
              private _router: Router
             ) {}

  traceUserUrlChanges(): void {
    this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged(),
      )
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects) {
          this.saveUserEvent(event.urlAfterRedirects, this.sessionId).subscribe();
        }
      });
  }

  saveUserEvent(url: string, sessionId: string) {
    return this._http.post(`${environment.APIURL}user-event`, {
      sessionId: sessionId,
      url: url
    });
  }

}