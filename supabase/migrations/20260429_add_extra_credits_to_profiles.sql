-- profiles テーブルに extra_credits カラムを追加
-- 追加購入した解析枚数（当月限り・月次リセット）
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS extra_credits INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN profiles.extra_credits IS '追加購入したレシート解析枚数（当月限り、月次リセット時に0へ）';
