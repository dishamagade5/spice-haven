SET @spicehaven_migration_sql = IF(
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'menu'
       AND column_name = 'is_featured') = 0,
    'ALTER TABLE menu ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT 1'
);
PREPARE spicehaven_migration_stmt FROM @spicehaven_migration_sql;
EXECUTE spicehaven_migration_stmt;
DEALLOCATE PREPARE spicehaven_migration_stmt;
