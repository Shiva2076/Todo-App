package com.taskmanager.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder}")
    private String folder;

    public Map<String, Object> uploadFile(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto",
                            "use_filename", true,
                            "unique_filename", true
                    )
            );
            @SuppressWarnings("unchecked")
            Map<String, Object> typedResult = (Map<String, Object>) result;
            return typedResult;
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary (publicId={}): {}", publicId, e.getMessage());
        }
    }
}
