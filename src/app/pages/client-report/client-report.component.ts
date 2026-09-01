import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import {
  ClientReportDropdownData,
  ClientReportFilters,
  ClientReportResponse,
} from '../../models/client-report.model';
import { SelectOption } from '../../models/report.model';
import { ClientReportService } from '../../services/client-report.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type ClientReportColumn =
  | 'sender'
  | 'receiver'
  | 'project'
  | 'sendDate'
  | 'open'
  | 'click'
  | 'download'
  | 'reply'
  | 'bounce';

type BooleanFilterName =
  'isBounce' | 'isReply' | 'isOpen' | 'isClick' | 'isDownload' | 'isUnsubscribe';

interface ClientReportFilterForm {
  senderMail: FormControl<string | null>;
  project: FormControl<string | null>;
  campaignCode: FormControl<string | null>;
  fromDate: FormControl<Date | null>;
  toDate: FormControl<Date | null>;
  isBounce: FormControl<boolean | null>;
  isReply: FormControl<boolean | null>;
  isOpen: FormControl<boolean | null>;
  isClick: FormControl<boolean | null>;
  isDownload: FormControl<boolean | null>;
  isUnsubscribe: FormControl<boolean | null>;
}

interface BooleanFilterConfig {
  controlName: BooleanFilterName;
  label: string;
}

