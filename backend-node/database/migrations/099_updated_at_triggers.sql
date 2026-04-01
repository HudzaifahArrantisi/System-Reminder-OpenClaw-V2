DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_mahasiswa_profiles_set_updated_at ON mahasiswa_profiles;
CREATE TRIGGER trg_mahasiswa_profiles_set_updated_at BEFORE UPDATE ON mahasiswa_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_dosen_profiles_set_updated_at ON dosen_profiles;
CREATE TRIGGER trg_dosen_profiles_set_updated_at BEFORE UPDATE ON dosen_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_admin_profiles_set_updated_at ON admin_profiles;
CREATE TRIGGER trg_admin_profiles_set_updated_at BEFORE UPDATE ON admin_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ortu_profiles_set_updated_at ON ortu_profiles;
CREATE TRIGGER trg_ortu_profiles_set_updated_at BEFORE UPDATE ON ortu_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ukm_profiles_set_updated_at ON ukm_profiles;
CREATE TRIGGER trg_ukm_profiles_set_updated_at BEFORE UPDATE ON ukm_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ormawa_profiles_set_updated_at ON ormawa_profiles;
CREATE TRIGGER trg_ormawa_profiles_set_updated_at BEFORE UPDATE ON ormawa_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_courses_set_updated_at ON courses;
CREATE TRIGGER trg_courses_set_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_course_enrollments_set_updated_at ON course_enrollments;
CREATE TRIGGER trg_course_enrollments_set_updated_at BEFORE UPDATE ON course_enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_course_meetings_set_updated_at ON course_meetings;
CREATE TRIGGER trg_course_meetings_set_updated_at BEFORE UPDATE ON course_meetings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_learning_contents_set_updated_at ON learning_contents;
CREATE TRIGGER trg_learning_contents_set_updated_at BEFORE UPDATE ON learning_contents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_task_submissions_set_updated_at ON task_submissions;
CREATE TRIGGER trg_task_submissions_set_updated_at BEFORE UPDATE ON task_submissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_task_grades_set_updated_at ON task_grades;
CREATE TRIGGER trg_task_grades_set_updated_at BEFORE UPDATE ON task_grades FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_sessions_set_updated_at ON attendance_sessions;
CREATE TRIGGER trg_attendance_sessions_set_updated_at BEFORE UPDATE ON attendance_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_attendance_records_set_updated_at ON attendance_records;
CREATE TRIGGER trg_attendance_records_set_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_set_updated_at ON posts;
CREATE TRIGGER trg_posts_set_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_post_comments_set_updated_at ON post_comments;
CREATE TRIGGER trg_post_comments_set_updated_at BEFORE UPDATE ON post_comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ukt_invoices_set_updated_at ON ukt_invoices;
CREATE TRIGGER trg_ukt_invoices_set_updated_at BEFORE UPDATE ON ukt_invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ukt_payments_set_updated_at ON ukt_payments;
CREATE TRIGGER trg_ukt_payments_set_updated_at BEFORE UPDATE ON ukt_payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
