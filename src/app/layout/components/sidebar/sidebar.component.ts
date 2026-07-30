import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
  disabled: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly router = inject(Router);

  readonly collapsed = input(false);

  protected readonly menuItems: SidebarMenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', disabled: false },
    { label: 'Reporting', icon: 'assessment', route: '/report', disabled: false },
    { label: 'Settings', icon: 'settings', route: '', disabled: true },
    { label: 'About', icon: 'info', route: '', disabled: true },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly reportingActive = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/report') || url.startsWith('/pages/report');
  });

  protected readonly dashboardActive = computed(() => this.currentUrl().startsWith('/dashboard'));

  protected isActive(item: SidebarMenuItem): boolean {
    if (item.label === 'Dashboard') {
      return this.dashboardActive();
    }

    return item.label === 'Reporting' && this.reportingActive();
  }
}
