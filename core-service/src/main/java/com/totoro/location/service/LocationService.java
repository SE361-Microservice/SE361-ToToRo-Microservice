package com.totoro.location.service;

import com.totoro.location.dto.ProvinceDto;
import com.totoro.location.dto.WardDto;
import com.totoro.location.repository.ProvinceRepository;
import com.totoro.location.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;

    public List<ProvinceDto> getAllProvinces() {
        return provinceRepository.findAll().stream()
                .map(p -> ProvinceDto.builder()
                        .code(p.getCode())
                        .name(p.getName())
                        .build())
                .collect(Collectors.toList());
    }

    public List<WardDto> getWardsByProvince(String provinceCode) {
        return wardRepository.findByProvinceCode(provinceCode).stream()
                .map(w -> WardDto.builder()
                        .code(w.getCode())
                        .name(w.getName())
                        .provinceCode(w.getProvince().getCode())
                        .build())
                .collect(Collectors.toList());
    }
}
