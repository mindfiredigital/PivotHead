import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Register Chart.js globally BEFORE importing web component
// This ensures Chart.js is available for data visualization
Chart.register(...registerables);
(window as any).Chart = Chart;

// Import web component to register custom element
import '@mindfiredigital/pivothead-web-component';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch(err => console.error(err));
