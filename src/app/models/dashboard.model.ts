export interface DashboardStatistics {
  total_sent: number;
  total_open: number;
  total_click: number;
  total_download: number;
  total_reply: number;
  total_bounce: number;
  total_open_by_mail: number;
  total_click_by_mail: number;
  total_download_by_mail: number;
  total_reply_by_mail: number;
  weekly_sent: number;
  monthly_sent: number;
  success_rate: number;
  failure_rate: number;
  last_updated: string;
  total_unsubscribe: number;
  last_unsubscribe_time: string | null;
}

export interface DashboardMetric {
  title: string;
  value: string;
  description: string;
  icon: string;
  tone: DashboardMetricTone;
}

export type DashboardMetricTone =
  | 'blue'
  | 'indigo'
  | 'teal'
  | 'green'
  | 'amber'
  | 'slate'
  | 'red'
  | 'purple';
