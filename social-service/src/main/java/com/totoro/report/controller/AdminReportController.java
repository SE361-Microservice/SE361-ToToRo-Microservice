package com.totoro.report.controller;

import com.totoro.report.dto.ReportResponse;
import com.totoro.report.dto.ResolveReportRequest;
import com.totoro.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping("/pending")
    public ResponseEntity<List<ReportResponse>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    @PatchMapping("/{reportId}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long reportId,
            @Valid @RequestBody ResolveReportRequest request) {
        return ResponseEntity.ok(reportService.resolveReport(userId, reportId, request));
    }
}
