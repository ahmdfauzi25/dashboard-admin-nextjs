-- Add payment proof and additional fields to topup_orders table
ALTER TABLE topup_orders 
ADD COLUMN IF NOT EXISTS payment_proof LONGTEXT NULL COMMENT 'URL or base64 of payment proof image',
ADD COLUMN IF NOT EXISTS server_id VARCHAR(255) NULL COMMENT 'Server ID for games that require it',
ADD COLUMN IF NOT EXISTS product_id INT NULL COMMENT 'Product/denomination ID',
ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50) NULL COMMENT 'Voucher code used',
ADD COLUMN IF NOT EXISTS payment_method_id INT NULL COMMENT 'Payment method ID',
ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMP NULL COMMENT 'Payment expiration time (10 minutes from order creation)',
ADD COLUMN IF NOT EXISTS notes TEXT NULL COMMENT 'Admin notes or customer notes',
ADD COLUMN IF NOT EXISTS verified_by INT NULL COMMENT 'Admin user ID who verified the payment',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP NULL COMMENT 'When payment was verified',
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL COMMENT 'When order was completed';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_proof ON topup_orders(payment_proof);
CREATE INDEX IF NOT EXISTS idx_verified_by ON topup_orders(verified_by);
CREATE INDEX IF NOT EXISTS idx_completed_at ON topup_orders(completed_at);

