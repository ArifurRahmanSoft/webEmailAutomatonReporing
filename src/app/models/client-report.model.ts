import { ReportItem, ReportResponse } from './report.model';

export interface ClientCampaignOption {
  campaign_code: string;
  campaign_name: string;
}

export interface ClientReportDropdownData {
  campaigns: ClientCampaignOption[];
  projects: string[];
  sender_emails: string[];
}

export interface ClientReportFilters {
  senderMail: string | null;
  project: string | null;
  campaignCode: string | null;
  fromDate: Date | null;
  toDate: Date | null;
  isBounce: boolean | null;
  isReply: boolean | null;
  isOpen: boolean | null;
  isClick: boolean | null;
  isDownload: boolean | null;
  isUnsubscribe: boolean | null;
}

export interface ClientReportQuery extends ClientReportFilters {
  page: number;
  perPage: number;
}

export type ClientReportResponse = ReportResponse;

export interface ClientReportPagination {
  page?: number;
  per_page?: number;
  page_size?: number;
  total?: number;
  total_records?: number;
  pages?: number;
  total_pages?: number;
  has_next?: boolean;
  has_previous?: boolean;
  has_next_page?: boolean;
  has_previous_page?: boolean;
}

export interface ClientReportDataEnvelope extends ClientReportPagination {
  items?: ReportItem[];
  data?: ReportItem[];
  records?: ReportItem[];
  results?: ReportItem[];
  reports?: ReportItem[];
  pagination?: ClientReportPagination;
}

export interface ClientReportApiResponse extends ClientReportPagination {
  items?: ReportItem[];
  data?: ReportItem[] | ClientReportDataEnvelope;
  records?: ReportItem[];
  results?: ReportItem[];
  reports?: ReportItem[];
  pagination?: ClientReportPagination;
}
