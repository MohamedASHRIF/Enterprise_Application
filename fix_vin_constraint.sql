-- SQL script to remove NOT NULL constraint from VIN column
-- Run this against your PostgreSQL database

-- Connect to the database first, then run:
ALTER TABLE vehicles ALTER COLUMN vin DROP NOT NULL;

-- Verify the change:
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' AND column_name = 'vin';

