import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { AuthService } from '../../../auth/auth.service';

interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
  hideForReportView?: boolean;
  children?: SidebarMenuItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);

  readonly collapsed = input(false);

  protected readonly clientDashboardMenuItem: SidebarMenuItem = {
    label: 'Client Dashboard',
    icon: 'space_dashboard',
    route: '/client-dashboard',
  };

  protected readonly showClientDashboard = computed(() => this.authService.hasRole('REPORT_VIEW'));

  protected readonly clientReportMenuItem: SidebarMenuItem = {
    label: 'Client Report',
    icon: 'assessment',
    route: '/client-report',
  };

  protected readonly showClientReport = computed(() => this.authService.hasRole('REPORT_VIEW'));

  private readonly allMenuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', adminOnly: true },
    { label: 'Report', icon: 'assessment', route: '/pages/report', hideForReportView: true },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings/user-management',
      adminOnly: true,
      children: [
        {
          label: 'User Management',
          icon: 'manage_accounts',
          route: '/settings/user-management',
          adminOnly: true,
        },
      ],
    },
    { label: 'About', icon: 'info', route: '/about', adminOnly: true },
  ];

  protected readonly menuItems = computed(() =>
    this.allMenuItems.filter(
      (item) =>
        (!item.adminOnly || this.authService.isAdmin()) &&
        (!item.hideForReportView || !this.authService.hasRole('REPORT_VIEW')),
    ),
  );

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected isActive(item: SidebarMenuItem): boolean {
    const url = this.currentUrl();

    if (item.route === '/pages/report') {
      return url.startsWith('/report') || url.startsWith('/pages/report');
    }

    return url.startsWith(item.route);
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
