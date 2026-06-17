import apiClient from './apiClient';
import type { CreateReportRequest, ReportResponse } from '../types/report';

export const reportService = {
  createReport: async (request: CreateReportRequest): Promise<ReportResponse> => {
    const response = await apiClient.post<ReportResponse>('/reports', request);
    return response.data;
  },

  getMyReports: async (): Promise<ReportResponse[]> => {
    const response = await apiClient.get<ReportResponse[]>('/reports/my');
    return response.data;
  },
};

export default reportService;
