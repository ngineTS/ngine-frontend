import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ComponentsContainerService {

  componentStore: Record<string, () => Promise<any>> = {
    "test-text": () => import('../components/test-text/test-text.component'),
    "my-quill-editor": () => import('../components/my-quill-editor/my-quill-editor.component'),
    "calendar": () => import('../components/calendar/calendar.component'),
    "content-management": () => import('../components/content-management/content-management.component'),
    "content-visualization": () => import('../components/content-visualization/content-visualization.component'),
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