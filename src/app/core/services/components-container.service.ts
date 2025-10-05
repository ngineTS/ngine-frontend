import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class ComponentsContainerService {

  /**
   * Application component dictionnary.
   * 
   * Map navigation type name with a method witch returns a promise of component imports.
   */
  componentStore: Record<string, () => Promise<any>> = {
    "my-quill-editor": () => import('../components/my-quill-editor/my-quill-editor.component'),
    "calendar": () => import('../components/calendar/calendar.component'),
    "content-management": () => import('../components/content-management/content-management.component'),
    "content-visualization": () => import('../components/content-visualization/content-visualization.component'),
  };

  /**
   * Transform a kebab case string to a pascale case string.
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