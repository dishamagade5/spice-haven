ALTER TABLE orders
    ADD COLUMN razorpay_order_id VARCHAR(100) NULL,
    ADD COLUMN razorpay_payment_id VARCHAR(100) NULL,
    ADD UNIQUE KEY uk_orders_razorpay_order_id (razorpay_order_id),
    ADD UNIQUE KEY uk_orders_razorpay_payment_id (razorpay_payment_id);
