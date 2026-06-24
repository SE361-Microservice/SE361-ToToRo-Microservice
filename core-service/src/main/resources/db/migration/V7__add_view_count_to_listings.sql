-- V7: Add view_count column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count BIGINT NOT NULL DEFAULT 0;
