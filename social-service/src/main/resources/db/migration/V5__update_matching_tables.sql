-- V5__update_matching_tables.sql
-- Fix columns of roommate_profiles, roommate_swipes, roommate_matches to match JPA entities

-- 1. roommate_profiles
ALTER TABLE roommate_profiles ADD COLUMN headline VARCHAR(200) NOT NULL DEFAULT '';
ALTER TABLE roommate_profiles ADD COLUMN preferred_city VARCHAR(100);
ALTER TABLE roommate_profiles ADD COLUMN age INT;
ALTER TABLE roommate_profiles ADD COLUMN gender VARCHAR(10);
ALTER TABLE roommate_profiles ALTER COLUMN preferred_districts TYPE VARCHAR(500);
ALTER TABLE roommate_profiles ADD COLUMN sleep_time VARCHAR(20);
ALTER TABLE roommate_profiles ADD COLUMN wake_time VARCHAR(20);
ALTER TABLE roommate_profiles ADD COLUMN cleanliness INT;
ALTER TABLE roommate_profiles ADD COLUMN is_smoker BOOLEAN;
ALTER TABLE roommate_profiles ADD COLUMN drinks_alcohol BOOLEAN;
ALTER TABLE roommate_profiles ADD COLUMN has_pets BOOLEAN;
ALTER TABLE roommate_profiles ADD COLUMN is_introvert BOOLEAN;
ALTER TABLE roommate_profiles ADD COLUMN ok_with_smoker BOOLEAN;
ALTER TABLE roommate_profiles ADD COLUMN ok_with_pets BOOLEAN;

-- 2. roommate_swipes
ALTER TABLE roommate_swipes RENAME COLUMN target_id TO target_user_id;
ALTER TABLE roommate_swipes ADD COLUMN direction VARCHAR(10);
UPDATE roommate_swipes SET direction = CASE WHEN is_liked = TRUE THEN 'LIKE' ELSE 'DISLIKE' END;
ALTER TABLE roommate_swipes ALTER COLUMN direction SET NOT NULL;
ALTER TABLE roommate_swipes DROP COLUMN is_liked;

-- 3. roommate_matches
ALTER TABLE roommate_matches RENAME COLUMN user1_id TO user_a_id;
ALTER TABLE roommate_matches RENAME COLUMN user2_id TO user_b_id;
