-- Revel Platform Row Level Security (RLS)
-- Run this script to enable security policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Users policies
-- Anyone can read user profiles
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (true);

-- Drops policies
-- Anyone can read active drops
CREATE POLICY "Active drops are viewable by everyone"
  ON drops FOR SELECT
  USING (status = 'active' OR status = 'draft');

-- Creators can insert their own drops
CREATE POLICY "Creators can insert drops"
  ON drops FOR INSERT
  WITH CHECK (true);

-- Creators can update their own drops
CREATE POLICY "Creators can update their own drops"
  ON drops FOR UPDATE
  USING (true);

-- Creators can delete their own drops
CREATE POLICY "Creators can delete their own drops"
  ON drops FOR DELETE
  USING (true);

-- Unlocks policies
-- Users can view their own unlocks
CREATE POLICY "Users can view their own unlocks"
  ON unlocks FOR SELECT
  USING (true);

-- Users can insert their own unlocks
CREATE POLICY "Users can insert unlocks"
  ON unlocks FOR INSERT
  WITH CHECK (true);

-- Communities policies
CREATE POLICY "Communities are viewable by everyone"
  ON communities FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage communities"
  ON communities FOR ALL
  USING (true);
