import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptior } from './core/auth/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideQuillConfig } from 'ngx-quill';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withDisabledInitialNavigation()
    ),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptior])),
    provideAnimations(),
    provideQuillConfig({
      customOptions: [
        {
          import: 'formats/font',
          whitelist: ['montserrat', 'roboto', 'opensans', 'lato', 'poppins', 'oswald', 'ubuntu']   // 👈 only one for now (keep it simple)
        }
      ]
    })
  ]
};
