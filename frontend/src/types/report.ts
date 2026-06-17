export type ReportTargetType = 'LISTING' | 'USER' | 'COMMUNITY_POST' | 'REVIEW';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  description?: string;
}

export interface ResolveReportRequest {
  status: ReportStatus;
  note?: string;
}

export interface ReportResponse {
  id: number;
  reporterId: number;
  reporterEmail: string;
  targetType: ReportTargetType;
  targetId: number;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolvedById: number | null;
  resolvedByEmail: string | null;
  resolvedNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
