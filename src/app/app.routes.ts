import { Routes } from '@angular/router';

import { adminGuard, authGuard, loginGuard } from './auth/auth.guards';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then((component) => component.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'pages/report',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (component) => component.DashboardComponent,
          ),
      },
      {
        path: 'client-dashboard',
        loadComponent: () =>
          import('./pages/client-dashboard/client-dashboard.component').then(
            (component) => component.ClientDashboardComponent,
          ),
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
        path: 'settings',
        canActivate: [adminGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'user-management' },
          {
            path: 'user-management',
            loadComponent: () =>
              import('./pages/settings/user-management/user-management.component').then(
                (component) => component.UserManagementComponent,
              ),
          },
        ],
      },
      {
        path: 'about',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/about/about.component').then((component) => component.AboutComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'pages/report',
  },
];
