import { ReportResponse } from './report.model';

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
