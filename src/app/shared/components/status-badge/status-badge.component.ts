import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

type StatusBadgeTone = 'success' | 'danger';

@Component({
  selector: 'app-status-badge',
  imports: [MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  readonly active = input.required<boolean>();
  readonly activeLabel = input('Yes');
  readonly inactiveLabel = input('No');
  readonly activeIcon = input('check_circle');
  readonly inactiveIcon = input('remove_circle');
  readonly count = input<number | null>(null);
  readonly tone = input<StatusBadgeTone>('success');

  protected readonly label = computed(() => {
    const count = this.count();

    if (count !== null) {
      return count.toString();
    }

    return this.active() ? this.activeLabel() : this.inactiveLabel();
  });

  protected readonly icon = computed(() => (this.active() ? this.activeIcon() : this.inactiveIcon()));
  protected readonly toneClass = computed(() => `status-badge--${this.tone()}`);
}
