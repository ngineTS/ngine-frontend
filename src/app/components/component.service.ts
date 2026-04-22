import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ComponentService {

  /**
   * Application components store.
   * 
   * Map navigation type name with a method witch returns a promise of component imports.
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
    "media": () => import('./media/media.component')
  };

  /**
   * Transform a kebab case string to a pascale case string.
   * 
   * @param input The string to transform.
   * @returns A string in pascale case.
   */
  kebabCasetoPascaleCase(input: string): string {
    return input
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

}