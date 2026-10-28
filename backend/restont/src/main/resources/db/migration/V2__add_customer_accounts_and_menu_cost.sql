SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'menu'
       AND column_name = 'cost_price') = 0,
    'ALTER TABLE menu ADD COLUMN cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER description',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;

CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (customer_id),
    UNIQUE KEY uk_customer_email (email)
) ENGINE=InnoDB;

SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'orders'
       AND column_name = 'customer_id') = 0,
    'ALTER TABLE orders ADD COLUMN customer_id BIGINT NULL',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;

SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = 'orders'
       AND index_name = 'idx_orders_customer') = 0,
    'ALTER TABLE orders ADD INDEX idx_orders_customer (customer_id)',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;

SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.table_constraints
     WHERE constraint_schema = DATABASE()
       AND table_name = 'orders'
       AND constraint_name = 'fk_orders_customer'
       AND constraint_type = 'FOREIGN KEY') = 0,
    'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;
