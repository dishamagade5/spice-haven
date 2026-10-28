package com.spicehaven.service;

import com.spicehaven.dto.Dto.*;
import com.spicehaven.entity.Menu;
import com.spicehaven.entity.MenuImage;
import com.spicehaven.exception.ApiExceptions;
import com.spicehaven.repository.MenuRepository;
import com.spicehaven.repository.MenuImageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {
    private static final Logger logger = LoggerFactory.getLogger(MenuService.class);
    private final MenuRepository repo;
    private final MenuImageRepository imageRepo;
    private final MenuImageStorage imageStorage;

    /**
     * Whole menu (sold-out items included, flagged by isAvailable). Cached; evicted
     * on every admin change.
     */
    @Cacheable("public-menu")
    @Transactional(readOnly = true)
    public List<PublicMenuResponse> list() {
        return repo.findByDeletedFalseOrderByMenuIdAsc().stream().map(PublicMenuResponse::from).toList();
    }

    @Cacheable("admin-menu")
    @Transactional(readOnly = true)
    public List<MenuResponse> listAdmin() {
        return repo.findByDeletedFalseOrderByMenuIdAsc().stream().map(MenuResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PublicMenuResponse> byCategory(String category) {
        return repo.findByCategoryAndDeletedFalseOrderByMenuIdAsc(category).stream().map(PublicMenuResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PublicMenuResponse get(Long id) {
        return PublicMenuResponse.from(find(id));
    }

    @Transactional(readOnly = true)
    public MenuImage getImage(Long id) {
        find(id);
        return imageRepo.findById(id)
                .orElseThrow(() -> new ApiExceptions.NotFound("Dish image not found"));
    }

    @CacheEvict(value = { "public-menu", "admin-menu" }, allEntries = true)
    @Transactional
    public MenuResponse create(MenuRequest r, MultipartFile upload) {
        MenuImageStorage.StoredImage stored = imageStorage.store(upload);
        try {
            Menu m = apply(new Menu(), r);
            m.setImageFileName(stored.fileName());
            Menu saved = repo.saveAndFlush(m);
            imageRepo.save(toEntity(saved.getMenuId(), stored));
            registerImageFileChanges(null, stored.fileName());
            return MenuResponse.from(saved);
        } catch (RuntimeException | Error e) {
            deleteFileAfterFailure(stored.fileName());
            throw e;
        }
    }

    @CacheEvict(value = { "public-menu", "admin-menu" }, allEntries = true)
    @Transactional
    public MenuResponse update(Long id, MenuRequest r, MultipartFile upload) {
        Menu m = apply(find(id), r);
        String previousFileName = m.getImageFileName();
        if (upload != null && !upload.isEmpty()) {
            MenuImageStorage.StoredImage stored = imageStorage.store(upload);
            try {
                m.setImageFileName(stored.fileName());
                Menu saved = repo.saveAndFlush(m);
                imageRepo.save(toEntity(saved.getMenuId(), stored));
                registerImageFileChanges(previousFileName, stored.fileName());
                return MenuResponse.from(saved);
            } catch (RuntimeException | Error e) {
                deleteFileAfterFailure(stored.fileName());
                throw e;
            }
        }

        if (r.removeImage()) {
            m.setImageFileName(null);
            imageRepo.deleteById(id);
        }
        Menu saved = repo.save(m);
        if (r.removeImage()) {
            registerImageFileChanges(previousFileName, null);
        }
        return MenuResponse.from(saved);
    }

    @CacheEvict(value = { "public-menu", "admin-menu" }, allEntries = true)
    @Transactional
    public MenuResponse updatePrice(Long id, BigDecimal price) {
        Menu m = find(id);
        m.setPrice(price);
        return MenuResponse.from(repo.save(m));
    }

    @CacheEvict(value = { "public-menu", "admin-menu" }, allEntries = true)
    @Transactional
    public MenuResponse setAvailable(Long id, boolean available) {
        Menu m = find(id);
        m.setAvailable(available);
        return MenuResponse.from(repo.save(m));
    }

    /** Soft delete: ordered items must stay referenced by old orders. */
    @CacheEvict(value = { "public-menu", "admin-menu" }, allEntries = true)
    @Transactional
    public void softDelete(Long id) {
        Menu m = find(id);
        String previousFileName = m.getImageFileName();
        m.setDeleted(true);
        m.setImageFileName(null);
        imageRepo.deleteById(id);
        repo.save(m);
        registerImageFileChanges(previousFileName, null);
    }

    private Menu find(Long id) {
        return repo.findById(id).filter(m -> !m.isDeleted())
                .orElseThrow(() -> new ApiExceptions.NotFound("Menu item " + id + " not found"));
    }

    private Menu apply(Menu m, MenuRequest r) {
        m.setItemName(r.name().trim());
        m.setCategory(r.category().trim());
        m.setDescription(r.description());
        m.setCostPrice(r.costPrice());
        m.setPrice(r.price());
        m.setAvailable(r.isAvailable());
        m.setFeatured(r.isFeatured());
        return m;
    }

    private MenuImage toEntity(Long menuId, MenuImageStorage.StoredImage stored) {
        MenuImage image = new MenuImage();
        image.setMenuId(menuId);
        image.setData(stored.data());
        image.setContentType(stored.contentType());
        image.setFileName(stored.fileName());
        return image;
    }

    private void registerImageFileChanges(String previousFileName, String newFileName) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_COMMITTED) {
                    deleteFileAfterFailure(previousFileName);
                } else {
                    deleteFileAfterFailure(newFileName);
                }
            }
        });
    }

    private void deleteFileAfterFailure(String fileName) {
        if (fileName == null) {
            return;
        }
        try {
            imageStorage.delete(fileName);
        } catch (IOException e) {
            logger.warn("Could not remove dish image file {}", fileName, e);
        }
    }
}
