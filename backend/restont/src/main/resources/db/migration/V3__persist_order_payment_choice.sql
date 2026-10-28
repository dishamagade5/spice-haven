SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'orders'
       AND column_name = 'payment_method') = 0,
    'ALTER TABLE orders ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT ''PAY_AT_COUNTER''',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;

SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'orders'
       AND column_name = 'payment_status') = 0,
    'ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT ''UNPAID''',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;
