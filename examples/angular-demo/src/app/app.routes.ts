import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/basic',
    pathMatch: 'full',
  },
  {
    path: 'basic',
    loadComponent: () =>
      import('./components/basic-demo.component').then(
        m => m.BasicDemoComponent
      ),
    title: 'Basic Demo',
  },
  {
    path: 'file-import',
    loadComponent: () =>
      import('./components/file-import-demo.component').then(
        m => m.FileImportDemoComponent
      ),
    title: 'File Import Demo',
  },
  {
    path: 'field-introspection',
    loadComponent: () =>
      import('./components/field-introspection-demo.component').then(
        m => m.FieldIntrospectionDemoComponent
      ),
    title: 'Field Introspection Demo',
  },
  {
    path: 'drag-drop',
    loadComponent: () =>
      import('./components/drag-drop-demo.component').then(
        m => m.DragDropDemoComponent
      ),
    title: 'Drag & Drop Demo',
  },
  {
    path: 'export',
    loadComponent: () =>
      import('./components/export-demo.component').then(
        m => m.ExportDemoComponent
      ),
    title: 'Export Demo',
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./components/events-demo.component').then(
        m => m.EventsDemoComponent
      ),
    title: 'Events Demo',
  },
  {
    path: 'modes',
    loadComponent: () =>
      import('./components/modes-demo.component').then(
        m => m.ModesDemoComponent
      ),
    title: 'Rendering Modes Demo',
  },
];
