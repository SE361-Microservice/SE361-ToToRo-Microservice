-- V7__create_community_post_likes.sql
-- Table for tracking likes on community posts (one like per user per post)

CREATE TABLE IF NOT EXISTS community_post_likes (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES user_cache(id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_community_post_likes_post_user UNIQUE (post_id, user_id)
);

-- Index for fast count queries per post
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id ON community_post_likes(post_id);

-- Index for checking if a specific user liked a post
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id ON community_post_likes(user_id);
