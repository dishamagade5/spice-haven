package com.spicehaven.repository;

import com.spicehaven.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByDeletedFalseOrderByMenuIdAsc();

    List<Menu> findByCategoryAndDeletedFalseOrderByMenuIdAsc(String category);

    List<Menu> findAllByMenuIdInAndDeletedFalse(Collection<Long> ids);

    long countByDeletedFalse();

    long countByDeletedFalseAndAvailableTrue();
}
