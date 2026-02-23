-- Migration v2: Add new columns for TCGdex integration
-- Use CASCADE to handle foreign key constraints

-- Step 1: Clear cards table and all dependent tables via CASCADE
TRUNCATE cards CASCADE;

-- Step 2: Add new columns to cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS set_id text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS boosters text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tcgdex_updated_at timestamptz;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Step 3: Create index on set_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);

-- Step 4: Add a policy to allow service role full access for sync
-- Drop existing policy if it exists to avoid conflict
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cards' AND policyname = 'Service role can manage cards'
  ) THEN
    DROP POLICY "Service role can manage cards" ON cards;
  END IF;
END
$$;

CREATE POLICY "Service role can manage cards" ON cards
  FOR ALL
  USING (true)
  WITH CHECK (true);
