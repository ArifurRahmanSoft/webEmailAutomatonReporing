import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pages/report',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((component) => component.DashboardComponent),
  },
  {
    path: 'pages/report',
    loadComponent: () =>
      import('./pages/report/report.component').then((component) => component.ReportComponent),
  },
  {
    path: 'report',
    loadComponent: () =>
      import('./pages/report/report.component').then((component) => component.ReportComponent),
  },
  {
    path: '**',
    redirectTo: 'pages/report',
  },
];
