package com.totoro.location.init;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.totoro.location.entity.Province;
import com.totoro.location.entity.Ward;
import com.totoro.location.repository.ProvinceRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocationDataInitializer implements CommandLineRunner {

    private final ProvinceRepository provinceRepository;
    private final TransactionTemplate transactionTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void run(String... args) throws Exception {
        initLocations();
    }

    private void initLocations() {
        if (provinceRepository.count() > 0) {
            log.info("Locations already initialized, skipping.");
            return;
        }

        log.info("Initializing locations data from locations.json...");
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(new ClassPathResource("locations.json").getInputStream());

            // 1. Save all provinces in one transaction (small set: ~63)
            JsonNode provincesNode = rootNode.get("provinces");
            List<Province> provinceList = new ArrayList<>();
            if (provincesNode != null && provincesNode.isArray()) {
                for (JsonNode pNode : provincesNode) {
                    provinceList.add(Province.builder()
                            .code(pNode.get("code").asText())
                            .name(pNode.get("name").asText())
                            .build());
                }
            }

            transactionTemplate.executeWithoutResult(status -> {
                provinceRepository.saveAll(provinceList);
            });
            log.info("Saved {} provinces", provinceList.size());

            // 2. Build province lookup map
            Map<String, Province> provinceMap = new HashMap<>();
            for (Province p : provinceList) {
                provinceMap.put(p.getCode(), p);
            }

            // 3. Parse all wards into a flat list
            JsonNode wardsNode = rootNode.get("wards");
            if (wardsNode == null || !wardsNode.isArray()) {
                log.warn("No wards found in locations.json");
                return;
            }

            List<Ward> allWards = new ArrayList<>(10100);
            for (JsonNode wNode : wardsNode) {
                String provinceCode = wNode.get("provinceCode").asText();
                Province province = provinceMap.get(provinceCode);
                if (province == null)
                    continue;

                allWards.add(Ward.builder()
                        .code(wNode.get("code").asText())
                        .name(wNode.get("name").asText())
                        .province(province)
                        .build());
            }

            // 4. Insert wards in chunked mini-transactions of 500
            int chunkSize = 500;
            int totalSaved = 0;
            for (int i = 0; i < allWards.size(); i += chunkSize) {
                int end = Math.min(i + chunkSize, allWards.size());
                List<Ward> chunk = allWards.subList(i, end);

                transactionTemplate.executeWithoutResult(status -> {
                    for (Ward w : chunk) {
                        entityManager.persist(w);
                    }
                    entityManager.flush();
                    entityManager.clear();
                });

                totalSaved += chunk.size();
                log.info("Saved wards batch: {}/{}", totalSaved, allWards.size());
            }

            log.info("Finished initializing {} wards.", totalSaved);
        } catch (Exception e) {
            log.error("Failed to initialize locations data", e);
        }
    }
}