@Component({
  selector: 'app-client-report',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    PaginationComponent,
    ReactiveFormsModule,
    StatusBadgeComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './client-report.component.html',
  styleUrl: '../report/report.component.css',
})
export class ClientReportComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly clientReportService = inject(ClientReportService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageSize = 20;
  protected readonly displayedColumns: ClientReportColumn[] = [
    'sender',
    'receiver',
    'project',
    'sendDate',
    'open',
    'click',
    'download',
    'reply',
    'bounce',
  ];

  protected readonly booleanOptions: SelectOption<boolean | null>[] = [
    { label: 'All', value: null },
    { label: 'Yes', value: true },
    { label: 'No', value: false },
  ];

  protected readonly booleanFilters: BooleanFilterConfig[] = [
    { controlName: 'isBounce', label: 'Is Bounce' },
    { controlName: 'isReply', label: 'Is Reply' },
    { controlName: 'isOpen', label: 'Is Open' },
    { controlName: 'isClick', label: 'Is Click' },
    { controlName: 'isDownload', label: 'Is Download' },
    { controlName: 'isUnsubscribe', label: 'Is Unsubscribe' },
  ];

  protected readonly filterForm = new FormGroup<ClientReportFilterForm>({
    senderMail: new FormControl<string | null>(null),
    project: new FormControl<string | null>(null),
    campaignCode: new FormControl<string | null>(null),
    fromDate: new FormControl<Date | null>(null),
    toDate: new FormControl<Date | null>(null),
    isBounce: new FormControl<boolean | null>(null),
    isReply: new FormControl<boolean | null>(null),
    isOpen: new FormControl<boolean | null>(null),
    isClick: new FormControl<boolean | null>(null),
    isDownload: new FormControl<boolean | null>(null),
    isUnsubscribe: new FormControl<boolean | null>(null),
  });

  protected readonly filterOptions = signal<ClientReportDropdownData>({
    campaigns: [],
    projects: [],
    sender_emails: [],
  });
  protected readonly currentPage = signal(1);
  protected readonly report = signal<ClientReportResponse | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isExporting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly filterOptionsError = signal<string | null>(null);
  protected readonly filterValidationMessage = signal<string | null>(null);
  private readonly clientCode = signal<string | null>(null);

  protected readonly rows = computed(() => this.report()?.items ?? []);
  protected readonly totalPages = computed(() => this.report()?.total_pages ?? 0);
  protected readonly totalRecords = computed(() => this.report()?.total_records ?? 0);
  protected readonly rangeLabel = computed(() => {
    const totalRecords = this.totalRecords();

    if (totalRecords === 0) {
      return '0 records';
    }

    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.rows().length - 1, totalRecords);
    return `${start}-${end} of ${totalRecords} records`;
  });

  ngOnInit(): void {
    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.filterValidationMessage.set(null);
    });

    const loggedInUser = this.authService.session();
    const userId = loggedInUser?.user_id;
    const clientCode = typeof userId === 'string' ? userId.trim() : '';

    if (!clientCode) {
      this.errorMessage.set('Unable to load client report data.');
      return;
    }

    this.clientCode.set(clientCode);
    this.loadDropdownData(clientCode);
    this.loadReport(clientCode, 1);
  }

  protected search(): void {
    const clientCode = this.clientCode();

    if (clientCode && this.validateDateFilters()) {
      this.loadReport(clientCode, 1);
    }
  }

  protected reset(): void {
    this.filterForm.reset(this.emptyFilters());
    this.filterValidationMessage.set(null);

    const clientCode = this.clientCode();

    if (clientCode) {
      this.loadReport(clientCode, 1);
    }
  }

  protected onPageChange(page: number): void {
    const clientCode = this.clientCode();

    if (clientCode) {
      this.loadReport(clientCode, page);
    }
  }

  protected retryCurrentPage(): void {
    const clientCode = this.clientCode();

    if (clientCode) {
      this.loadReport(clientCode, this.currentPage());
    }
  }

  protected downloadExcel(): void {
    const clientCode = this.clientCode();

    if (!clientCode || !this.validateDateFilters()) {
      return;
    }

    this.isExporting.set(true);

    this.clientReportService
      .downloadExcel(clientCode, this.currentFilters())
      .pipe(
        finalize(() => this.isExporting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.saveExcelResponse(response),
        error: () => this.errorMessage.set('Unable to download client report data.'),
      });
  }

  private loadDropdownData(clientCode: string): void {
    this.clientReportService
      .getDropdownData(clientCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          this.filterOptions.set(options);
          this.filterOptionsError.set(null);
        },
        error: () => this.filterOptionsError.set('Unable to load client report filter options.'),
      });
  }

  private loadReport(clientCode: string, page: number): void {
    this.currentPage.set(page);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.clientReportService
      .getClientReport(clientCode, {
        ...this.currentFilters(),
        page,
        perPage: this.pageSize,
      })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (report) => this.report.set(report),
        error: () => {
          this.report.set(null);
          this.errorMessage.set('Unable to load client report data.');
        },
      });
  }

  private currentFilters(): ClientReportFilters {
    return this.filterForm.getRawValue();
  }

  private emptyFilters(): ClientReportFilters {
    return {
      senderMail: null,
      project: null,
      campaignCode: null,
      fromDate: null,
      toDate: null,
      isBounce: null,
      isReply: null,
      isOpen: null,
      isClick: null,
      isDownload: null,
      isUnsubscribe: null,
    };
  }

  private validateDateFilters(): boolean {
    const { fromDate, toDate } = this.filterForm.getRawValue();

    if (!this.isValidDate(fromDate) || !this.isValidDate(toDate)) {
      this.filterValidationMessage.set('Please enter valid From Date and To Date values.');
      return false;
    }

    if (toDate && !fromDate) {
      this.filterValidationMessage.set('Please select a From Date before choosing a To Date.');
      return false;
    }

    if (fromDate && toDate && this.dateOnlyValue(toDate) < this.dateOnlyValue(fromDate)) {
      this.filterValidationMessage.set('To Date must be the same as or later than From Date.');
      return false;
    }

    this.filterValidationMessage.set(null);
    return true;
  }

  private isValidDate(date: Date | null): boolean {
    return date === null || !Number.isNaN(date.getTime());
  }

  private dateOnlyValue(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  private saveExcelResponse(response: HttpResponse<Blob>): void {
    if (!response.body) {
      this.errorMessage.set('Client report export returned an empty file.');
      return;
    }

    const url = window.URL.createObjectURL(response.body);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = this.resolveFileName(response);
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  private resolveFileName(response: HttpResponse<Blob>): string {
    const contentDisposition = response.headers.get('content-disposition');
    const fileNameMatch = contentDisposition
      ? /filename="?([^"]+)"?/.exec(contentDisposition)
      : null;

    return fileNameMatch?.[1] ?? `client-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  }
}
