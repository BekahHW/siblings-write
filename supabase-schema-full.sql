-- One Word Story Database Schema for Supabase (PostgreSQL)
-- Phase 1: Authentication + Real-time + Core Gameplay
-- Run this in your Supabase SQL Editor: https://app.supabase.com

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  total_words INTEGER DEFAULT 0,
  total_stories INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_contribution_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- ============================================================================
-- STORIES
-- ============================================================================

-- Story themes for daily prompts
CREATE TYPE story_theme AS ENUM (
  'mystery',      -- Monday
  'time_travel',  -- Tuesday
  'whimsical',    -- Wednesday
  'thriller',     -- Thursday
  'fantasy',      -- Friday
  'sci_fi',       -- Saturday
  'slice_of_life' -- Sunday
);

-- Story status
CREATE TYPE story_status AS ENUM (
  'active',
  'wrap_up',
  'published'
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id BIGSERIAL PRIMARY KEY,
  story_id UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
  title TEXT,
  theme story_theme,
  status story_status NOT NULL DEFAULT 'active',
  word_count INTEGER NOT NULL DEFAULT 0,
  max_words INTEGER NOT NULL DEFAULT 900,
  last_contributor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  votes INTEGER DEFAULT 0,
  is_story_of_week BOOLEAN DEFAULT false,
  is_monthly_winner BOOLEAN DEFAULT false
);

-- ============================================================================
-- CONTRIBUTIONS (Words)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contributions (
  id BIGSERIAL PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(story_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  word_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, word_position)
);

-- ============================================================================
-- BADGES & AWARDS
-- ============================================================================

CREATE TYPE badge_type AS ENUM (
  'contributor',
  'top_author',
  'story_of_week',
  'monthly_winner',
  'streak_7',
  'streak_30',
  'streak_100',
  'word_count_100',
  'word_count_500',
  'word_count_1000'
);

CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type badge_type NOT NULL,
  story_id UUID REFERENCES stories(story_id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_type, story_id)
);

-- ============================================================================
-- VOTING
-- ============================================================================

CREATE TABLE IF NOT EXISTS story_votes (
  id BIGSERIAL PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES stories(story_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TYPE notification_type AS ENUM (
  'your_turn',
  'new_word_after_yours',
  'story_wrap_up_warning',
  'story_published',
  'story_upvoted',
  'story_trending',
  'badge_earned',
  'theme_reminder',
  'monthly_voting_open',
  'announcement'
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  story_id UUID REFERENCES stories(story_id) ON DELETE CASCADE,
  badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- UPGRADES & PURCHASES
-- ============================================================================

CREATE TYPE upgrade_type AS ENUM (
  'multi_word',
  'story_extension',
  'word_edit',
  'membership'
);

CREATE TABLE IF NOT EXISTS user_upgrades (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  upgrade_type upgrade_type NOT NULL,
  story_id UUID REFERENCES stories(story_id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_payment_id TEXT
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_theme ON stories(theme);
CREATE INDEX IF NOT EXISTS idx_contributions_story ON contributions(story_id, word_position);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_story_votes_story ON story_votes(story_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for stories
DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get current day's theme
CREATE OR REPLACE FUNCTION get_todays_theme()
RETURNS story_theme AS $$
BEGIN
  RETURN CASE EXTRACT(DOW FROM CURRENT_DATE)
    WHEN 1 THEN 'mystery'::story_theme
    WHEN 2 THEN 'time_travel'::story_theme
    WHEN 3 THEN 'whimsical'::story_theme
    WHEN 4 THEN 'thriller'::story_theme
    WHEN 5 THEN 'fantasy'::story_theme
    WHEN 6 THEN 'sci_fi'::story_theme
    WHEN 0 THEN 'slice_of_life'::story_theme
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats after contribution
CREATE OR REPLACE FUNCTION update_user_stats_after_contribution()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_words = total_words + 1,
    last_contribution_date = CURRENT_DATE,
    current_streak = CASE
      WHEN last_contribution_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
      WHEN last_contribution_date = CURRENT_DATE THEN current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(longest_streak, CASE
      WHEN last_contribution_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
      WHEN last_contribution_date = CURRENT_DATE THEN current_streak
      ELSE 1
    END)
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_stats ON contributions;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_contribution();

-- Function to update story vote count
CREATE OR REPLACE FUNCTION update_story_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stories SET votes = votes + 1 WHERE story_id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stories SET votes = votes - 1 WHERE story_id = OLD.story_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vote_count ON story_votes;
CREATE TRIGGER trigger_update_vote_count
  AFTER INSERT OR DELETE ON story_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_vote_count();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_upgrades ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, but only update their own
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories: Everyone can read, authenticated can create
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
CREATE POLICY "Stories are viewable by everyone" ON stories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create stories" ON stories;
CREATE POLICY "Authenticated users can create stories" ON stories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "System can update stories" ON stories;
CREATE POLICY "System can update stories" ON stories
  FOR UPDATE USING (true);

-- Contributions: Everyone can read, authenticated can create
DROP POLICY IF EXISTS "Contributions are viewable by everyone" ON contributions;
CREATE POLICY "Contributions are viewable by everyone" ON contributions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create contributions" ON contributions;
CREATE POLICY "Authenticated users can create contributions" ON contributions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Badges: Everyone can read
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can insert badges" ON badges;
CREATE POLICY "System can insert badges" ON badges
  FOR INSERT WITH CHECK (true);

-- Votes: Everyone can read, authenticated can vote
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON story_votes;
CREATE POLICY "Votes are viewable by everyone" ON story_votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can vote" ON story_votes;
CREATE POLICY "Authenticated users can vote" ON story_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON story_votes;
CREATE POLICY "Users can delete own votes" ON story_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications: Users can only see their own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Upgrades: Users can only see their own
DROP POLICY IF EXISTS "Users can view own upgrades" ON user_upgrades;
CREATE POLICY "Users can view own upgrades" ON user_upgrades
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create upgrades" ON user_upgrades;
CREATE POLICY "System can create upgrades" ON user_upgrades
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE contributions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE story_votes;

-- ============================================================================
-- INITIAL DATA & COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with stats and streaks';
COMMENT ON TABLE stories IS 'Collaborative stories with themes and voting';
COMMENT ON TABLE contributions IS 'Individual words contributed to stories';
COMMENT ON TABLE badges IS 'User achievements and awards';
COMMENT ON TABLE story_votes IS 'User votes for published stories';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE user_upgrades IS 'Purchased upgrades and memberships';

-- ============================================================================
-- HELPER FUNCTIONS FOR VOTING
-- ============================================================================

-- Increment story votes
CREATE OR REPLACE FUNCTION increment_story_votes(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories
  SET votes = votes + 1
  WHERE story_id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement story votes
CREATE OR REPLACE FUNCTION decrement_story_votes(story_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories
  SET votes = GREATEST(votes - 1, 0)
  WHERE story_id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
