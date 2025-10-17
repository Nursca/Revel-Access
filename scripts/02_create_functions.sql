-- Revel Platform Database Functions
-- Run this script after creating tables

-- Function to increment drop views
CREATE OR REPLACE FUNCTION increment_drop_views(drop_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE drops
  SET views = views + 1
  WHERE id = drop_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment drop unlocks
CREATE OR REPLACE FUNCTION increment_drop_unlocks(drop_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE drops
  SET unlocks = unlocks + 1
  WHERE id = drop_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get creator stats
CREATE OR REPLACE FUNCTION get_creator_stats(creator_addr TEXT)
RETURNS TABLE (
  total_drops BIGINT,
  total_views BIGINT,
  total_unlocks BIGINT,
  active_drops BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_drops,
    COALESCE(SUM(views), 0)::BIGINT as total_views,
    COALESCE(SUM(unlocks), 0)::BIGINT as total_unlocks,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_drops
  FROM drops
  WHERE creator_address = creator_addr;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform stats (for admin)
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_creators BIGINT,
  total_fans BIGINT,
  total_drops BIGINT,
  total_unlocks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users)::BIGINT as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'creator')::BIGINT as total_creators,
    (SELECT COUNT(*) FROM users WHERE role = 'fan')::BIGINT as total_fans,
    (SELECT COUNT(*) FROM drops)::BIGINT as total_drops,
    (SELECT COUNT(*) FROM unlocks)::BIGINT as total_unlocks;
END;
$$ LANGUAGE plpgsql;
