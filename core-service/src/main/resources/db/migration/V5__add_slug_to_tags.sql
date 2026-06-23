-- V5__add_slug_to_tags.sql
ALTER TABLE tags
    ADD COLUMN slug VARCHAR(50) NOT NULL UNIQUE;
