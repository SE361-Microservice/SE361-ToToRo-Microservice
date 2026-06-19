package com.totoro.report.service;

import com.totoro.report.dto.CreateReportRequest;
import com.totoro.report.dto.ReportResponse;
import com.totoro.report.dto.ResolveReportRequest;
import com.totoro.report.entity.Report;
import com.totoro.report.entity.ReportStatus;
import com.totoro.report.repository.ReportRepository;
import com.totoro.common.dto.UserProfileDto;
import com.totoro.internal.user.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public ReportResponse createReport(Long userId, CreateReportRequest request) {
        UserProfileDto reporter = userServiceClient.getUserProfile(userId);
        if (reporter == null) {
            throw new IllegalArgumentException("Không tìm thấy user");
        }

        Report report = Report.builder()
                .reporterId(reporter.getId())
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .build();

        return toResponse(reportRepository.save(report));
    }

    public List<ReportResponse> getMyReports(Long userId) {
        UserProfileDto reporter = userServiceClient.getUserProfile(userId);
        if (reporter == null) {
            throw new IllegalArgumentException("Không tìm thấy user");
        }
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporter.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReportResponse resolveReport(Long adminId, Long reportId, ResolveReportRequest request) {
        UserProfileDto admin = userServiceClient.getUserProfile(adminId);
        if (admin == null) {
            throw new IllegalArgumentException("Không tìm thấy admin");
        }

        if (request.getStatus() == ReportStatus.PENDING) {
            throw new IllegalArgumentException("Trạng thái xử lý không hợp lệ");
        }

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy report"));

        report.setStatus(request.getStatus());
        report.setResolvedById(admin.getId());
        report.setResolvedNote(request.getNote());
        report.setResolvedAt(LocalDateTime.now());

        return toResponse(reportRepository.save(report));
    }

    private ReportResponse toResponse(Report report) {
        UserProfileDto reporter = null;
        UserProfileDto resolvedBy = null;
        try {
            reporter = userServiceClient.getUserProfile(report.getReporterId());
            if (report.getResolvedById() != null) {
                resolvedBy = userServiceClient.getUserProfile(report.getResolvedById());
            }
        } catch (Exception ignored) {
        }

        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporterId())
                .reporterEmail(reporter != null ? reporter.getEmail() : null)
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .resolvedById(report.getResolvedById())
                .resolvedByEmail(resolvedBy != null ? resolvedBy.getEmail() : null)
                .resolvedNote(report.getResolvedNote())
                .resolvedAt(report.getResolvedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
