-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Enums
CREATE TYPE availability_enum AS ENUM (
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
);

CREATE TYPE partner_role_enum AS ENUM (
  'Co-Founder',
  'Advisor',
  'Investor',
  'Mentor'
);

-- 2. Timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
  RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. users table
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(50)  UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  is_admin        BOOLEAN     NOT NULL DEFAULT FALSE,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  about           TEXT,
  availability    availability_enum,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  city            VARCHAR(100),
  country         VARCHAR(100)
);

-- 3a. users.updated_at trigger
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_timestamp();


-- 5. user_educations
CREATE TABLE user_educations (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL
                 REFERENCES users(id)
                 ON DELETE CASCADE,
  institution  VARCHAR(255) NOT NULL
);

-- 6. skills & user_skills
CREATE TABLE skills (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_skills (
  user_id  INTEGER NOT NULL
             REFERENCES users(id)
             ON DELETE CASCADE,
  skill_id INTEGER NOT NULL
             REFERENCES skills(id)
             ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

-- 7. industries & user_industries
CREATE TABLE industries (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_industries (
  user_id      INTEGER NOT NULL
                  REFERENCES users(id)
                  ON DELETE CASCADE,
  industry_id  INTEGER NOT NULL
                  REFERENCES industries(id)
                  ON DELETE CASCADE,
  PRIMARY KEY (user_id, industry_id)
);

-- 8. ideas table
CREATE TABLE ideas (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL
                       REFERENCES users(id)
                       ON DELETE CASCADE,
  title              VARCHAR(200)   NOT NULL,
  short_desc         VARCHAR(500),
  long_desc          TEXT,
  problem_statement  TEXT,
  solution_summary   TEXT,
  target_market      VARCHAR(200),
  stage              VARCHAR(50),
  embedding          vector(1536),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 8a. ideas.updated_at trigger
CREATE TRIGGER trg_ideas_updated
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE PROCEDURE update_timestamp();

-- 8b. vector index for semantic search
CREATE INDEX idx_ideas_embedding
  ON ideas
  USING ivfflat (embedding vector_cosine_ops);

-- 9. tags, idea_tags, user_tags
CREATE TABLE tags (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE idea_tags (
  idea_id  INTEGER NOT NULL
               REFERENCES ideas(id)
               ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL
               REFERENCES tags(id)
               ON DELETE CASCADE,
  PRIMARY KEY (idea_id, tag_id)
);

CREATE TABLE user_tags (
  user_id  INTEGER NOT NULL
               REFERENCES users(id)
               ON DELETE CASCADE,
  tag_id   INTEGER NOT NULL
               REFERENCES tags(id)
               ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);

-- 10. user_preferences
CREATE TABLE user_preferences (
  user_id             INTEGER NOT NULL
                          REFERENCES users(id)
                          ON DELETE CASCADE,
  desired_role        partner_role_enum[] NOT NULL DEFAULT ARRAY[]::partner_role_enum[],
  min_experience_years INTEGER,
  geographic_preference VARCHAR(100),
  PRIMARY KEY (user_id)
);

-- -- 11. Optional view for full profiles
CREATE VIEW user_profiles AS
SELECT
  u.id,
  u.username,
  u.email,
  u.first_name,
  u.last_name,
  (u.first_name || ' ' || u.last_name) AS full_name,
  u.is_admin,
  u.about,
  u.availability,
  u.city,
  u.country,
  u.created_at,
  u.updated_at
FROM users u;
