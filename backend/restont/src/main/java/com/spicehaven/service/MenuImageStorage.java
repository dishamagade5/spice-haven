package com.spicehaven.service;

import com.spicehaven.exception.ApiExceptions;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class MenuImageStorage {
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private final Path imageDirectory;

    public MenuImageStorage(@Value("${spicehaven.menu.image-directory:uploads/dishes}") String imageDirectory) {
        this.imageDirectory = Path.of(imageDirectory).toAbsolutePath().normalize();
    }

    public StoredImage store(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ApiExceptions.BadRequest("Choose a dish image to upload");
        }
        if (image.getSize() > MAX_IMAGE_BYTES) {
            throw new ApiExceptions.BadRequest("Dish images must be 5 MB or smaller");
        }

        try {
            byte[] data = image.getBytes();
            String contentType = detectContentType(data);
            String fileName = UUID.randomUUID() + extension(contentType);
            Files.createDirectories(imageDirectory);
            Files.write(imageDirectory.resolve(fileName), data, StandardOpenOption.CREATE_NEW);
            return new StoredImage(fileName, contentType, data);
        } catch (IOException e) {
            throw new IllegalStateException("Could not store the dish image", e);
        }
    }

    public void delete(String fileName) throws IOException {
        if (fileName != null) {
            Files.deleteIfExists(imageDirectory.resolve(fileName).normalize());
        }
    }

    private String detectContentType(byte[] data) {
        if (startsWith(data, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) {
            return "image/png";
        }
        if (startsWith(data, 0xff, 0xd8, 0xff)) {
            return "image/jpeg";
        }
        if (data.length >= 12 && ascii(data, 0, "RIFF") && ascii(data, 8, "WEBP")) {
            return "image/webp";
        }
        throw new ApiExceptions.BadRequest("Upload a valid PNG, JPEG, or WebP image");
    }

    private boolean startsWith(byte[] data, int... signature) {
        if (data.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((data[i] & 0xff) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    private boolean ascii(byte[] data, int offset, String value) {
        for (int i = 0; i < value.length(); i++) {
            if (data[offset + i] != value.charAt(i)) {
                return false;
            }
        }
        return true;
    }

    private String extension(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            default -> throw new ApiExceptions.BadRequest("Unsupported image type");
        };
    }

    public record StoredImage(String fileName, String contentType, byte[] data) {
    }
}
