-- Fix payment_proof column to support large base64 images
-- Base64 images can be tens of thousands of characters, so VARCHAR(500) is too small

-- First, check if column exists and its current type
-- If column is VARCHAR(500), change it to LONGTEXT
ALTER TABLE topup_orders 
MODIFY COLUMN payment_proof LONGTEXT NULL COMMENT 'URL or base64 of payment proof image';

-- Verify the change
-- DESCRIBE topup_orders;

