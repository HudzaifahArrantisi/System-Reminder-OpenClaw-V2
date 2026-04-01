CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  users_has_role_code BOOLEAN;
  courses_has_lecturer_user_id BOOLEAN;
BEGIN
  -- If legacy tables from the old stack still exist, move them so v2 tables can be created safely.
  IF to_regclass('public.users') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'role_code'
    )
    INTO users_has_role_code;

    IF NOT users_has_role_code AND to_regclass('public.users_legacy') IS NULL THEN
      ALTER TABLE public.users RENAME TO users_legacy;
    END IF;
  END IF;

  IF to_regclass('public.courses') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'courses'
        AND column_name = 'lecturer_user_id'
    )
    INTO courses_has_lecturer_user_id;

    IF NOT courses_has_lecturer_user_id AND to_regclass('public.courses_legacy') IS NULL THEN
      ALTER TABLE public.courses RENAME TO courses_legacy;
    END IF;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type_enum') THEN
    CREATE TYPE content_type_enum AS ENUM ('material', 'task');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status_enum') THEN
    CREATE TYPE attendance_status_enum AS ENUM ('present', 'late', 'excused', 'absent');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_session_status_enum') THEN
    CREATE TYPE attendance_session_status_enum AS ENUM ('scheduled', 'open', 'closed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status_enum') THEN
    CREATE TYPE enrollment_status_enum AS ENUM ('active', 'dropped', 'completed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status_enum') THEN
    CREATE TYPE submission_status_enum AS ENUM ('submitted', 'late', 'graded', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum') THEN
    CREATE TYPE invoice_status_enum AS ENUM ('pending', 'paid', 'cancelled', 'overdue');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
    CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
    CREATE TYPE payment_method_enum AS ENUM ('va', 'bank_transfer', 'ewallet', 'cash', 'other');
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
