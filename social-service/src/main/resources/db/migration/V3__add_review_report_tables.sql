-- V3__add_review_report_tables.sql
-- Migrate review & report từ core-service sang social-service
-- Review sử dụng listing_cache thay vì FK sang core-db

CREATE TABLE reviews (
    id           BIGSERIAL PRIMARY KEY,
    listing_id   BIGINT       NOT NULL REFERENCES listing_cache(id) ON DELETE CASCADE,
    user_id      BIGINT       NOT NULL,
    rating_overall   SMALLINT NOT NULL,
    rating_cleanliness SMALLINT,
    rating_security  SMALLINT,
    rating_landlord  SMALLINT,
    rating_accuracy  SMALLINT,
    content      TEXT,
    upvote_count INT          NOT NULL DEFAULT 0,
    landlord_reply_content TEXT,
    landlord_replied_at    TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (listing_id, user_id)
);

CREATE INDEX idx_reviews_listing_id ON reviews (listing_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);

CREATE TABLE review_images (
    id        BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_sources (
    id        BIGSERIAL PRIMARY KEY,
    review_id BIGINT       NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    src_url   VARCHAR(500) NOT NULL,
    sort_order SMALLINT
);

CREATE TABLE review_upvotes (
    id        BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id   BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_review_upvote_user_review UNIQUE (user_id, review_id)
);

-- Reports (không phụ thuộc listing, chỉ dùng targetId kiểu Long)
CREATE TABLE reports (
    id          BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT       NOT NULL,
    target_type VARCHAR(40)  NOT NULL,
    target_id   BIGINT       NOT NULL,
    reason      VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    resolved_by BIGINT,
    resolved_note TEXT,
    resolved_at TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_status ON reports (status);
