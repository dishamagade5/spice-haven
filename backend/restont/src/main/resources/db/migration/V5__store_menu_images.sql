SET @menu_image_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'menu'
       AND column_name = 'image_file_name') = 0,
    'ALTER TABLE menu ADD COLUMN image_file_name VARCHAR(255)',
    'SELECT 1'
);
PREPARE menu_image_migration_stmt FROM @menu_image_migration_sql;
EXECUTE menu_image_migration_stmt;
DEALLOCATE PREPARE menu_image_migration_stmt;

SET @menu_image_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'menu'
       AND column_name = 'image_url') > 0,
    'ALTER TABLE menu DROP COLUMN image_url',
    'SELECT 1'
);
PREPARE menu_image_migration_stmt FROM @menu_image_migration_sql;
EXECUTE menu_image_migration_stmt;
DEALLOCATE PREPARE menu_image_migration_stmt;

CREATE TABLE IF NOT EXISTS menu_image (
    menu_id BIGINT NOT NULL,
    image_data LONGBLOB NOT NULL,
    content_type VARCHAR(32) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (menu_id),
    CONSTRAINT fk_menu_image_menu FOREIGN KEY (menu_id) REFERENCES menu(menu_id)
) ENGINE=InnoDB;
