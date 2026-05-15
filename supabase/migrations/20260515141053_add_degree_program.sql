-- Add degree_program column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS degree_program TEXT;
