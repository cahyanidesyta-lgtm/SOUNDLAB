-- Jalankan sekali melalui Neon SQL Editor.
CREATE TABLE IF NOT EXISTS soundlab_users (
  id UUID PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'siswa' CHECK (role IN ('siswa','guru','admin')),
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
CREATE INDEX IF NOT EXISTS idx_soundlab_experiments_user_time ON soundlab_experiments(user_id,timestamp DESC);
