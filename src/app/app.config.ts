import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptior } from './core/auth/interceptors/auth.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withDisabledInitialNavigation()
    ),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptior])),
    provideAnimations()
  ]
};
