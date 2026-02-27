import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="app-container">
      <header class="header">
        <h1>PivotHead Angular Demo</h1>
        <p>Comprehensive feature demonstration for Angular 18</p>
      </header>

      <div class="main-content">
        <nav class="sidebar">
          <h2>Demos</h2>
          <ul>
            <li>
              <a routerLink="/basic" routerLinkActive="active">Basic Usage</a>
            </li>
            <li>
              <a routerLink="/file-import" routerLinkActive="active"
                >File Import</a
              >
            </li>
            <li>
              <a routerLink="/field-introspection" routerLinkActive="active"
                >Field Introspection</a
              >
            </li>
            <li>
              <a routerLink="/drag-drop" routerLinkActive="active"
                >Drag & Drop API</a
              >
            </li>
            <li>
              <a routerLink="/export" routerLinkActive="active"
                >Export Features</a
              >
            </li>
            <li>
              <a routerLink="/events" routerLinkActive="active">Events</a>
            </li>
            <li>
              <a routerLink="/modes" routerLinkActive="active"
                >Rendering Modes</a
              >
            </li>
            <li>
              <a routerLink="/analytics" routerLinkActive="active"
                >Analytics &amp; Charts</a
              >
            </li>
          </ul>
        </nav>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .header h1 {
        margin: 0;
        font-size: 2rem;
      }

      .header p {
        margin: 0.5rem 0 0 0;
        opacity: 0.9;
      }

      .main-content {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .sidebar {
        width: 250px;
        background: #f8f9fa;
        padding: 1.5rem;
        border-right: 1px solid #dee2e6;
        overflow-y: auto;
      }

      .sidebar h2 {
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        color: #495057;
      }

      .sidebar ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .sidebar li {
        margin-bottom: 0.5rem;
      }

      .sidebar a {
        display: block;
        padding: 0.75rem 1rem;
        color: #495057;
        text-decoration: none;
        border-radius: 0.375rem;
        transition: all 0.2s;
      }

      .sidebar a:hover {
        background: #e9ecef;
        color: #212529;
      }

      .sidebar a.active {
        background: #667eea;
        color: white;
      }

      .content {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;
        background: white;
      }
    `,
  ],
})
export class AppComponent {
  title = 'PivotHead Angular Demo';
}
