-- V4__update_notifications_table.sql
-- Fix columns of notifications table to match JPA entity Notification class

ALTER TABLE notifications RENAME COLUMN content TO body;
ALTER TABLE notifications RENAME COLUMN related_id TO ref_id;
ALTER TABLE notifications ADD COLUMN ref_type VARCHAR(20);
