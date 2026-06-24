package com.totoro.listing.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    /** Use /tmp on Cloud Run (writable), or local dir for development */
    private static final String UPLOAD_DIR = System.getProperty("java.io.tmpdir") + "/uploads/general/";

    @Value("${app.base-url:}")
    private String baseUrl;

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tệp tải lên không hợp lệ"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ cho phép tệp ảnh"));
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID() + extension;
            Files.copy(file.getInputStream(), uploadPath.resolve(newFilename));

            // Build full URL for serving the image
            String imageUrl;
            if (baseUrl != null && !baseUrl.isBlank()) {
                imageUrl = baseUrl + "/uploads/general/" + newFilename;
            } else {
                imageUrl = "/uploads/general/" + newFilename;
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Không thể tải ảnh lên: " + e.getMessage()));
        }
    }
}
