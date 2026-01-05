-- Add account information columns to payment_methods table
ALTER TABLE payment_methods
ADD COLUMN IF NOT EXISTS account_number VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS account_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS qr_code_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS instructions TEXT NULL;

-- Example: Update existing payment methods with account info
-- UPDATE payment_methods SET account_number = '1234567890', account_name = 'PT Topupku', instructions = 'Transfer ke rekening di atas dengan nominal yang sesuai' WHERE code = 'BCA';
-- UPDATE payment_methods SET account_number = '081234567890', account_name = 'Topupku', instructions = 'Kirim ke nomor e-wallet di atas' WHERE code = 'DANA';

