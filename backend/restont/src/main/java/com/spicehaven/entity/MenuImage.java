package com.spicehaven.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "menu_image")
@Getter
@Setter
@NoArgsConstructor
public class MenuImage {
    @Id
    @Column(name = "menu_id")
    private Long menuId;

    @Lob
    @Column(name = "image_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;

    @Column(name = "content_type", nullable = false, length = 32)
    private String contentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;
}
