export interface ClientDashboardStatistics {
  campaign_count: number;
  campaign_codes: string[];
  total_sent: number;
  total_click_by_mail: number;
  total_download_by_mail: number;
  total_reply_by_mail: number;
  monthly_sent: number;
  weekly_sent: number;
  success_rate: number;
  failure_rate: number;
  total_unsubscribe: number;
  total_open_by_mail: number;
  last_updated: string;
}

export interface ClientDashboardMetric {
  label: string;
  value: string;
  icon: string;
}
