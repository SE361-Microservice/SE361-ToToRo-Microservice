package com.totoro.location.controller;

import com.totoro.location.dto.ProvinceDto;
import com.totoro.location.dto.WardDto;
import com.totoro.location.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/provinces")
    public ResponseEntity<List<ProvinceDto>> getAllProvinces() {
        return ResponseEntity.ok(locationService.getAllProvinces());
    }

    @GetMapping("/provinces/{provinceCode}/wards")
    public ResponseEntity<List<WardDto>> getWardsByProvince(@PathVariable String provinceCode) {
        return ResponseEntity.ok(locationService.getWardsByProvince(provinceCode));
    }
}
