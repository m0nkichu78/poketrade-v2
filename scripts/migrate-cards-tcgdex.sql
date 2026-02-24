-- Migration: Add new columns for TCGdex integration
-- Step 1: Clear dependent tables (card IDs will change)
TRUNCATE trade_listings;
TRUNCATE wishlists;
TRUNCATE cards;

-- Step 2: Add new columns
ALTER TABLE cards ADD COLUMN IF NOT EXISTS set_id text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS boosters text;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tcgdex_updated_at timestamptz;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Step 3: Create index on set_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_cards_set_id ON cards(set_id);

-- Step 4: Allow the service role to insert/update cards
CREATE POLICY "Service role can manage cards" ON cards
  FOR ALL
  USING (true)
  WITH CHECK (true);
