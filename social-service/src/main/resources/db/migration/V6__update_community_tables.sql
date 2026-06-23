-- V6__update_community_tables.sql

-- 1. Update community_posts table
ALTER TABLE community_posts RENAME COLUMN user_id TO author_id;
ALTER TABLE community_posts ADD COLUMN title VARCHAR(200) NOT NULL DEFAULT 'Bài viết cộng đồng';
ALTER TABLE community_posts ADD COLUMN listing_id BIGINT;
ALTER TABLE community_posts DROP COLUMN IF EXISTS image_url;
ALTER TABLE community_posts DROP COLUMN IF EXISTS likes_count;
ALTER TABLE community_posts DROP COLUMN IF EXISTS comments_count;

-- Add foreign key constraint to user_cache
ALTER TABLE community_posts ADD CONSTRAINT fk_community_posts_author FOREIGN KEY (author_id) REFERENCES user_cache(id) ON DELETE CASCADE;

-- 2. Update community_comments table
ALTER TABLE community_comments RENAME COLUMN user_id TO author_id;
ALTER TABLE community_comments ADD COLUMN parent_id BIGINT REFERENCES community_comments(id) ON DELETE SET NULL;
ALTER TABLE community_comments ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Add foreign key constraint to user_cache
ALTER TABLE community_comments ADD CONSTRAINT fk_community_comments_author FOREIGN KEY (author_id) REFERENCES user_cache(id) ON DELETE CASCADE;
