import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BrowserModule),
    provideAnimations(),
    provideHttpClient(),
    provideRouter([]),
    provideClientHydration(),
  ],
};

bootstrapApplication(AppComponent, appConfig).catch(err =>
  console.error('Error bootstrapping app:', err)
);
