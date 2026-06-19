package com.totoro.report.dto;

import com.totoro.report.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResolveReportRequest {

    @NotNull
    private ReportStatus status;

    private String note;
}
