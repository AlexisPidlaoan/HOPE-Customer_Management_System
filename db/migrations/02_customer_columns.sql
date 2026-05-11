-- Add record_status and stamp columns to customer table only
ALTER TABLE customer
ADD COLUMN record_status VARCHAR(10) DEFAULT 'ACTIVE',
ADD COLUMN stamp VARCHAR(60);