import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, take, tap } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import { NavigationType } from "../navigation/models/navigation-type.interface";

@Injectable({
  providedIn: 'root',
})
export class GenericService{
    
  constructor(private _http: HttpClient) {}

  componentStore: Record<string, () => Promise<any>> = {
    "test-text":  () => import('../test-text/test-text.component')
  };

  /*createComponentsStore() {
    return this._http.get<NavigationType[]>(`${environment.APIURL}navigation-type`).pipe(
      take(1),
      tap(navigationTypes => 
        navigationTypes.forEach(navigationType => {
          if (navigationType.name !== 'header') {
            this.componentStore[navigationType.name] = () => import(`../test-text/test-text.component`)
          }
        }
        )
      )
    );
  }*/

}