-- V9__fix_swipe_directions.sql
-- Fix direction values in roommate_swipes to match SwipeDirection enum (LEFT/RIGHT instead of DISLIKE/LIKE)
UPDATE roommate_swipes SET direction = 'RIGHT' WHERE direction = 'LIKE';
UPDATE roommate_swipes SET direction = 'LEFT' WHERE direction = 'DISLIKE';
