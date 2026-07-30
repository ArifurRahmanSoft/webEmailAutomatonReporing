import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { DashboardMetric } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-dashboard-metric-card',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  readonly metric = input.required<DashboardMetric>();
}
