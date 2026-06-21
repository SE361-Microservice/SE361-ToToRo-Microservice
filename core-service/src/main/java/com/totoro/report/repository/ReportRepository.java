package com.totoro.report.repository;

import com.totoro.report.entity.Report;
import com.totoro.report.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    List<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
}
