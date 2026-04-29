-- profiles テーブルに顧客情報カラムを追加
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

COMMENT ON COLUMN profiles.name          IS '氏名';
COMMENT ON COLUMN profiles.phone         IS '電話番号';
COMMENT ON COLUMN profiles.address       IS '住所（任意）';
COMMENT ON COLUMN profiles.referral_code IS '申込時に入力した紹介コード';

-- OP追加購入履歴テーブル
CREATE TABLE IF NOT EXISTS credit_purchases (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits          INTEGER     NOT NULL,
  amount_yen       INTEGER     NOT NULL DEFAULT 0,
  price_id         TEXT,
  stripe_session_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE  credit_purchases              IS 'OP追加枚数の購入履歴';
COMMENT ON COLUMN credit_purchases.credits      IS '購入枚数（20/50/100/300）';
COMMENT ON COLUMN credit_purchases.amount_yen   IS '支払金額（円）';
COMMENT ON COLUMN credit_purchases.price_id     IS 'Stripe Price ID';

ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の購入履歴のみ参照可能
CREATE POLICY "own_credit_purchases_select"
  ON credit_purchases FOR SELECT
  USING (auth.uid() = user_id);
