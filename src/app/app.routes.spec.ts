import { Route } from '@angular/router';

import { routes } from './app.routes';

describe('application routes', () => {
  const childRoute = (path: string): Route | undefined =>
    routes.find((route) => route.path === '')?.children?.find((route) => route.path === path);

  it('keeps the existing Dashboard route available', async () => {
    const route = childRoute('dashboard');

    expect(route).toBeDefined();
    expect(await route?.loadComponent?.()).toBeDefined();
  });

  it('keeps the existing Report routes available', async () => {
    const reportRoute = childRoute('report');
    const legacyReportRoute = childRoute('pages/report');

    expect(reportRoute).toBeDefined();
    expect(legacyReportRoute).toBeDefined();
    expect(await reportRoute?.loadComponent?.()).toBeDefined();
    expect(await legacyReportRoute?.loadComponent?.()).toBeDefined();
  });

  it('adds the Client Report route without replacing existing routes', async () => {
    const route = childRoute('client-report');

    expect(route).toBeDefined();
    expect(await route?.loadComponent?.()).toBeDefined();
  });
});
