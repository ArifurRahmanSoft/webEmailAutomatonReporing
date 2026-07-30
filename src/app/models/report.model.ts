export interface ReportItem {
  tracking_id: string;
  sender_email: string;
  receiver_email: string;
  project_name: string;
  send_date: string;
  open_count: number;
  click_count: number;
  download_count: number;
  reply_count: number;
  is_bounce: boolean;
}

export interface ReportResponse {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  items: ReportItem[];
}

export interface ReportFilterOptionsResponse {
  sender_emails: string[];
  project_names: string[];
}

export interface ReportFilters {
  senderEmail: string | null;
  projectName: string | null;
  fromDate: Date | null;
  toDate: Date | null;
  isBounce: boolean | null;
  isReply: boolean | null;
  isOpen: boolean | null;
  isClick: boolean | null;
  isDownload: boolean | null;
}

export interface ReportQuery extends ReportFilters {
  page: number;
  pageSize: number;
}

export interface SelectOption<TValue> {
  label: string;
  value: TValue;
}
