import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ComponentService {

  /**
   * Application components store.
   * 
   * Map navigation type name with function reference to component import.
   * 
   * The key has to match navigation type name.
   */
  readonly componentStore: Record<string, () => Promise<any>> = {
    "my-quill-editor": () => import('./my-quill-editor/my-quill-editor.component'),
    "calendar": () => import('./calendar/calendar.component'),
    "content-visualization": () => import('./content-visualization/content-visualization.component'),
    "analytic": () => import('./analytic/analytic.component'),
    "media-library": () => import('./media-library/media-library.component'),
    "user-management": () => import('./user-management/user-management.component'),
    "role-management": () => import('./role-management/role-management.component'),
    "sign-container": () => import('./sign-container/sign-container.component'),
    "simple-shape": () => import('./simple-shape/simple-shape.component'),
    "media": () => import('./media/media.component'),
    "reusable-card-list": () => import('./reusable-card-list/reusable-card-list.component'),
  };

  /**
   * Classify a string (ex: my-string --> MyString).
   * 
   * @param str The string to transform.
   * @returns A string in pascale case.
   */
  classify(str: string): string {
    return str
      .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (c) => c.toUpperCase());
  }

}