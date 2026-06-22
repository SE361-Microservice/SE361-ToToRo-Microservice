package com.totoro.report.controller;

import com.totoro.report.dto.CreateReportRequest;
import com.totoro.report.dto.ReportResponse;
import com.totoro.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.createReport(userId, request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReportResponse>> getMyReports(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(reportService.getMyReports(userId));
    }
}
