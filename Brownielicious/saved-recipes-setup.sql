-- Run this to add saved_recipes table (only if users table already exists)

-- Create saved_recipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL,
  recipe_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Enable Row Level Security
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Saved recipes policies
DROP POLICY IF EXISTS "Users can read own saved recipes" ON saved_recipes;
CREATE POLICY "Users can read own saved recipes" 
  ON saved_recipes FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved recipes" ON saved_recipes;
CREATE POLICY "Users can insert own saved recipes" 
  ON saved_recipes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved recipes" ON saved_recipes;
CREATE POLICY "Users can delete own saved recipes" 
  ON saved_recipes FOR DELETE 
  USING (auth.uid() = user_id);

