-- SOUNDLAB untuk Neon PostgreSQL.
-- Aman dijalankan kembali; tabel dan data yang sudah ada tidak dihapus.
-- Semua hak akses diperiksa oleh API server, bukan berdasarkan role di browser.

CREATE TABLE IF NOT EXISTS soundlab_users (
  id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'siswa'
    CHECK (role IN ('siswa', 'guru', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS soundlab_experiments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES soundlab_users(id) ON DELETE CASCADE,
  lab SMALLINT NOT NULL CHECK (lab BETWEEN 1 AND 4),
  summary VARCHAR(400) NOT NULL,
  result VARCHAR(400) NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculations JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soundlab_experiments_user_time
  ON soundlab_experiments (user_id, timestamp DESC);

-- Kelas dibuat oleh guru. Siswa bergabung dengan kode yang guru bagikan.
CREATE TABLE IF NOT EXISTS soundlab_classes (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES soundlab_users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  join_code VARCHAR(24) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_soundlab_classes_teacher
  ON soundlab_classes (teacher_id, created_at DESC);

-- Seorang siswa dapat mengikuti lebih dari satu kelas.
CREATE TABLE IF NOT EXISTS soundlab_class_students (
  class_id UUID NOT NULL REFERENCES soundlab_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES soundlab_users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_soundlab_class_students_student
  ON soundlab_class_students (student_id);
