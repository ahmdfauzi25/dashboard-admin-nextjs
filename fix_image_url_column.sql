-- Fix image_url column to support base64 encoded images
-- VARCHAR(500) is too small for base64 images, need LONGTEXT

ALTER TABLE messages 
MODIFY COLUMN image_url LONGTEXT;

-- Verify the change
DESCRIBE messages;
