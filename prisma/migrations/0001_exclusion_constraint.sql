-- Add exclusion constraint to prevent overlapping appointments
-- This migration should be run after the initial migration

-- Enable btree_gist extension if not already enabled
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping appointments for the same professional
-- Only applies to PENDING and CONFIRMED appointments
ALTER TABLE "Appointment"
  ADD CONSTRAINT appointment_no_overlap
  EXCLUDE USING gist (
    "professionalId" WITH =,
    tstzrange("startsAt","endsAt") WITH &&
  )
  WHERE (status IN ('PENDING','CONFIRMED'));
