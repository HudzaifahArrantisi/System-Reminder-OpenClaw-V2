CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  meeting_id UUID REFERENCES course_meetings(id),
  lecturer_user_id UUID NOT NULL REFERENCES users(id),
  session_code TEXT NOT NULL UNIQUE,
  qr_token TEXT NOT NULL UNIQUE,
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  status attendance_session_status_enum NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (closes_at > opens_at)
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_lookup ON attendance_sessions(course_id, status, opens_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES attendance_sessions(id),
  student_user_id UUID NOT NULL REFERENCES users(id),
  attendance_status attendance_status_enum NOT NULL DEFAULT 'present',
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (session_id, student_user_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_session ON attendance_records(student_user_id, session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_session_status ON attendance_records(session_id, attendance_status) WHERE deleted_at IS NULL;
