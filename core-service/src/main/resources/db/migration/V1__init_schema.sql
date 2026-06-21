-- V1__init_schema.sql

CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    room_type VARCHAR(50) NOT NULL,
    area_m2 DECIMAL(6, 2),
    price_rent BIGINT NOT NULL,
    price_electricity BIGINT,
    price_water BIGINT,
    price_management BIGINT,
    price_parking BIGINT,
    status VARCHAR(30) NOT NULL,
    is_shared_owner BOOLEAN NOT NULL DEFAULT FALSE,
    max_occupants SMALLINT,
    available_from DATE,
    landlord_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE listing_facilities (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE listing_images (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    order_index INT NOT NULL
);

CREATE TABLE listing_policies (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    deposit DECIMAL(15, 2),
    electricity_price DECIMAL(10, 2),
    water_price DECIMAL(10, 2),
    min_lease_term INT
);

CREATE TABLE saved_listings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, listing_id)
);

CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE listing_tags (
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, tag_id)
);

CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    rating_overall SMALLINT NOT NULL,
    rating_cleanliness SMALLINT,
    rating_security SMALLINT,
    rating_landlord SMALLINT,
    rating_accuracy SMALLINT,
    content TEXT,
    upvote_count INT DEFAULT 0,
    landlord_reply_content TEXT,
    landlord_replied_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL
);

CREATE TABLE review_sources (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE review_upvotes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    UNIQUE (review_id, user_id)
);

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(40) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by BIGINT,
    resolved_note TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
