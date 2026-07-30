import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { DashboardMetric, DashboardStatistics } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { MetricCardComponent } from './components/metric-card/metric-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    LoadingStateComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MetricCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statistics = signal<DashboardStatistics | null>(null);
  protected readonly lastRefresh = signal<Date | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly metrics = computed<DashboardMetric[]>(() => {
    const statistics = this.statistics();

    if (!statistics) {
      return [];
    }

    return [
      {
        title: 'Total Sent',
        value: this.formatCount(statistics.total_sent),
        description: 'All sent emails',
        icon: 'send',
        tone: 'blue',
      },
      {
        title: 'Weekly Sent',
        value: this.formatCount(statistics.weekly_sent),
        description: 'Emails sent this week',
        icon: 'calendar_month',
        tone: 'indigo',
      },
      {
        title: 'Monthly Sent',
        value: this.formatCount(statistics.monthly_sent),
        description: 'Emails sent this month',
        icon: 'date_range',
        tone: 'teal',
      },
      {
        title: 'Total Opened Emails',
        value: this.formatCount(statistics.total_open_by_mail),
        description: 'Unique emails opened',
        icon: 'mark_email_read',
        tone: 'green',
      },
      {
        title: 'Total Clicked Emails',
        value: this.formatCount(statistics.total_click_by_mail),
        description: 'Unique emails clicked',
        icon: 'ads_click',
        tone: 'amber',
      },
      {
        title: 'Total Replied Emails',
        value: this.formatCount(statistics.total_reply_by_mail),
        description: 'Unique recipients replied',
        icon: 'reply',
        tone: 'slate',
      },
      {
        title: 'Total Bounce',
        value: this.formatCount(statistics.total_bounce),
        description: 'Emails returned as bounced',
        icon: 'report_problem',
        tone: 'red',
      },
      {
        title: 'Total Unsubscribed',
        value: this.formatCount(statistics.total_unsubscribe),
        description: 'Recipients unsubscribed',
        icon: 'unsubscribe',
        tone: 'purple',
      },
      {
        title: 'Success Rate',
        value: this.formatPercentage(statistics.success_rate),
        description: 'Successful delivery rate',
        icon: 'check_circle',
        tone: 'green',
      },
      {
        title: 'Failure Rate',
        value: this.formatPercentage(statistics.failure_rate),
        description: 'Failed delivery rate',
        icon: 'cancel',
        tone: 'red',
      },
    ];
  });

  ngOnInit(): void {
    this.loadStatistics();
  }

  protected refresh(): void {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dashboardService
      .getStatistics()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (statistics) => {
          this.statistics.set(statistics);
          this.lastRefresh.set(new Date());
        },
        error: (error: unknown) => {
          this.statistics.set(null);
          this.errorMessage.set(this.resolveErrorMessage(error));
        },
      });
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private formatPercentage(value: number): string {
    return `${value.toFixed(1)} %`;
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The dashboard API is not reachable right now. Please try again shortly.';
      }

      return `Dashboard statistics could not be loaded. Status code: ${error.status}.`;
    }

    return 'Dashboard statistics could not be loaded.';
  }
}
