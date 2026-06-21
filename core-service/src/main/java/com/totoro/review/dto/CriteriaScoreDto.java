package com.totoro.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CriteriaScoreDto {
    @NotBlank(message = "Bắt buộc có tên tiêu chí")
    private String criteriaName;

    @NotNull(message = "Bắt buộc có điểm")
    @Min(value = 1, message = "Điểm tối thiểu là 1")
    @Max(value = 5, message = "Điểm tối đa là 5")
    private Integer score;
}
