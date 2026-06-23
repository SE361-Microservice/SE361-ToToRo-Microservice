-- V3__update_listing_policies.sql
ALTER TABLE listing_policies
    ADD COLUMN deposit_months SMALLINT,
    ADD COLUMN contract_type VARCHAR(50),
    ADD COLUMN allows_residence_reg BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN checkin_time TIME WITHOUT TIME ZONE,
    ADD COLUMN checkout_time TIME WITHOUT TIME ZONE,
    ADD COLUMN allows_guests BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN allows_pets BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN allows_cooking BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN referral_policy TEXT,
    ADD COLUMN other_rules TEXT;
