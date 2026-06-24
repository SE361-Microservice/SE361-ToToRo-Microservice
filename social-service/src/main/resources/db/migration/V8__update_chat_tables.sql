-- V8__update_chat_tables.sql
-- Align chat tables with current entity definitions

-- 1. conversations: add created_by column (FK to user_cache)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by BIGINT;
ALTER TABLE conversations ADD CONSTRAINT fk_conversations_created_by
    FOREIGN KEY (created_by) REFERENCES user_cache(id) ON DELETE SET NULL;

-- 2. messages: add missing columns and remove obsolete ones
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop obsolete columns that no longer exist in the entity
ALTER TABLE messages DROP COLUMN IF EXISTS message_type;
ALTER TABLE messages DROP COLUMN IF EXISTS is_read;
