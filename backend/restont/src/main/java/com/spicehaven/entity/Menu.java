package com.spicehaven.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "menu")
@Getter
@Setter
@NoArgsConstructor
public class Menu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;
    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;
    @Column(nullable = false, length = 50)
    private String category;
    @Column(length = 500)
    private String description;
    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    @Column(name = "image_file_name", length = 255)
    private String imageFileName;
    @Column(name = "is_available", nullable = false)
    private boolean available = true;
    @Column(name = "is_featured", nullable = false)
    private boolean featured = false;
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;
}
