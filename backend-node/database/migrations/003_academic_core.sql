CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  lecturer_user_id UUID NOT NULL REFERENCES users(id),
  semester SMALLINT,
  academic_year TEXT,
  credits SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_courses_lecturer_active ON courses(lecturer_user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  student_user_id UUID NOT NULL REFERENCES users(id),
  status enrollment_status_enum NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (course_id, student_user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_active ON course_enrollments(student_user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS course_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  meeting_no SMALLINT NOT NULL CHECK (meeting_no BETWEEN 1 AND 18),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (course_id, meeting_no)
);

CREATE TABLE IF NOT EXISTS learning_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  meeting_id UUID NOT NULL REFERENCES course_meetings(id),
  author_user_id UUID NOT NULL REFERENCES users(id),
  content_type content_type_enum NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_url TEXT,
  attachment_url TEXT,
  due_at TIMESTAMPTZ,
  max_score NUMERIC(6,2),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CHECK (
    (content_type = 'material' AND due_at IS NULL)
    OR
    (content_type = 'task' AND due_at IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_learning_contents_feed ON learning_contents(course_id, meeting_id, content_type, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_contents_due_at ON learning_contents(due_at) WHERE content_type = 'task' AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_content_id UUID NOT NULL REFERENCES learning_contents(id),
  student_user_id UUID NOT NULL REFERENCES users(id),
  submission_text TEXT,
  file_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status submission_status_enum NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (task_content_id, student_user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_submissions_student ON task_submissions(student_user_id, submitted_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_task_submissions_task ON task_submissions(task_content_id, submitted_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS task_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES task_submissions(id),
  grader_user_id UUID NOT NULL REFERENCES users(id),
  score NUMERIC(6,2) NOT NULL CHECK (score >= 0),
  feedback TEXT,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
