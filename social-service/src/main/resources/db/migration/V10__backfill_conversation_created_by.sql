-- V10__backfill_conversation_created_by.sql
-- Backfill created_by for conversations and set NOT NULL constraint

-- 1. Backfill created_by using the first member of the conversation who exists in user_cache
UPDATE conversations 
SET created_by = (
    SELECT m.user_id 
    FROM conversation_members m
    JOIN user_cache u ON m.user_id = u.id
    WHERE m.conversation_id = conversations.id 
    ORDER BY m.id ASC 
    LIMIT 1
) 
WHERE created_by IS NULL;

-- 2. Delete conversations that still have NULL created_by (orphaned or empty conversations)
DELETE FROM conversations WHERE created_by IS NULL;

-- 3. Add NOT NULL constraint
ALTER TABLE conversations ALTER COLUMN created_by SET NOT NULL;
