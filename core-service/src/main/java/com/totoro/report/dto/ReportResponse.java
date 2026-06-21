package com.totoro.report.dto;

import com.totoro.report.entity.ReportStatus;
import com.totoro.report.entity.ReportTargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private Long reporterId;
    private String reporterEmail;
    private ReportTargetType targetType;
    private Long targetId;
    private String reason;
    private String description;
    private ReportStatus status;
    private Long resolvedById;
    private String resolvedByEmail;
    private String resolvedNote;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
