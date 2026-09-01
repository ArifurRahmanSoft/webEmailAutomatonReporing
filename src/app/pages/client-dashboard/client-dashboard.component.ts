import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import {
  ClientDashboardMetric,
  ClientDashboardStatistics,
} from '../../models/client-dashboard.model';
import { ClientDashboardService } from '../../services/client-dashboard.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';

@Component({
  selector: 'app-client-dashboard',
  imports: [
    DatePipe,
    LoadingStateComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly clientDashboardService = inject(ClientDashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statistics = signal<ClientDashboardStatistics | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly metrics = computed<ClientDashboardMetric[]>(() => {
    const statistics = this.statistics();

    if (!statistics) {
      return [];
    }

    return [
      {
        label: 'Total Campaign',
        value: this.formatCount(statistics.campaign_count),
        icon: 'campaign',
      },
      { label: 'Total Mail', value: this.formatCount(statistics.total_sent), icon: 'mail' },
      {
        label: 'Total Click',
        value: this.formatCount(statistics.total_click_by_mail),
        icon: 'ads_click',
      },
      {
        label: 'Total Download',
        value: this.formatCount(statistics.total_download_by_mail),
        icon: 'download',
      },
      {
        label: 'Total Reply',
        value: this.formatCount(statistics.total_reply_by_mail),
        icon: 'reply',
      },
      {
        label: 'Monthly Sent',
        value: this.formatCount(statistics.monthly_sent),
        icon: 'date_range',
      },
      {
        label: 'Weekly Sent',
        value: this.formatCount(statistics.weekly_sent),
        icon: 'calendar_month',
      },
      {
        label: 'Success Rate',
        value: this.formatPercentage(statistics.success_rate),
        icon: 'check_circle',
      },
      {
        label: 'Failure Rate',
        value: this.formatPercentage(statistics.failure_rate),
        icon: 'cancel',
      },
      {
        label: 'Total Unsubscribe',
        value: this.formatCount(statistics.total_unsubscribe),
        icon: 'unsubscribe',
      },
      {
        label: 'Total Open',
        value: this.formatCount(statistics.total_open_by_mail),
        icon: 'mark_email_read',
      },
    ];
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected refresh(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const clientCode = this.authService.session()?.user_id;

    if (!clientCode) {
      this.statistics.set(null);
      this.errorMessage.set('Unable to load Client Dashboard data.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.clientDashboardService
      .getClientDashboard(clientCode)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (statistics) => this.statistics.set(statistics),
        error: () => {
          this.statistics.set(null);
          this.errorMessage.set('Unable to load Client Dashboard data.');
        },
      });
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatPercentage(value: number): string {
    return `${value.toFixed(1)} %`;
  }
}
