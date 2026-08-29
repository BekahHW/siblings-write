-- One Word Story Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Story table: stores the current and archived stories
CREATE TABLE IF NOT EXISTS story (
  id BIGSERIAL PRIMARY KEY,
  story_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  words TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  last_contributor_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Contributors table: stores contributor information
CREATE TABLE IF NOT EXISTS contributors (
  contributor_id TEXT PRIMARY KEY,
  name TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contributions table: stores individual word submissions
CREATE TABLE IF NOT EXISTS contributions (
  id BIGSERIAL PRIMARY KEY,
  story_id UUID NOT NULL,
  contributor_id TEXT NOT NULL,
  word TEXT NOT NULL,
  word_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (story_id) REFERENCES story(story_id) ON DELETE CASCADE,
  FOREIGN KEY (contributor_id) REFERENCES contributors(contributor_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_active ON story(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_story_story_id ON story(story_id);
CREATE INDEX IF NOT EXISTS idx_contributions_story ON contributions(story_id);
CREATE INDEX IF NOT EXISTS idx_contributions_contributor ON contributions(contributor_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_story_updated_at ON story;
CREATE TRIGGER update_story_updated_at
  BEFORE UPDATE ON story
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contributors_updated_at ON contributors;
CREATE TRIGGER update_contributors_updated_at
  BEFORE UPDATE ON contributors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Enable for all tables
ALTER TABLE story ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (authenticated and anon users)
-- You can refine these based on your security needs

-- Story policies
DROP POLICY IF EXISTS "Allow read access to story" ON story;
CREATE POLICY "Allow read access to story" ON story
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to story" ON story;
CREATE POLICY "Allow insert access to story" ON story
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to story" ON story;
CREATE POLICY "Allow update access to story" ON story
  FOR UPDATE USING (true);

-- Contributors policies
DROP POLICY IF EXISTS "Allow read access to contributors" ON contributors;
CREATE POLICY "Allow read access to contributors" ON contributors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to contributors" ON contributors;
CREATE POLICY "Allow insert access to contributors" ON contributors
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to contributors" ON contributors;
CREATE POLICY "Allow update access to contributors" ON contributors
  FOR UPDATE USING (true);

-- Contributions policies
DROP POLICY IF EXISTS "Allow read access to contributions" ON contributions;
CREATE POLICY "Allow read access to contributions" ON contributions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to contributions" ON contributions;
CREATE POLICY "Allow insert access to contributions" ON contributions
  FOR INSERT WITH CHECK (true);

-- Optional: Create a view for getting contributor counts per story
CREATE OR REPLACE VIEW story_contributor_counts AS
SELECT
  story_id,
  COUNT(DISTINCT contributor_id) as contributor_count,
  COUNT(*) as total_contributions
FROM contributions
GROUP BY story_id;

-- Comment the tables for documentation
COMMENT ON TABLE story IS 'Stores collaborative one-word stories';
COMMENT ON TABLE contributors IS 'Stores information about story contributors';
COMMENT ON TABLE contributions IS 'Stores individual word contributions to stories';
COMMENT ON COLUMN story.is_active IS 'Only one story should be active at a time';
COMMENT ON COLUMN story.word_count IS 'Total number of words in the story';
